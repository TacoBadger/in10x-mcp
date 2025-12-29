import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";
import { formatHistoryEntry } from "../lib/contentGenerator.js";

export function registerGetContentHistory(server: McpServer): void {
  server.tool(
    "get_content_history",
    "View the last 5 generated posts from this session.",
    {},
    async () => {
      const history = storage.getHistory();

      if (history.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No content generated yet this session.\n\nCall `generate_content` to create your first post!",
            },
          ],
        };
      }

      const formatted = history.map((entry, index) =>
        formatHistoryEntry(entry, index)
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `# Content History (${history.length} posts)\n\n${formatted.join("\n\n")}`,
          },
        ],
      };
    }
  );
}
