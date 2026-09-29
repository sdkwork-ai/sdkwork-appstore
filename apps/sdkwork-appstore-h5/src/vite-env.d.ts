/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPSTORE_API_URL: string;
  readonly VITE_APPSTORE_ABUSE_REPORT_EMAIL?: string;
  /** Open-api surface override (`/store/v3/api` public reads). */
  readonly VITE_APPSTORE_OPEN_API_URL?: string;
  /** AI Lab dependency gateway overrides (default: shared gateway origin). */
  readonly VITE_AGENTS_API_URL?: string;
  readonly VITE_SKILLS_API_URL?: string;
  readonly VITE_MCP_API_URL?: string;
  /** Agents preview agent bound to the AI sandbox (agents domain id). */
  readonly VITE_AI_PREVIEW_AGENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
