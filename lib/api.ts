
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3333";

export async function api<T>(path: string, opts: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export type User = { id: number; name: string; email: string; avatar?: string | null };
export type Room = { id: number; name: string; code: string };

export const UsersAPI = {
  register(data: { name: string; email: string; password: string }) {
    return api<{ user: User; code: string }>("/users/register", { method: "POST", body: JSON.stringify(data) });
  },
  confirmRegister(data: { email: string; code: string }) {
    return api<User>("/users/confirm-register", { method: "POST", body: JSON.stringify(data) });
  },
  login(data: { email: string; password: string }) {
    return api<{ token: string }>("/users/login", { method: "POST", body: JSON.stringify(data) });
  },
  me(token: string) {
    return api<User>("/users/me", {}, token);
  },
};

export const RoomsAPI = {
  list() { return api<Room[]>("/rooms"); },
  create(data: { name: string }) { return api<Room>("/rooms", { method: "POST", body: JSON.stringify(data) }); },
  byCodeOrId(codeOrId: string|number) { return api<Room>(`/rooms/${codeOrId}`); }, // se o backend não suportar por 'code', a tela faz fallback via list()
  messages(roomId: number) { return api<any[]>(`/rooms/${roomId}/messages`); },
};
