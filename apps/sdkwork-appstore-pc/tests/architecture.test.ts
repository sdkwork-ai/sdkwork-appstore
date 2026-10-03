import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');
}

describe('PC architecture contracts', () => {
  it('uses the shared IAM runtime and generated SDK clients', () => {
    const iamRuntime = readSource('packages/sdkwork-appstore-pc-runtime/src/iamRuntime.ts');
    const sdkClients = readSource('packages/sdkwork-appstore-pc-core/src/sdk/clients.ts');

    expect(iamRuntime).toContain('createSdkworkAppbasePcAuthRuntime');
    expect(iamRuntime).toContain('credentialEntry');
    expect(iamRuntime).toContain('prepareAppstorePcCredentialEntryTokens');
    expect(iamRuntime).not.toContain('guest_token');
    expect(sdkClients).toContain("from '@sdkwork/appstore-app-sdk'");
    expect(sdkClients).toContain("from '@sdkwork/agents-app-sdk'");
    expect(sdkClients).toContain("from '@sdkwork/skills-app-sdk'");
    expect(sdkClients).toContain("from '@sdkwork/mcp-app-sdk'");
  });

  it('keeps Skills and MCP capabilities behind injected owner SDK ports', () => {
    const skillsService = readSource(
      'packages/sdkwork-appstore-pc-core/src/services/skills.ts',
    );
    const mcpService = readSource(
      'packages/sdkwork-appstore-pc-core/src/services/mcp.ts',
    );
    const skillsBootstrap = readSource('packages/sdkwork-appstore-pc-runtime/src/skills.ts');
    const mcpBootstrap = readSource('packages/sdkwork-appstore-pc-runtime/src/mcp.ts');

    expect(skillsService).not.toContain('localStorage');
    expect(skillsService).not.toContain('mockSkills');
    expect(mcpService).not.toContain('localStorage');
    expect(mcpService).not.toContain('mockMcpServers');
    expect(skillsBootstrap).toContain('client.skills.marketplace.list');
    expect(mcpBootstrap).toContain('client.mcp.servers.list');
  });

  it('keeps AI execution behind the Agents SDK boundary', () => {
    const aiHubService = readSource(
      'packages/sdkwork-appstore-pc-core/src/services/aihub.ts',
    );
    const aiHubBootstrap = readSource('packages/sdkwork-appstore-pc-runtime/src/aiHub.ts');

    expect(aiHubService).not.toMatch(/\bfetch\s*\(/u);
    expect(aiHubBootstrap).toContain('previewResponses.create');
  });
});
