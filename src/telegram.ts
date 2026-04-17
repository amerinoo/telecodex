// src/telegram.ts

import { config } from "./config.js";
import type {
  TelegramGetUpdatesResponse,
  TelegramSendMessageResponse,
  TelegramUpdate,
} from "./types.js";

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${config.telegramBotToken}`;

export async function getUpdates(
  offset?: number
): Promise<TelegramUpdate[]> {
  const url = new URL(`${TELEGRAM_API_BASE}/getUpdates`);
  url.searchParams.set("timeout", String(config.pollingTimeoutSeconds));

  if (offset !== undefined) {
    url.searchParams.set("offset", String(offset));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Telegram getUpdates failed with status ${response.status}`);
  }

  const data = (await response.json()) as TelegramGetUpdatesResponse;

  if (!data.ok) {
    throw new Error("Telegram getUpdates returned ok=false");
  }

  return data.result;
}

export async function sendMessage(
  chatId: number,
  text: string
): Promise<void> {
  const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}`);
  }

  const data = (await response.json()) as TelegramSendMessageResponse;

  if (!data.ok) {
    throw new Error("Telegram sendMessage returned ok=false");
  }
}

export async function sendChatAction(
  chatId: number,
  action: "typing" | "upload_document" = "typing"
): Promise<void> {
  const response = await fetch(`${TELEGRAM_API_BASE}/sendChatAction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      action,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram sendChatAction failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.ok) {
    throw new Error("Telegram sendChatAction returned ok=false");
  }
}