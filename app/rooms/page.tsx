
"use client";

import { useEffect, useState } from "react";
import { RoomsAPI, Room, UsersAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [me, setMe] = useState<{ id:number; name:string }|null>(null);
  const [loading, setLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    (async () => {
      try {
        const user = await UsersAPI.me(token);
        setMe(user);
        setRooms(await RoomsAPI.list());
      } catch (e) { console.error(e); }
    })();
  }, [token, router]);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const room = await RoomsAPI.create({ name: name || "Sala" });
      setRooms([room, ...rooms]);
      setName("");
    } catch (e) { alert("Erro ao criar sala"); console.error(e); }
    finally { setLoading(false); }
  }

  function goChat(code: string) { router.push(`/chat/${code}`); }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Salas</h1>

      <div className="card space-y-3">
        <p>Olá, {me?.name ?? "..."}</p>
        <form onSubmit={createRoom} className="flex gap-2">
          <input className="input" placeholder="Nome da sala (opcional)" value={name} onChange={e=>setName(e.target.value)} />
          <button className="button" disabled={loading}>{loading?"Criando...":"Criar sala"}</button>
        </form>

        <div className="flex gap-2">
          <input className="input" placeholder="Código da sala (ex: ABCD12)" value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
          <button className="button" onClick={()=> goChat(joinCode)} disabled={!joinCode}>Entrar</button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">Salas existentes</h2>
        <ul className="space-y-2">
          {rooms.map(r => (
            <li key={r.id} className="flex items-center justify-between">
              <div><b>{r.name}</b> <span className="text-xs text-slate-400">({r.code})</span></div>
              <button className="button" onClick={()=>goChat(r.code)}>Entrar</button>
            </li>
          ))}
        </ul>
        {rooms.length===0 && <p className="text-sm text-slate-400">Nenhuma sala ainda.</p>}
      </div>
    </div>
  );
}
