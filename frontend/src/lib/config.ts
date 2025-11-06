import { StartScreenPrompt } from "@openai/chatkit";

export const CHATKIT_API_URL =
  import.meta.env.VITE_CHATKIT_API_URL ?? "/chatkit";

/**
 * ChatKit still expects a domain key at runtime. Use any placeholder locally,
 * but register your production domain at
 * https://platform.openai.com/settings/organization/security/domain-allowlist
 * and deploy the real key.
 */
export const CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_localhost_dev";

export const FACTS_API_URL = import.meta.env.VITE_FACTS_API_URL ?? "/facts";

export const THEME_STORAGE_KEY = "chatkit-boilerplate-theme";

export const GREETING = "TicketBot - Let me know what's wrong and I'll get that info to the right person";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Report an issue",
    prompt: "I need to report an issue",
    icon: "circle-question",
  },
  {
    label: "Technical problem",
    prompt: "I'm having a technical problem",
    icon: "sparkle",
  },
  {
    label: "Account help",
    prompt: "I need help with my account",
    icon: "book-open",
  },
  {
    label: "General question",
    prompt: "I have a general question",
    icon: "search",
  },
];

export const PLACEHOLDER_INPUT = "Describe your issue or question...";
