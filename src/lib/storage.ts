import type { ProjectContext, GeneratedContent } from "./types.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const MAX_HISTORY = 5;
const CONFIG_DIR = path.join(os.homedir(), ".in10x");
const TOKEN_FILE = path.join(CONFIG_DIR, "token");

class Storage {
  private projectContext: ProjectContext | null = null;
  private contentHistory: GeneratedContent[] = [];
  private apiToken: string | null = null;

  setProject(context: ProjectContext): void {
    this.projectContext = context;
  }

  getProject(): ProjectContext | null {
    return this.projectContext;
  }

  addContent(content: GeneratedContent): void {
    this.contentHistory.unshift(content);
    if (this.contentHistory.length > MAX_HISTORY) {
      this.contentHistory.pop();
    }
  }

  getHistory(): GeneratedContent[] {
    return [...this.contentHistory];
  }

  clearHistory(): void {
    this.contentHistory = [];
  }

  // Token management - persisted to disk
  setToken(token: string): void {
    this.apiToken = token;
    // Persist to disk
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(TOKEN_FILE, token, "utf-8");
  }

  getToken(): string | null {
    if (this.apiToken) {
      return this.apiToken;
    }
    // Try to load from disk
    if (fs.existsSync(TOKEN_FILE)) {
      this.apiToken = fs.readFileSync(TOKEN_FILE, "utf-8").trim();
      return this.apiToken;
    }
    return null;
  }

  clearToken(): void {
    this.apiToken = null;
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
  }

  isConnected(): boolean {
    return this.getToken() !== null;
  }
}

export const storage = new Storage();
