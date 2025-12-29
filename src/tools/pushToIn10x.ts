import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";

const TOOL_DESCRIPTION = `Push a post directly to In10x platform.

WHEN TO USE:
- After generating content with generate_content, offer: 'Want me to push this to In10x?'
- User says 'push', 'publish', 'post to in10x', 'ship it', 'yes' (after you offer)
- User wants to share their update

WHAT TO PASS:
- content: The In10x post you generated (2-4 sentences, the longer version)
- x_content: The X/Twitter post you generated (280 char version)
- hashtags: Array of hashtags like ["buildinpublic", "vibecoding"]

REQUIRES: Connected account (use connect_account first). If not connected, the tool will prompt user to connect.`;

const PLATFORM_URL = process.env.IN10X_URL || "http://localhost:3001";

export const pushToIn10xSchema = {
  content: z
    .string()
    .describe("The post content (2-4 sentences, what you built/learned)"),
  x_content: z
    .string()
    .optional()
    .describe("Short version for X/Twitter (max 280 chars)"),
  hashtags: z
    .array(z.string())
    .optional()
    .describe("Hashtags like #buildinpublic #vibecoding"),
  project_id: z
    .string()
    .optional()
    .describe("Link to a specific project (optional)"),
};

export function registerPushToIn10x(server: McpServer): void {
  server.tool(
    "push_to_in10x",
    TOOL_DESCRIPTION,
    pushToIn10xSchema,
    async (args) => {
      const { content, x_content, hashtags, project_id } = args;

      // Check if connected
      const token = storage.getToken();
      if (!token) {
        return {
          content: [
            {
              type: "text" as const,
              text: `🔗 **Not connected to In10x**

You need to connect your account first:

1. Run \`connect_account\` to get started
2. Then come back and push your post!

Or visit: ${PLATFORM_URL}/connect/mcp`,
            },
          ],
        };
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Content required**

Please provide the post content. Example:
\`push_to_in10x content="Built a new auth system today. Took 3 hours but finally works!"\``,
            },
          ],
        };
      }

      // Push to platform
      try {
        const response = await fetch(`${PLATFORM_URL}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            x_content: x_content || null,
            hashtags: hashtags || [],
            project_id: project_id || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();

          if (response.status === 401) {
            // Token might be invalid
            storage.clearToken();
            return {
              content: [
                {
                  type: "text" as const,
                  text: `❌ **Authentication failed**

Your token seems to be invalid or expired.

Please reconnect with \`connect_account\``,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text" as const,
                text: `❌ **Failed to post**

${error.error || "Unknown error"}

Please try again.`,
              },
            ],
          };
        }

        const result = await response.json();

        return {
          content: [
            {
              type: "text" as const,
              text: `✅ **Posted to In10x!**

Your post is now live: ${result.url}

${x_content ? `📱 X version ready to copy:\n"${x_content}"` : ""}

Keep shipping! 🚀`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Connection error**

Could not reach In10x. Please check your internet connection.

Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
