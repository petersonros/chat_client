
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { getToken } from "@/lib/auth";
import { RoomsAPI, UsersAPI } from "@/lib/api";

type Message = { id?: number; content: string; userId: number; createdAt?: string; user?: { id:number; name:string } };

export default function ChatRoomPage() {
  const { roomCode } = useParams() as { roomCode: string };
  const router = useRouter();
  const [me, setMe] = useState<{ id:number; name:string }|null>(null);
  const [room, setRoom] = useState<{ id:number; code:string; name:string }|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    (async () => {
      try {
        const user = await UsersAPI.me(token);
        setMe(user);
        // tentar achar sala por listagem
        const rooms = await RoomsAPI.list();
        const found = rooms.find(r => r.code === String(roomCode));
        if (found) {
          setRoom(found);
          const msgs = await RoomsAPI.messages(found.id).catch(()=>[]);
          setMessages(msgs as any);
        } else {
          alert("Sala não encontrada.");
          router.push("/rooms");
        }
      } catch (e) { console.error(e); router.push("/"); }
    })();
  }, [token, roomCode, router]);

  useEffect(() => {
    if (!me || !room) return;
    const socket = getSocket();

    // Join room
    socket.emit("join-room", { roomCode: room.code, user: { id: me.id, name: me.name } }, (ack: any) => {
      // opcional: tratar ack
      // console.log("join-room ack", ack);
    });

    const onNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };
    const onUserLeft = (user: any) => {
      // opcional: notificação de saída
      // console.log("user-left", user);
    };

    socket.on("new-message", onNewMessage);
    socket.on("user-left", onUserLeft);

    return () => {
      socket.emit("leave-room", { roomCode: room.code, user: { id: me.id, name: me.name } });
      socket.off("new-message", onNewMessage);
      socket.off("user-left", onUserLeft);
    };
  }, [me, room]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const socket = getSocket();
    if (!me || !room || !input.trim()) return;
    const payload = { roomCode: room.code, userId: me.id, content: input.trim() };
    socket.emit("send-message", payload, (ack: any) => {
      // ack opcional
    });
    setInput("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sala: {room?.name} <span className="text-xs text-slate-400">({room?.code})</span></h1>

      <div className="card space-y-3">
        <div ref={listRef} className="h-[50vh] overflow-y-auto space-y-2 pr-2">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-2 rounded-xl max-w-[70%] ${m.userId===me?.id ? "ml-auto bg-indigo-600/40" : "bg-slate-800/60"}`}>
              <div className="text-xs text-slate-400">{m.user?.name ?? (m.userId===me?.id ? "Você" : `User ${m.userId}`)}</div>
              <div className="">{m.content}</div>
            </div>
          ))}
          {messages.length===0 && <div className="text-sm text-slate-400">Sem mensagens ainda.</div>}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input className="input flex-1" placeholder="Digite sua mensagem..." value={input} onChange={e=>setInput(e.target.value)} />
          <button className="button">Enviar</button>
        </form>
      </div>
    </div>
  );
}
