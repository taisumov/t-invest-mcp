import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config.js';
import { TinkoffClient } from '../tinkoff/index.js';
import { handleTool } from './handlers.js';
import { TOOL_DEFINITIONS, type ToolName } from './tools.js';

const client = new TinkoffClient(config.TINKOFF_TOKEN);

const server = new Server(
  { name: 'tinkoff-invest', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleTool(client, name as ToolName, args);
});

const transport = new StdioServerTransport();
await server.connect(transport);
