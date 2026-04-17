// src/codex.ts

import { Codex } from "@openai/codex-sdk";
import { config } from "./config.js";
import { log } from "./logger.js";

const codex = new Codex();

export interface AskCodexResult {
  response: string;
  threadId: string;
}

export async function askCodex(
  input: string,
  threadId?: string,
): Promise<AskCodexResult> {
  if (!input.trim()) {
    throw new Error("Input cannot be empty.");
  }

  if (config.mockCodexResponse) {
    log("CODEX", "Mock response enabled");
    await new Promise((r) => setTimeout(r, 1500)); // simula 1.5s de procesamiento

    return {
      response: `🤖 Mock response for: "${input}"`,
      threadId: threadId ?? "mock-thread",
    };
  }

  const threadOptions = {
    workingDirectory: config.codexWorkingDirectory,
    skipGitRepoCheck: true,
  };

  const thread = threadId
    ? codex.resumeThread(threadId, threadOptions)
    : codex.startThread(threadOptions);

  const prompt = config.useCoordinator
    ? `Use the coordinator skill to handle this request end to end: ${input}`
    : input;

  log("BOT", "Calling Codex", {
    hasThread: Boolean(threadId),
  });

  log("CODEX", "Running prompt");

  const turn = await thread.run(prompt);

  log("BOT", "Codex response received");

  if (!thread.id) {
    throw new Error("Codex thread ID is missing.");
  }

  return {
    response: turn.finalResponse ?? "",
    threadId: thread.id,
  };
}
