#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerGenerateContent } from "./tools/generateContent.js";
import { registerSetProjectContext } from "./tools/setProjectContext.js";
import { registerGetContentHistory } from "./tools/getContentHistory.js";
import { registerQuickPost } from "./tools/quickPost.js";
import { registerConnectAccount } from "./tools/connectAccount.js";
import { registerPushToIn10x } from "./tools/pushToIn10x.js";

const server = new McpServer({
  name: "in10x-mcp",
  version: "1.0.0",
});

// Register all tools
registerGenerateContent(server);
registerSetProjectContext(server);
registerGetContentHistory(server);
registerQuickPost(server);
registerConnectAccount(server);
registerPushToIn10x(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("In10x MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
