/** SDK families bound through this core package (`PNPM_WORKSPACE_DEPENDENCY_SPEC`). */
export function listSdkworkCoreSdkInventory() {
  return [
    'sdkwork-appstore-app-sdk',
    'sdkwork-agents-app-sdk',
    'sdkwork-skills-app-sdk',
    'sdkwork-mcp-app-sdk',
  ] as const;
}
