
import { ai } from './genkit';
import { mcp } from '@genkit-ai/mcp';

// Expose all flows as MCP tools
export const mcpServer = ai.defineTool({
    name: 'mcpServer',
    description: 'Exposes Genkit flows as MCP tools',
    inputSchema: ai.z.object({}),
}, async () => {
    // This is a placeholder for the actual MCP server initialization if needed
    // In many cases, genkit-cli handles the MCP mirroring automatically if the plugin is active.
    return { status: 'MCP Hook Active' };
});

// The @genkit-ai/mcp plugin automatically mirrors flows as MCP tools
// when the Genkit runtime is started.
