import type { Metadata } from "next";
import "./globals.css";
import GlobalTools from "./global-tools";

export const metadata: Metadata = {
  metadataBase: new URL("https://portal-duprat.viciadosjogos01.chatgpt.site"),
  title: "Portal Duprat | E.E. Jorge Duprat Figueiredo",
  description:
    "Informações, biblioteca, projetos e serviços da E.E. Jorge Duprat Figueiredo.",
  openGraph: {
    title: "Portal Duprat | E.E. Jorge Duprat Figueiredo",
    description: "Informações, cursos, biblioteca e serviços da comunidade escolar.",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/assets/assinatura-duprat.jpg", width: 1536, height: 1024, alt: "E.E. Jorge Duprat Figueiredo" }],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/assets/brasao-jdf.png",
    shortcut: "/assets/brasao-jdf.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}<GlobalTools /></body>
    </html>
  );
}
