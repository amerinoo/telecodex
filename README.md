# TeleCodex

Telegram bot that receives chat messages, sends them to Codex, and returns the response to the user.

The project is designed to run locally or on your own server. It uses long polling with the Telegram API and keeps one Codex conversation per Telegram chat.

## What is included

- Telegram bot using polling (`getUpdates`)
- Message sending and `typing` chat action
- `@openai/codex-sdk` integration
- Conversation memory per `chatId`
- Basic commands:
  - `/whoami`: returns the `chatId` and user name
  - `/reset`: resets the chat conversation
- Optional allowlist for authorized chats
- Mock mode for testing without calling Codex
- Coordinator support for the first message in a conversation
- Direct user input forwarding after the conversation has started
- Environment-based configuration
- TypeScript with ESM

## Requirements

- Node.js 18 or newer
- npm
- A Telegram bot created with BotFather
- Codex installed and authenticated on the machine running the bot

## Installation

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values.

## Configuration

Supported variables:

```env
TELEGRAM_BOT_TOKEN=
CODEX_WORKING_DIRECTORY=
POLLING_TIMEOUT_SECONDS=30
ALLOWED_CHAT_IDS=
SKIP_STARTUP_MESSAGE=true
USE_COORDINATOR=true
MOCK_CODEX_RESPONSE=false
```

### Variables

`TELEGRAM_BOT_TOKEN`

Telegram bot token. Required.

`CODEX_WORKING_DIRECTORY`

Directory where Codex runs tasks. If empty, the current working directory is used.

`POLLING_TIMEOUT_SECONDS`

Telegram long polling timeout. Default: `30`.

`ALLOWED_CHAT_IDS`

Optional comma-separated list of allowed chats.

Example:

```env
ALLOWED_CHAT_IDS=123456789,987654321
```

If not set, any chat that messages the bot can use it.

`SKIP_STARTUP_MESSAGE`

If set to `true`, the bot does not send a startup message to allowed chats.

`USE_COORDINATOR`

If set to `true`, the first prompt in a new chat conversation asks Codex to use the coordinator skill. Follow-up messages in the same conversation are sent directly to Codex.

`MOCK_CODEX_RESPONSE`

If set to `true`, the bot returns a fake Codex response. Useful for testing Telegram integration without calling Codex.

## Usage

Run in development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run the compiled version:

```bash
npm start
```

## Flow

1. Telegram delivers messages through `getUpdates`.
2. The bot ignores messages without text.
3. If the message is `/whoami` or `/reset`, the command is handled directly.
4. If `ALLOWED_CHAT_IDS` is configured, the bot checks that the chat is allowed.
5. The bot sends an acknowledgement message.
6. It loads the Codex thread associated with the `chatId`, if one exists.
7. If this is a new Codex thread and `USE_COORDINATOR` is enabled, it asks Codex to use the coordinator skill.
8. If this is an existing Codex thread, it sends the user text directly to Codex.
9. It stores the resulting `threadId`.
10. It sends the Codex response back to the user.

## Conversation memory

The mapping between Telegram chats and Codex threads is stored in:

```text
thread-store.json
```

This file is local and is not committed. If it is deleted, chats start new conversations.

## Structure

```text
src/
├── index.ts      # Main bot loop
├── telegram.ts   # HTTP client for Telegram
├── codex.ts      # Codex SDK integration
├── store.ts      # chatId -> threadId persistence
├── config.ts     # Environment variables
├── logger.ts     # Simple logs
└── types.ts      # Telegram types
```

Main repository files:

```text
.env.example      # Configuration template
.gitignore        # Files ignored by Git
package.json      # Scripts and dependencies
tsconfig.json     # TypeScript configuration
README.md         # Documentation
```

## Untracked files

These files are intentionally excluded from Git:

- `.env`
- `node_modules/`
- `dist/`
- `thread-store.json`

## Notes

- The bot uses polling, not webhooks.
- Current persistence is a local JSON file.
- There is no rate limiting or task queue.
- Coordinator wrapping is only applied to the first message in a new Codex thread.
- Follow-up user messages are passed directly to Codex.
- Codex runs with `skipGitRepoCheck: true`.

## License

Private / experimental project.
