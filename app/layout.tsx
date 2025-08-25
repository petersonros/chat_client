
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Client",
  description: "Next.js + Socket.IO chat client for chat-server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
