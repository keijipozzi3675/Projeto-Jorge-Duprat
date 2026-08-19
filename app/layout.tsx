import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Duprat | E.E. Jorge Duprat Figueiredo",
  description:
    "Informações, biblioteca, projetos e serviços da E.E. Jorge Duprat Figueiredo.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
