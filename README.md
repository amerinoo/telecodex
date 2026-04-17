# TeleCodex

Bot de Telegram que recibe mensajes de un chat, los envía a Codex y devuelve la respuesta al usuario.

El proyecto está pensado para ejecutarse localmente o en un servidor propio. Usa long polling contra la API de Telegram y mantiene una conversación de Codex por cada chat.

## Que incluye

- Bot de Telegram por polling (`getUpdates`)
- Envío de mensajes y estado `typing`
- Integración con `@openai/codex-sdk`
- Memoria de conversación por `chatId`
- Comandos básicos:
  - `/whoami`: muestra el `chatId` y nombre del usuario
  - `/reset`: reinicia la conversación del chat
- Lista opcional de chats autorizados
- Modo mock para probar sin llamar a Codex
- Configuración por variables de entorno
- TypeScript con ESM

## Requisitos

- Node.js 18 o superior
- npm
- Un bot de Telegram creado con BotFather
- Codex instalado y autenticado en la máquina donde se ejecuta el bot

## Instalación

```bash
npm install
```

Crea el archivo de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus valores.

## Configuración

Variables soportadas:

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

Token del bot de Telegram. Es obligatorio.

`CODEX_WORKING_DIRECTORY`

Directorio donde Codex ejecuta las tareas. Si queda vacío, usa el directorio actual.

`POLLING_TIMEOUT_SECONDS`

Timeout del long polling de Telegram. Por defecto: `30`.

`ALLOWED_CHAT_IDS`

Lista opcional de chats permitidos, separada por comas.

Ejemplo:

```env
ALLOWED_CHAT_IDS=123456789,987654321
```

Si no se define, cualquier chat que escriba al bot puede usarlo.

`SKIP_STARTUP_MESSAGE`

Si vale `true`, el bot no envía mensaje de inicio a los chats permitidos.

`USE_COORDINATOR`

Si vale `true`, el prompt enviado a Codex pide usar el coordinator skill para resolver la petición end to end.

`MOCK_CODEX_RESPONSE`

Si vale `true`, el bot devuelve una respuesta simulada. Sirve para probar Telegram sin consumir Codex.

## Uso

Ejecutar en desarrollo:

```bash
npm run dev
```

Compilar:

```bash
npm run build
```

Ejecutar la versión compilada:

```bash
npm start
```

## Flujo

1. Telegram entrega mensajes al bot mediante `getUpdates`.
2. El bot ignora mensajes sin texto.
3. Si el mensaje es `/whoami` o `/reset`, ejecuta el comando.
4. Si `ALLOWED_CHAT_IDS` está configurado, valida que el chat esté permitido.
5. Envía una confirmación al chat.
6. Recupera el thread de Codex asociado al `chatId`, si existe.
7. Envía el texto a Codex.
8. Guarda el nuevo `threadId`.
9. Devuelve la respuesta de Codex al usuario.

## Memoria de conversación

La relación entre chats de Telegram y threads de Codex se guarda en:

```text
thread-store.json
```

Ese archivo es local y no se versiona. Si se borra, los chats empiezan conversaciones nuevas.

## Estructura

```text
src/
├── index.ts      # Loop principal del bot
├── telegram.ts   # Cliente HTTP para Telegram
├── codex.ts      # Integración con Codex SDK
├── store.ts      # Persistencia chatId -> threadId
├── config.ts     # Variables de entorno
├── logger.ts     # Logs simples
└── types.ts      # Tipos de Telegram
```

Archivos principales del repo:

```text
.env.example      # Plantilla de configuración
.gitignore        # Archivos ignorados por Git
package.json      # Scripts y dependencias
tsconfig.json     # Configuración TypeScript
README.md         # Documentación
```

## Archivos no versionados

Estos archivos quedan fuera de Git:

- `.env`
- `node_modules/`
- `dist/`
- `thread-store.json`

## Notas

- El bot usa polling, no webhooks.
- La persistencia actual es un JSON local.
- No hay rate limiting ni cola de tareas.
- Codex se ejecuta con `skipGitRepoCheck: true`.

## Licencia

Proyecto privado / experimental.
