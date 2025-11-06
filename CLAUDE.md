# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing ChatKit sample applications built with FastAPI (Python) backends and Vite + React frontends. The repository demonstrates integration patterns for OpenAI's ChatKit SDK with three complete example applications.

**Core Architecture:**
- **Backend**: FastAPI servers using ChatKit Python SDK (`openai-chatkit`) and OpenAI Agents SDK (`openai-agents-python`)
- **Frontend**: React + TypeScript with Vite, using `@openai/chatkit-react` component
- **Communication**: Frontend proxies `/chatkit` and other API routes to backend via Vite dev server
- **Deployment**: Separate frontend/backend deployment with domain allowlisting for production

## Project Structure

```
/
├── backend/                    # Base template backend
│   └── app/
│       ├── main.py            # FastAPI app entrypoint
│       ├── chat.py            # ChatKit server setup with Agent integration
│       ├── constants.py       # System prompts and model config
│       ├── facts.py           # Fact store (demo feature)
│       ├── weather.py         # Weather widget tool
│       └── memory_store.py    # Thread memory management
├── frontend/                   # Base template frontend
│   └── src/
│       ├── main.tsx           # React entrypoint
│       ├── App.tsx            # Main UI with fact list
│       ├── lib/config.ts      # ChatKit configuration
│       └── components/        # UI components
└── examples/
    ├── customer-support/      # Airline support demo (port 8001/5171)
    ├── knowledge-assistant/   # Knowledge base demo (port 8002/5172)
    └── marketing-assets/      # Creative workflow demo (port 8003/5173)
```

Each example follows the same structure as the base template with domain-specific tools and UI.

## Development Commands

### Running from Repository Root

```bash
# Start both backend and frontend together
npm start

# Start backend only (requires uv)
npm run backend

# Start frontend only
npm run frontend
```

### Running Backend Manually

```bash
cd backend  # or examples/{example-name}/backend
uv sync
export OPENAI_API_KEY=sk-proj-...
uv run uvicorn app.main:app --reload --port 8000

# Alternative without uv:
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --port 8000
```

### Running Frontend Manually

```bash
cd frontend  # or examples/{example-name}/frontend
npm install
npm run dev
```

**Port Assignments:**
- Base template: backend 8000, frontend 5170
- Customer Support: backend 8001, frontend 5171
- Knowledge Assistant: backend 8002, frontend 5172
- Marketing Assets: backend 8003, frontend 5173

### Linting and Code Quality

**Backend (Python):**
```bash
cd backend
uv run ruff check .          # Lint
uv run ruff format .         # Format
uv run mypy app/             # Type check
```

**Frontend (TypeScript):**
```bash
cd frontend
npm run lint                  # ESLint
npm run build                 # Type check + build
```

## Key Technical Patterns

### Backend: ChatKit Server Integration

1. **Server Setup** (`app/chat.py`):
   - Instantiate `ChatKitServer` with custom agent
   - Agent built using `agents.Agent` from OpenAI Agents SDK
   - Tools defined with `@function_tool` decorator
   - Thread memory managed via `MemoryStore` class

2. **Tool Types**:
   - **Widget tools**: Return structured data for UI rendering (e.g., weather widget)
   - **Client tools**: Execute on frontend (e.g., theme switching) via `ClientToolCall`
   - **Server tools**: Execute on backend with side effects (e.g., save facts)

3. **FastAPI Endpoint** (`app/main.py:35`):
   ```python
   @app.post("/chatkit")
   async def chatkit_endpoint(request: Request, server: FactAssistantServer = Depends(get_chatkit_server)):
       payload = await request.body()
       result = await server.process(payload, {"request": request})
       # Returns StreamingResponse or JSONResponse
   ```

### Frontend: ChatKit React Component

1. **Configuration** (`src/lib/config.ts`):
   - `apiUrl`: Backend ChatKit endpoint
   - `domainKey`: From `VITE_CHATKIT_API_DOMAIN_KEY` env var
   - Client tool handlers registered here

2. **Component Usage** (`src/main.tsx`):
   ```tsx
   import { ChatKit } from '@openai/chatkit-react';
   <ChatKit
     apiUrl={config.apiUrl}
     domainKey={config.domainKey}
     onToolCall={config.onToolCall}
   />
   ```

