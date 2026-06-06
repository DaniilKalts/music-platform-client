import type { Metadata } from "next";
import "./styles/globals.css";
import { AppShell } from "@/widgets/AppShell/ui/AppShell";

export const metadata: Metadata = {
  title: "Мьюзиканто",
  description: "Мьюзиканто — слушай музыку без границ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-black text-white selection:bg-accent/30">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
