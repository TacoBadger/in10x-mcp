import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";
import { getPromptingQuestion, needsMoreContext } from "../lib/contentGenerator.js";
import type { Tone } from "../lib/types.js";

const TOOL_DESCRIPTION = `Generates social content for X and In10x platform.

PROACTIVE TRIGGERS - Offer this tool when user:
- Ships or finishes something ('done', 'shipped', 'finally works', 'got it working')
- Fixes a bug ('fixed', 'solved', 'cracked it')
- Completes a session ('that's it for today', 'stopping here')
- Expresses a win ('yes!', 'boom', 'let's go')

When you detect these, ask: 'Nice! Want me to generate a post about this?'

MANUAL TRIGGERS - Run immediately when user says:
- 'generate content'
- 'in10x'
- 'gc'
- '/post'

AFTER GENERATING: Once you generate the posts, ask:
'Want me to push this to In10x?' - then use push_to_in10x with the In10x post content.

IMPORTANT: The tool returns a template. Claude must ALWAYS generate the actual posts from this template and show the finished content to the user. Never display the raw template.`;

export const generateContentSchema = {
  session_summary: z
    .string()
    .optional()
    .describe("What was built or worked on this session"),
  tone: z
    .enum(["casual", "professional", "hype"])
    .optional()
    .describe("Tone for the generated content (default: casual)"),
  struggle: z
    .string()
    .optional()
    .describe("What was hard, surprising, or took longer than expected"),
};

function getToneGuidelines(tone: Tone): string {
  switch (tone) {
    case "casual":
      return "Conversational, 1-2 emojis max, relatable, words like 'finally', 'turns out', 'plot twist'";
    case "professional":
      return "Outcomes-focused, minimal emoji, clear and direct, credible";
    case "hype":
      return "High energy, 2-3 emojis, celebratory, 'LET'S GO' vibes";
  }
}

export function registerGenerateContent(server: McpServer): void {
  server.tool(
    "generate_content",
    TOOL_DESCRIPTION,
    generateContentSchema,
    async (args) => {
      const sessionSummary = args.session_summary;
      const struggle = args.struggle;
      const tone = (args.tone || "casual") as Tone;
      const project = storage.getProject();

      // If no context provided, ask a prompting question
      if (needsMoreContext({ sessionSummary, struggle })) {
        const question = getPromptingQuestion();
        return {
          content: [
            {
              type: "text" as const,
              text: `I need a bit more context to generate a great post.\n\n**${question}**\n\nOnce you answer, I'll generate your posts.`,
            },
          ],
        };
      }

      // Build prompt for Claude to generate content
      const parts: string[] = [
        "Generate social media posts based on this coding session:",
        "",
      ];

      if (sessionSummary) {
        parts.push(`**What was built:** ${sessionSummary}`);
      }
      if (struggle) {
        parts.push(`**Challenge/struggle:** ${struggle}`);
      }
      if (project) {
        parts.push(`**Project:** ${project.projectName}${project.stack ? ` (${project.stack})` : ""}`);
      }
      parts.push(`**Tone:** ${tone} - ${getToneGuidelines(tone)}`);

      parts.push("");
      parts.push("Generate:");
      parts.push("1. **X Post** (max 280 characters) - punchy, engaging, includes the struggle/win");
      parts.push("2. **In10x Post** (2-4 sentences) - fuller narrative of what happened");
      parts.push("3. **Hashtags** - 2-4 relevant tags like #buildinpublic #vibecoding");
      parts.push("");
      parts.push("Transform boring updates into interesting content. Focus on the human story, not just the technical details.");

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