3. **Proxy Setup** (`vite.config.ts`):
   - All `/chatkit` requests proxied to backend
   - Additional routes (e.g., `/facts`, `/support`) also proxied
   - Production domains added to `server.allowedHosts`

### Thread Memory Management

Each example uses `MemoryStore` (`app/memory_store.py`) to persist thread state:
- Thread metadata stored per `thread_id`
- Agent context (conversation history) persisted across requests
- Facts, customer data, or other state maintained in-memory

## Environment Variables

### Backend
- `OPENAI_API_KEY`: **Required** - OpenAI API key

### Frontend
- `VITE_CHATKIT_API_DOMAIN_KEY`: **Required for production** - Domain allowlist key from OpenAI Platform
  - Use any non-empty string for local development (e.g., `domain_pk_local_dev`)
  - Get real key from https://platform.openai.com/settings/organization/security/domain-allowlist
- `VITE_CHATKIT_API_URL`: Optional - Override ChatKit backend URL
- `VITE_FACTS_API_URL`: Optional - Override facts API URL (base template)
- `BACKEND_URL`: Optional - Override proxy target in `vite.config.ts`

## Adding New Tools

### 1. Define Tool Function (Backend)

In `app/chat.py` or similar:
```python
@function_tool
def my_tool(
    param: Annotated[str, "Description for model"],
) -> str:
    """Tool description shown to the model."""
    # Implementation
    return "result"
```

### 2. Register with Agent

Add to agent's `tools` list when creating the Agent instance.

### 3. For Client Tools

Return a `ClientToolCall` to execute on frontend:
```python
return ClientToolCall(name="my_client_action", input={"data": value})
```

Then register handler in frontend `src/lib/config.ts`:
```typescript
onToolCall: (toolCall) => {
  if (toolCall.name === 'my_client_action') {
    // Handle client-side action
  }
}
```

### 4. For Widget Tools

Return structured data that frontend can render as custom UI components.

## Testing

The base template includes minimal testing setup. To add tests:

**Backend:**
```bash
cd backend
uv add --dev pytest pytest-asyncio httpx
uv run pytest
```

**Frontend:**
```bash
cd frontend
# vitest already in devDependencies
npm run test  # (add script to package.json)
```

## Python Dependency Management

This project uses [uv](https://docs.astral.sh/uv/) for Python package management:
- `pyproject.toml` defines dependencies
- `uv.lock` pins exact versions
- `uv sync` installs dependencies
- `uv add <package>` adds new dependencies
- `uv run <command>` runs commands in the uv environment

Key Python dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `openai` - OpenAI Python SDK
- `openai-chatkit` - ChatKit Python SDK
- `httpx` - HTTP client for weather API calls

## Production Deployment Checklist

1. **Domain Allowlisting**:
   - Register production domain at OpenAI Platform domain allowlist page
   - Set `VITE_CHATKIT_API_DOMAIN_KEY` to generated key
   - Add domain to `vite.config.ts` `server.allowedHosts`

2. **Backend**:
   - Set `OPENAI_API_KEY` environment variable
   - Deploy FastAPI app (e.g., via Docker, serverless functions)
   - Configure CORS if frontend domain differs from backend

3. **Frontend**:
   - Build: `npm run build`
   - Deploy `dist/` folder to static hosting
   - Set backend URL via `VITE_CHATKIT_API_URL` if not using proxy

4. **Security**:
   - Never commit `OPENAI_API_KEY` to version control
   - Use environment variables for all secrets
   - Backend validates domain keys through ChatKit SDK

## Common Gotchas

- **Port conflicts**: Each example uses different ports to allow running multiple demos simultaneously
- **Environment variables**: Vite requires `VITE_` prefix and rebuild after changes
- **uv not found**: Install via `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Local development domain key**: Any non-empty string works; real key only needed for remote access
- **Thread memory**: In-memory storage means threads lost on server restart; implement persistent storage for production
- **Python path**: If backend can't find app modules, ensure running from correct directory or set `PYTHONPATH`
