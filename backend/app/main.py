"""FastAPI entrypoint wiring the ChatKit server and REST endpoints."""

from __future__ import annotations

import os
from typing import Any

from chatkit.server import StreamingResult
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from starlette.responses import JSONResponse
from openai import OpenAI

from .chat import (
    FactAssistantServer,
    create_chatkit_server,
)
from .facts import fact_store

app = FastAPI(title="ChatKit API")

# Configure CORS to allow requests from GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gatethegreat.github.io",
        "http://localhost:5170",
        "http://127.0.0.1:5170"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI client for hosted workflow
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

_chatkit_server: FactAssistantServer | None = create_chatkit_server()


def get_chatkit_server() -> FactAssistantServer:
    if _chatkit_server is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ChatKit dependencies are missing. Install the ChatKit Python "
                "package to enable the conversational endpoint."
            ),
        )
    return _chatkit_server


@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request, server: FactAssistantServer = Depends(get_chatkit_server)
) -> Response:
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


@app.get("/facts")
async def list_facts() -> dict[str, Any]:
    facts = await fact_store.list_saved()
    return {"facts": [fact.as_dict() for fact in facts]}


@app.post("/facts/{fact_id}/save")
async def save_fact(fact_id: str) -> dict[str, Any]:
    fact = await fact_store.mark_saved(fact_id)
    if fact is None:
        raise HTTPException(status_code=404, detail="Fact not found")
    return {"fact": fact.as_dict()}


@app.post("/facts/{fact_id}/discard")
async def discard_fact(fact_id: str) -> dict[str, Any]:
    fact = await fact_store.discard(fact_id)
    if fact is None:
        raise HTTPException(status_code=404, detail="Fact not found")
    return {"fact": fact.as_dict()}


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/api/chatkit/session")
async def create_chatkit_session() -> dict[str, str]:
    """Create a ChatKit session for the hosted workflow."""
    workflow_id = os.environ.get("CHATKIT_WORKFLOW_ID", "wf_68e6daaa077c8190ba4b536ae0ce309401143f1d8d969c22")

    try:
        session = openai_client.chatkit.sessions.create(
            workflow={"id": workflow_id}
        )
        return {"client_secret": session.client_secret}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ChatKit session: {str(e)}"
        )
