import type { GenerateContentInput } from "./types.js";

const PROMPTING_QUESTIONS = [
  "What was the hardest part of today's session?",
  "Any surprises while building?",
  "How long did the main task take vs what you expected?",
  "Would you do anything differently next time?",
  "What made you proud today?",
];

export function getPromptingQuestion(): string {
  const index = Math.floor(Math.random() * PROMPTING_QUESTIONS.length);
  return PROMPTING_QUESTIONS[index];
}

export function needsMoreContext(input: GenerateContentInput): boolean {
  return !input.sessionSummary && !input.struggle;
}

export function formatHistoryEntry(
  content: { xPost: string; in10xPost: string; hashtags: string[]; suggestedTitle: string; timestamp: Date },
  index: number
): string {
  const timeAgo = getTimeAgo(content.timestamp);
  return `
### Post ${index + 1} (${timeAgo})
**X:** ${content.xPost}
**In10x:** ${content.in10xPost}
**Tags:** ${content.hashtags.join(" ")}
**Title:** ${content.suggestedTitle}
`.trim();
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
