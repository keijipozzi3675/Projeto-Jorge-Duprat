"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { books, type Book } from "../library-data";

export default function BibliotecaClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [reservationBook, setReservationBook] = useState<Book | null>(null);
  const [reservationState, setReservationState] = useState<"form" | "sending" | "success">("form");
  const [reservationMessage, setReservationMessage] = useState("");

  const categories = ["Todos", ...Array.from(new Set(books.map((book) => book.category)))];
  const filteredBooks = useMemo(() => books.filter((book) => {
    const term = search.toLocaleLowerCase("pt-BR");
    const matchesText = `${book.title} ${book.author}`.toLocaleLowerCase("pt-BR").includes(term);
    return matchesText && (category === "Todos" || book.category === category);
  }), [search, category]);

  function openReservation(book: Book) {
    setReservationBook(book);
    setReservationState("form");
    setReservationMessage("");
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reservationBook) return;
    const form = new FormData(event.currentTarget);
    setReservationState("sending");
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bookId: reservationBook.id,
          studentName: String(form.get("studentName") ?? ""),
          className: String(form.get("className") ?? ""),
          phone: String(form.get("phone") ?? ""),
        }),
      });
      const payload = await response.json() as { status?: string; position?: number; message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível registrar a reserva.");
      setReservationMessage(payload.message || (payload.status === "waiting" ? `Você entrou na fila na posição ${payload.position}.` : "O livro foi separado para retirada."));
    } catch {
      setReservationMessage(reservationBook.available > 0 ? "Solicitação registrada para demonstração. A secretaria poderá confirmar a retirada." : "Entrada na fila registrada para demonstração. A secretaria poderá confirmar sua posição.");
    }
    setReservationState("success");
  }

  return (
    <>
      <section className="institutional-section library-page-section">
        <div className="shell">
          <div className="library-page-intro"><div><span className="section-label">CATÁLOGO ESCOLAR</span><h2>Encontre sua próxima leitura</h2><p>Pesquise por título ou autor e filtre o acervo por categoria.</p></div><div><strong>+1.200</strong><span>títulos cadastrados</span></div></div>
          <div className="catalog-tools library-page-tools">
            <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por título ou autor" /></label>
            <div className="category-scroller" aria-label="Filtrar livros por categoria">{categories.map((item) => <button key={item} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          </div>
          <div className="book-grid library-page-books">
            {filteredBooks.map((book) => <article className="book-card" key={book.id}><Link className="book-cover-link" href={`/biblioteca/livro/${book.slug}`} aria-label={`Conhecer o livro ${book.title}`}><span className={`book-cover cover-${book.color}`}><span className="cover-code">{book.code}</span><small>Biblioteca<br />Duprat</small><i /></span></Link><div className="book-info"><span className="book-category">{book.category}</span><h3><Link href={`/biblioteca/livro/${book.slug}`}>{book.title}</Link></h3><p>{book.author}</p><div className="availability"><span className={book.available > 0 ? "available" : "waiting"}><i /> {book.available > 0 ? `${book.available} ${book.available > 1 ? "disponíveis" : "disponível"}` : "Fila de espera"}</span></div><Link className="book-detail-link" href={`/biblioteca/livro/${book.slug}`}>Conhecer o livro <span>→</span></Link><button onClick={() => openReservation(book)}>{book.available > 0 ? "Reservar livro" : "Entrar na fila"}<span>→</span></button></div></article>)}
            {filteredBooks.length === 0 && <div className="empty-books"><strong>Nenhum livro encontrado</strong><span>Tente outro título, autor ou categoria.</span></div>}
          </div>
          <div className="queue-explainer library-page-queue"><span className="queue-icon" aria-hidden="true">☷</span><div><strong>Reserva e fila automática</strong><p>Quando não há exemplar disponível, a solicitação entra na fila. A escola acompanha a ordem e prepara os avisos de retirada e devolução.</p></div></div>
        </div>
      </section>

      {reservationBook && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setReservationBook(null)}><section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="library-reservation-title"><button className="modal-close" onClick={() => setReservationBook(null)} aria-label="Fechar">×</button>{reservationState !== "success" ? <><span className="modal-kicker">{reservationBook.available > 0 ? "RESERVA DE LIVRO" : "FILA DE RESERVA"}</span><div className="reservation-book"><div className={`book-cover small cover-${reservationBook.color}`}><span className="cover-code">{reservationBook.code}</span></div><div><h2 id="library-reservation-title">{reservationBook.title}</h2><p>{reservationBook.author}</p><span className={reservationBook.available > 0 ? "availability-inline available" : "availability-inline waiting"}>{reservationBook.available > 0 ? "Disponível para reserva" : "Você será incluído na fila"}</span></div></div><form onSubmit={submitReservation}><label>Nome completo<input name="studentName" required minLength={3} placeholder="Nome do estudante" /></label><div className="form-row"><label>Turma<input name="className" required placeholder="Ex.: 2º B" /></label><label>WhatsApp<input name="phone" required inputMode="tel" placeholder="(11) 99999-9999" /></label></div><label className="consent"><input type="checkbox" required /><span>Autorizo o envio de avisos sobre esta reserva. Os dados serão usados somente pela escola.</span></label><button className="button button-primary" disabled={reservationState === "sending"}>{reservationState === "sending" ? "Registrando..." : reservationBook.available > 0 ? "Confirmar reserva" : "Entrar na fila"}</button></form></> : <div className="reservation-success"><span>✓</span><small>SOLICITAÇÃO REGISTRADA</small><h2>Tudo certo!</h2><p>{reservationMessage}</p><div className="success-note"><strong>Próxima etapa</strong><span>A secretaria acompanha a solicitação e confirma os avisos necessários.</span></div><button className="button button-primary" onClick={() => setReservationBook(null)}>Concluir</button></div>}</section></div>}
    </>
  );
}
