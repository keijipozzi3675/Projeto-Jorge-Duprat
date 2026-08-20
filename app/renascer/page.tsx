import type { Metadata } from "next";
import SecretGame from "./secret-game";

export const metadata: Metadata = {
  title: "O Corredor da Fênix | Arquivo Oculto",
  description: "Um pequeno mistério interativo escondido no Portal Duprat.",
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return <SecretGame />;
}
