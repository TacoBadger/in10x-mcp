export type Tone = "casual" | "professional" | "hype";

export interface ProjectContext {
  projectName: string;
  projectDescription?: string;
  stack?: string;
  startedAt?: string;
}

export interface GeneratedContent {
  xPost: string;
  in10xPost: string;
  hashtags: string[];
  suggestedTitle: string;
  timestamp: Date;
}

export interface GenerateContentInput {
  sessionSummary?: string;
  tone?: Tone;
  struggle?: string;
}

export interface GenerationResult {
  xPost: string | null;
  in10xPost: string | null;
  hashtags: string[];
  suggestedTitle: string | null;
  promptingQuestion: string | null;
}

export interface QuickPostInput {
  update: string;
  tone?: Tone;
}
