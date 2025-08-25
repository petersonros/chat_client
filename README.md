
# Chat Client (Next.js + Socket.IO)

Cliente minimal para o **chat-server**. Inclui login/registro/confirmar, listagem/criação de salas e chat em tempo real por sala.

## Rodar local
```bash
npm install
cp .env.example .env.local  # ajuste se necessário
npm run dev
```
- Aponte `NEXT_PUBLIC_API_BASE` e `NEXT_PUBLIC_SOCKET_URL` para seu chat-server (por padrão `http://localhost:3333`).
- Telas:
  - `/` → Login/Registro/Confirmar
  - `/rooms` → lista/entra/cria salas
  - `/chat/[roomCode]` → conversa em tempo real

> Observação: os nomes dos eventos Socket.IO (`join-room`, `send-message`, `user-left`, `new-message`) foram alinhados com o servidor que você me enviou. Se você alterar no servidor, ajuste em `app/chat/[roomCode]/page.tsx`.
