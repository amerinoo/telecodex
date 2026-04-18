// src/config.ts

import os from "node:os";
import path from "node:path";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolvePath(p: string): string {
  if (p.startsWith("~/")) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

export const config = {
  telegramBotToken: requireEnv("TELEGRAM_BOT_TOKEN"),
  codexWorkingDirectory: resolvePath(
    process.env.CODEX_WORKING_DIRECTORY || process.cwd(),
  ),
  pollingTimeoutSeconds: Number(process.env.POLLING_TIMEOUT_SECONDS || "30"),

  allowedChatIds: process.env.ALLOWED_CHAT_IDS
    ? process.env.ALLOWED_CHAT_IDS.split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id))
    : undefined,
  skipStartupMessage: process.env.SKIP_STARTUP_MESSAGE === "true",
  mockCodexResponse: process.env.MOCK_CODEX_RESPONSE === "true",
};
