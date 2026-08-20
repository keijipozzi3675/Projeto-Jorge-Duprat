import type { Metadata } from "next";
import InstitutionalPage from "../institutional-page";
import BibliotecaClient from "./biblioteca-client";

export const metadata: Metadata = {
  title: "Biblioteca | Portal Duprat",
  description: "Catálogo, reservas e fila de livros da E.E. Jorge Duprat Figueiredo.",
};

export default function BibliotecaPage() {
  return (
    <InstitutionalPage active="biblioteca" eyebrow="Sala de leitura" title="Biblioteca Duprat" intro="Pesquise o catálogo, reserve um exemplar disponível ou entre na fila sem precisar criar uma conta.">
      <BibliotecaClient />
    </InstitutionalPage>
  );
}
