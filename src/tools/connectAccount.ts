import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";

const TOOL_DESCRIPTION = `Connect your In10x account to push posts directly from your coding sessions.

WHEN TO USE:
- User wants to connect their In10x account
- User says 'connect', 'connect account', 'link account'
- Before using push_to_in10x for the first time

FLOW:
1. If no token provided, show the connection URL
2. If token provided, save it and confirm connection`;

const PLATFORM_URL = process.env.IN10X_URL || "https://in10x.com";

export const connectAccountSchema = {
  token: z
    .string()
    .optional()
    .describe("Your In10x API token (get it from in10x.com/connect/mcp)"),
};

export function registerConnectAccount(server: McpServer): void {
  server.tool(
    "connect_account",
    TOOL_DESCRIPTION,
    connectAccountSchema,
    async (args) => {
      const token = args.token;

      // Check if already connected
      if (storage.isConnected() && !token) {
        return {
          content: [
            {
              type: "text" as const,
              text: `✅ **Already connected to In10x!**

Your account is linked and ready to go.

Use \`push_to_in10x\` to publish your posts.

Want to reconnect with a different account? Provide a new token.`,
            },
          ],
        };
      }

      // If no token provided, show instructions
      if (!token) {
        return {
          content: [
            {
              type: "text" as const,
              text: `🔗 **Connect your In10x account**

1. Go to: **${PLATFORM_URL}/connect/mcp**
2. Log in (or create an account)
3. Click "Generate Token"
4. Copy the token
5. Run this tool again with the token:
   \`connect_account token="in10x_xxxxx..."\`

Once connected, you can use \`push_to_in10x\` to publish posts directly!`,
            },
          ],
        };
      }

      // Validate token format
      if (!token.startsWith("in10x_")) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Invalid token format**

The token should start with \`in10x_\`.

Get your token at: ${PLATFORM_URL}/connect/mcp`,
            },
          ],
        };
      }

      // Verify token with API
      try {
        const response = await fetch(`${PLATFORM_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return {
            content: [
              {
                type: "text" as const,
                text: `❌ **Invalid token**

This token doesn't seem to be valid. Please get a new one at:
${PLATFORM_URL}/connect/mcp`,
              },
            ],
          };
        }

        const user = await response.json();

        // Save the token
        storage.setToken(token);

        return {
          content: [
            {
              type: "text" as const,
              text: `✅ **Connected as @${user.username}!**

Your In10x account is now linked. You can now use:
- \`push_to_in10x\` - Publish posts directly to In10x

Happy shipping! 🚀`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `❌ **Connection failed**

Could not connect to In10x. Please try again later.

Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        };
      }
    }
  );
}
