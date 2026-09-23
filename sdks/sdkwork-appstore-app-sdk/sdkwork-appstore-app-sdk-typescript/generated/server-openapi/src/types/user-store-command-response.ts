export interface UserStoreCommandResponse {
  code: 0;
  data: unknown & { item: { accepted: boolean; }; };
  /** Server-owned request correlation id. */
  traceId: string;
}
