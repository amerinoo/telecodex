# TeleCodex

Telegram bot that sends user messages to Codex and returns the response.

This project started as a minimal Codex SDK test and has been extended to support a full Telegram → Codex → response loop.

---

## Tech Stack

- Node.js (>= 18)
- TypeScript
- @openai/codex-sdk
- Telegram Bot API (HTTP)
- tsx (development)

---

## Requirements

- Node.js 18+
- Codex installed and authenticated locally
- Telegram bot token (from BotFather)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

---

### 2. Configure environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Fill it with your values:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CODEX_WORKING_DIRECTORY=.
POLLING_TIMEOUT_SECONDS=30
```

---

## Run (development)

```bash
npm run dev
```

The bot will start polling Telegram and processing incoming messages.

---

## How it works

### Flow

User → Telegram → TeleCodex → Codex → Response → Telegram

### Steps

1. Telegram sends messages via `getUpdates` (long polling)
2. The bot extracts `message.text`
3. A Codex thread is created or resumed
4. The prompt is sent to Codex
5. The response is returned to the user via `sendMessage`

---

## Conversation memory

The bot stores a mapping:

chatId → threadId

This allows:
- maintaining conversation context per user
- continuing Codex threads instead of starting new ones

Storage is implemented as a local JSON file:

thread-store.json

---

## Project structure

src/
├── index.ts        # Main loop (Telegram polling)
├── telegram.ts     # Telegram API client
├── codex.ts        # Codex SDK integration
├── store.ts        # chatId ↔ threadId persistence
├── config.ts       # Environment config
└── types.ts        # Telegram types

---

## Important notes

### 1. ESM configuration

Project uses ESM:

"type": "module"

and TypeScript:

"module": "NodeNext"

---

### 2. Codex working directory

Codex requires a trusted working directory.

Current setup uses:

skipGitRepoCheck: true

Recommended alternative:

git init
git add .
git commit -m "init"

---

### 3. Environment variables

Secrets are not committed:

- `.env` is ignored
- `.env.example` is provided

---

### 4. Error handling

The bot runs in an infinite loop:
- logs errors
- retries automatically
- avoids crashing on transient failures

---

## Known limitations

- Local JSON storage (not persistent across environments)
- No rate limiting or queueing
- No command handling (/start, /help, etc.)
- No message formatting (Markdown, HTML)

---

## Next steps

- [ ] Add command system (/start, /reset)
- [ ] Add proper logging
- [ ] Move storage to database (SQLite / Redis)
- [ ] Add rate limiting
- [ ] Deploy (Docker / VPS)
- [ ] Switch to webhook instead of polling

---

## Goal

Provide a minimal but extensible foundation for building:

AI-powered Telegram bots using Codex

---

## License

Private / experimental project
