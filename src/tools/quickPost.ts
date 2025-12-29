import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";
import type { Tone } from "../lib/types.js";

const TOOL_DESCRIPTION = `Generate a quick X post from a short update.

PROACTIVE TRIGGERS - Offer when user:
- Ships something ('done', 'shipped', 'works now')
- Quick wins ('fixed it', 'boom', 'yes!')

MANUAL TRIGGERS:
- 'quick post'
- 'qp'

AFTER GENERATING: Once you generate the post, ask:
'Want me to push this to In10x?' - then use push_to_in10x with the content.

IMPORTANT: The tool returns a template. Claude must ALWAYS generate the actual posts from this template and show the finished content to the user. Never display the raw template.`;

export const quickPostSchema = {
  update: z.string().describe("Quick update (e.g., 'shipped payments')"),
  tone: z
    .enum(["casual", "professional", "hype"])
    .optional()
    .describe("Tone for the post (default: casual)"),
};

function getToneGuidelines(tone: Tone): string {
  switch (tone) {
    case "casual":
      return "Conversational, 1-2 emojis, relatable";
    case "professional":
      return "Clear, minimal emoji, credible";
    case "hype":
      return "High energy, 2-3 emojis, celebratory";
  }
}

export function registerQuickPost(server: McpServer): void {
  server.tool(
    "quick_post",
    TOOL_DESCRIPTION,
    quickPostSchema,
    async (args) => {
      const update = args.update;
      const tone = (args.tone || "casual") as Tone;
      const project = storage.getProject();

      const parts: string[] = [
        "Generate a quick X post for this update:",
        "",
        `**Update:** ${update}`,
      ];

      if (project) {
        parts.push(`**Project:** ${project.projectName}`);
      }
      parts.push(`**Tone:** ${tone} - ${getToneGuidelines(tone)}`);

      parts.push("");
      parts.push("Generate:");
      parts.push("- **X Post** (max 280 characters) - celebrate this quick win");
      parts.push("- **Hashtags** - 1-2 tags like #buildinpublic #shipit");

      return {
        content: [
          {
            type: "text" as const,
            text: parts.join("\n"),
          },
        ],
      };
    }
  );
}
