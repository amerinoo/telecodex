// src/store.ts

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type ThreadStore = Record<string, string>;

const STORE_FILE = resolve("thread-store.json");

function readStore(): ThreadStore {
  if (!existsSync(STORE_FILE)) {
    return {};
  }

  try {
    const raw = readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as ThreadStore;
  } catch {
    return {};
  }
}

function writeStore(store: ThreadStore): void {
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function getThreadId(chatId: number): string | undefined {
  const store = readStore();
  return store[String(chatId)];
}

export function setThreadId(chatId: number, threadId: string): void {
  const store = readStore();
  store[String(chatId)] = threadId;
  writeStore(store);
}