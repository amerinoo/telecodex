import "dotenv/config";

import { askCodex } from "./codex.js";
import { config } from "./config.js";
import { log } from "./logger.js";
import { getThreadId, setThreadId } from "./store.js";
import { getUpdates, sendChatAction, sendMessage } from "./telegram.js";

async function handleTextMessage(chatId: number, text: string): Promise<void> {
  const start = Date.now();

  log("BOT", "Sending ack message");
  await sendMessage(chatId, "⏳ Petición recibida...");

  let keepAlive = true;

  const heartbeat = (async () => {
    while (keepAlive) {
      try {
        await sendChatAction(chatId, "typing");
      } catch (error) {
        console.error("Failed to send chat action:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  })();

  try {
    const existingThreadId = getThreadId(chatId);
    const result = await askCodex(text, existingThreadId);

    setThreadId(chatId, result.threadId);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    const reply = result.response.trim() || "Empty response from Codex.";

    log("BOT", `✅ Sending final response (${elapsed}s)`);
    await sendMessage(chatId, reply);
    await sendMessage(chatId, `✅ Terminado en ${elapsed}s`);
  } catch (error) {
    log("ERROR", "Error handling message:", error);

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);

    await sendMessage(chatId, "❌ Error processing your request.");
    await sendMessage(chatId, `⏱ Finalizado con error en ${elapsed}s`);
  } finally {
    keepAlive = false;
    await heartbeat;
  }
}

async function main(): Promise<void> {
  let offset: number | undefined;

  log("BOT", "🤖 TeleCodex bot started");

  const isColdStart = !config.skipStartupMessage;

  if (isColdStart && config.allowedChatIds?.length) {
    for (const chatId of config.allowedChatIds) {
      try {
        await sendMessage(chatId, "🤖 Bot iniciado y listo");
      } catch (err) {
        console.error(`Failed to notify chat ${chatId}`, err);
      }
    }
  }

  while (true) {
    try {
      const updates = await getUpdates(offset);

      for (const update of updates) {
        offset = update.update_id + 1;

        const message = update.message;
        if (!message?.text) {
          continue;
        }

        const chatId = message.chat.id;

        const text = message.text.trim();

        log("BOT", "Incoming message", {
          chatId,
          text,
        });

        // comando /whoami
        if (text === "/whoami") {
          const user = message.from;

          const displayName = user?.username
            ? `@${user.username}`
            : [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
              "unknown";

          await sendMessage(chatId, `chatId: ${chatId}\nname: ${displayName}`);
          continue;
        }

        // comando /reset
        if (text === "/reset") {
          setThreadId(chatId, "");
          await sendMessage(chatId, "Conversation reset.");
          continue;
        }

        if (config.allowedChatIds && !config.allowedChatIds.includes(chatId)) {
          console.log(`Ignored unauthorized chat ${chatId}`);
          await sendMessage(chatId, "You are not authorized to use this bot.");
          continue;
        }

        await handleTextMessage(chatId, text);
      }
    } catch (error) {
      console.error("Bot loop error:", error);

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
