import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { storage } from "../lib/storage.js";

export const setProjectContextSchema = {
  project_name: z.string().describe("Name of the project you're building"),
  project_description: z
    .string()
    .optional()
    .describe("One-liner description of the project"),
  stack: z
    .string()
    .optional()
    .describe("Tech stack (e.g., 'Next.js + Supabase')"),
  started_at: z
    .string()
    .optional()
    .describe("When the project started (e.g., 'Dec 2024')"),
};

export function registerSetProjectContext(server: McpServer): void {
  server.tool(
    "set_project_context",
    "Store project info to improve content generation. Set this once at the start of a session.",
    setProjectContextSchema,
    async (args) => {
      storage.setProject({
        projectName: args.project_name,
        projectDescription: args.project_description,
        stack: args.stack,
        startedAt: args.started_at,
      });

      const parts = [`Project context set: **${args.project_name}**`];
      if (args.project_description) {
        parts.push(`Description: ${args.project_description}`);
      }
      if (args.stack) {
        parts.push(`Stack: ${args.stack}`);
      }
      if (args.started_at) {
        parts.push(`Started: ${args.started_at}`);
      }
      parts.push(
        "",
        "This context will be used to generate better content. Call `generate_content` when you're ready to create a post!"
      );

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
