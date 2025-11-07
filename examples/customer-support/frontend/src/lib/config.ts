import { StartScreenPrompt } from "@openai/chatkit";

export const THEME_STORAGE_KEY = "customer-support-theme";

const SUPPORT_API_BASE =
  import.meta.env.VITE_SUPPORT_API_BASE ?? "/support";

/**
 * ChatKit still expects a domain key at runtime. Use any placeholder locally,
 * but register your production domain at
 * https://platform.openai.com/settings/organization/security/domain-allowlist
 * and deploy the real key.
 */
export const SUPPORT_CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_SUPPORT_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_localhost_dev";

export const SUPPORT_CHATKIT_API_URL =
  import.meta.env.VITE_SUPPORT_CHATKIT_API_URL ??
  `${SUPPORT_API_BASE}/chatkit`;

export const SUPPORT_CUSTOMER_URL =
  import.meta.env.VITE_SUPPORT_CUSTOMER_URL ??
  `${SUPPORT_API_BASE}/customer`;

export const SUPPORT_GREETING =
  import.meta.env.VITE_SUPPORT_GREETING ??
  "Welcome to TicketBot! Let me know what's wrong and I'll get that info to the right person.";

export const SUPPORT_STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Report an issue",
    prompt: "I need to report an issue",
    icon: "lightbulb",
  },
  {
    label: "Technical problem",
    prompt: "I'm having a technical problem",
    icon: "sparkle",
  },
  {
    label: "Account help",
    prompt: "I need help with my account",
    icon: "compass",
  },
];
