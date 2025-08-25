
"use client";

import { useState } from "react";
import { UsersAPI } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login"|"register"|"confirm">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string| null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const { token } = await UsersAPI.login({ email, password });
      setToken(token);
      router.push("/rooms");
    } catch (err: any) {
      setMsg(err.message || "Erro ao logar");
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await UsersAPI.register({ name, email, password });
      setMsg(`Código enviado (simulado): ${res.code} — agora confirme no passo seguinte.`);
      setMode("confirm");
    } catch (err: any) {
      setMsg(err.message || "Erro ao registrar");
    } finally { setLoading(false); }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      await UsersAPI.confirmRegister({ email, code });
      setMsg("Conta confirmada! Faça login.");
      setMode("login");
    } catch (err: any) {
      setMsg(err.message || "Erro ao confirmar");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Chat Client</h1>
      <div className="card space-y-4">
        <div className="flex gap-2">
          <button className={`button ${mode==="login"?"opacity-100":"opacity-70"}`} onClick={()=>setMode("login")}>Login</button>
          <button className={`button ${mode==="register"?"opacity-100":"opacity-70"}`} onClick={()=>setMode("register")}>Registrar</button>
          <button className={`button ${mode==="confirm"?"opacity-100":"opacity-70"}`} onClick={()=>setMode("confirm")}>Confirmar</button>
        </div>
        {msg && <p className="text-sm text-slate-300">{msg}</p>}

        {mode==="login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Senha</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <button className="button" disabled={loading}>{loading? "Entrando..." : "Entrar"}</button>
          </form>
        )}

        {mode==="register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label>Nome</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Senha</label>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <button className="button" disabled={loading}>{loading? "Registrando..." : "Registrar"}</button>
          </form>
        )}

        {mode==="confirm" && (
          <form onSubmit={handleConfirm} className="space-y-3">
            <div>
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Código</label>
              <input className="input" value={code} onChange={e=>setCode(e.target.value)} required />
            </div>
            <button className="button" disabled={loading}>{loading? "Confirmando..." : "Confirmar"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
