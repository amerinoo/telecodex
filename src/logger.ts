// src/logger.ts

export function log(scope: string, message: string, extra?: unknown): void {
  const now = new Date().toISOString().split("T")[1].split(".")[0];

  if (extra) {
    console.log(`[${now}] [${scope}] ${message}`, extra);
  } else {
    console.log(`[${now}] [${scope}] ${message}`);
  }
}