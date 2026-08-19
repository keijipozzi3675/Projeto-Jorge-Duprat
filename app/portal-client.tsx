"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  available: number;
  code: string;
  color: string;
};

type ChatMessage = { from: "bot" | "user"; text: string };

const books: Book[] = [
  { id: 1, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", category: "Literatura", available: 2, code: "OP", color: "sun" },
  { id: 2, title: "Quarto de Despejo", author: "Carolina Maria de Jesus", category: "Literatura brasileira", available: 0, code: "QD", color: "plum" },
  { id: 3, title: "Dom Casmurro", author: "Machado de Assis", category: "Clássicos", available: 3, code: "DC", color: "ocean" },
  { id: 4, title: "Capitães da Areia", author: "Jorge Amado", category: "Literatura brasileira", available: 1, code: "CA", color: "clay" },
  { id: 5, title: "Extraordinário", author: "R. J. Palacio", category: "Juvenil", available: 0, code: "EX", color: "mint" },
  { id: 6, title: "Torto Arado", author: "Itamar Vieira Junior", category: "Contemporâneo", available: 2, code: "TA", color: "earth" },
];

const notices = [
  { day: "21", month: "AGO", tag: "Comunidade", title: "Reunião de pais e responsáveis", text: "Encontro por turma para acompanhar o desenvolvimento dos estudantes.", time: "19h • Auditório" },
  { day: "27", month: "AGO", tag: "Pedagógico", title: "Feira de Ciências e Tecnologia", text: "Apresentação dos projetos desenvolvidos pelos estudantes ao longo do bimestre.", time: "9h às 16h • Pátio" },
  { day: "02", month: "SET", tag: "Oportunidade", title: "Inscrições para o grêmio estudantil", text: "Forme sua chapa, consulte o regulamento e participe das decisões da escola.", time: "Até 6 de setembro" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="Página inicial do Portal Duprat">
      <span className="brand-mark" aria-hidden="true"><span>JD</span></span>
      <span className="brand-copy"><strong>Portal Duprat</strong><small>Escola Estadual</small></span>
    </Link>
  );
}

function Header({ onAccessibility }: { onAccessibility: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="service-strip">
        <div className="shell service-strip-inner">
          <span><span className="status-dot" /> Escola aberta hoje das 7h às 22h40</span>
          <span className="strip-links"><a href="tel:+551127210278">(11) 2721-0278</a><button onClick={onAccessibility}>Acessibilidade</button></span>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal">
            <a href="#escola" onClick={() => setMenuOpen(false)}>A escola</a>
            <a href="#avisos" onClick={() => setMenuOpen(false)}>Avisos</a>
            <a href="#biblioteca" onClick={() => setMenuOpen(false)}>Biblioteca</a>
            <Link href="/equipe" onClick={() => setMenuOpen(false)}>Equipe</Link>
            <a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
            <Link href="/gestao" className="nav-login">Área de gestão <span aria-hidden="true">↗</span></Link>
          </nav>
          <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
        </div>
      </header>
    </>
  );
}

export default function PortalClient() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = window.localStorage.getItem("duprat-theme");
    return savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [contrast, setContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { from: "bot", text: "Olá! Eu sou a Duda, assistente do Portal Duprat. Posso ajudar com horários, biblioteca, endereço e serviços da escola." },
  ]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [reservationBook, setReservationBook] = useState<Book | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<(typeof notices)[number] | null>(null);
  const [reservationState, setReservationState] = useState<"form" | "sending" | "success">("form");
  const [reservationMessage, setReservationMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    window.localStorage.setItem("duprat-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrast);
    document.documentElement.classList.toggle("large-text", largeText);
  }, [contrast, largeText]);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [chatMessages, chatOpen]);

  const categories = ["Todos", ...Array.from(new Set(books.map((book) => book.category)))];
  const filteredBooks = useMemo(() => books.filter((book) => {
    const term = search.toLocaleLowerCase("pt-BR");
    const matchesText = `${book.title} ${book.author}`.toLocaleLowerCase("pt-BR").includes(term);
    return matchesText && (category === "Todos" || book.category === category);
  }), [search, category]);

  function answerChat(question: string) {
    const normalized = question.toLocaleLowerCase("pt-BR");
    if (normalized.includes("horário") || normalized.includes("horario")) return "A escola funciona de segunda a sexta, das 7h às 22h40. A secretaria atende das 8h às 17h.";
    if (normalized.includes("endereço") || normalized.includes("onde fica") || normalized.includes("mapa")) return "Estamos na Rua Antonio Lombardo, 140, Jardim Santa Terezinha, São Paulo. O mapa e a rota ficam na seção Contato.";
    if (normalized.includes("livro") || normalized.includes("biblioteca") || normalized.includes("reserva")) return "Você pode pesquisar o catálogo e reservar sem criar uma conta. Se o livro estiver emprestado, sua reserva entra automaticamente na fila.";
    if (normalized.includes("telefone") || normalized.includes("contato")) return "O telefone da escola é (11) 2721-0278 e o e-mail institucional é e043928a@educacao.sp.gov.br.";
    if (normalized.includes("gestão") || normalized.includes("secretaria") || normalized.includes("professor")) return "A Área de gestão é exclusiva para equipe autorizada. Nela, secretaria, direção e professores têm funções diferentes.";
    return "Posso ajudar com: horário da escola, localização, contato, biblioteca, reservas e acesso da equipe. Escolha um assunto ou escreva sua dúvida com outras palavras.";
  }

  function sendChat(event?: FormEvent) {
    event?.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    setChatMessages((messages) => [...messages, { from: "user", text: question }, { from: "bot", text: answerChat(question) }]);
    setChatInput("");
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
      setReservationMessage(reservationBook.available > 0
        ? "Reserva registrada para demonstração. Na publicação final, a confirmação também ficará salva para a secretaria."
        : "Entrada na fila registrada para demonstração. Na publicação final, você receberá a posição e os avisos pelo WhatsApp.");
    }
    setReservationState("success");
  }

  function openReservation(book: Book) {
    setReservationBook(book);
    setReservationState("form");
    setReservationMessage("");
  }

  return (
    <div className="portal-root">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header onAccessibility={() => setAccessOpen(true)} />

      <main id="conteudo">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="shell hero-inner">
            <div className="hero-copy reveal">
              <span className="eyebrow"><span /> Educação pública que transforma</span>
              <h1>Um portal para <em>aprender,</em><br />participar e crescer.</h1>
              <p>Informação clara, serviços acessíveis e uma comunidade escolar cada vez mais conectada.</p>
              <div className="hero-actions">
                <a className="button button-gold" href="#biblioteca">Explorar biblioteca <span>→</span></a>
                <a className="button button-ghost" href="#avisos">Ver avisos da escola</a>
              </div>
              <div className="hero-trust">
                <span className="mini-avatars"><i>A</i><i>P</i><i>F</i><i>+</i></span>
                <span><strong>Comunidade Duprat</strong><small>Alunos, famílias e educadores</small></span>
              </div>
            </div>
            <div className="hero-panel reveal delay-1">
              <div className="hero-panel-top">
                <span className="panel-kicker">Hoje na escola</span>
                <span className="live-pill"><i /> Em funcionamento</span>
              </div>
              <div className="next-event">
                <span className="event-icon" aria-hidden="true">✦</span>
                <div><small>PRÓXIMO DESTAQUE</small><h2>Feira de Ciências e Tecnologia</h2><p>27 de agosto • 9h às 16h</p></div>
              </div>
              <div className="panel-divider" />
              <div className="quick-grid">
                <a href="#biblioteca"><span aria-hidden="true">⌕</span><strong>Catálogo</strong><small>Encontre um livro</small></a>
                <a href="#contato"><span aria-hidden="true">⌖</span><strong>Como chegar</strong><small>Mapa e endereço</small></a>
                <Link href="/equipe"><span aria-hidden="true">◎</span><strong>Nossa equipe</strong><small>Conheça a escola</small></Link>
                <Link href="/gestao"><span aria-hidden="true">◇</span><strong>Gestão</strong><small>Acesso autorizado</small></Link>
              </div>
            </div>
          </div>
          <div className="hero-wave" aria-hidden="true" />
        </section>

        <section className="section notices-section" id="avisos">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><span className="section-label">FIQUE POR DENTRO</span><h2>Atualizações da escola</h2><p>Acompanhe eventos, oportunidades e informações importantes.</p></div>
              <a className="text-link" href="#avisos">Todos os avisos <span>→</span></a>
            </div>
            <div className="notice-grid">
              {notices.map((notice, index) => (
                <article className="notice-card" key={notice.title}>
                  <div className="date-badge"><strong>{notice.day}</strong><span>{notice.month}</span></div>
                  <div className="notice-content"><span className={`tag tag-${index + 1}`}>{notice.tag}</span><h3>{notice.title}</h3><p>{notice.text}</p><small><span aria-hidden="true">◷</span> {notice.time}</small></div>
                  <button onClick={() => setSelectedNotice(notice)} aria-label={`Ler aviso: ${notice.title}`}><span>→</span></button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section school-section" id="escola">
          <div className="shell school-grid">
            <div className="school-visual">
              <div className="building-card">
                <span className="building-sun" />
                <div className="building"><span className="roof" /><span className="block block-a" /><span className="block block-b" /><span className="windows" /><span className="door" /></div>
                <span className="plant plant-a">✦</span><span className="plant plant-b">✦</span>
              </div>
              <div className="history-chip"><strong>Desde 1996</strong><span>Construindo histórias na Zona Leste</span></div>
            </div>
            <div className="school-copy">
              <span className="section-label">NOSSA ESCOLA</span>
              <h2>Um espaço de conhecimento, convivência e futuro.</h2>
              <p>A E.E. Jorge Duprat Figueiredo atende a comunidade do Jardim Santa Terezinha com ensino comprometido, projetos que valorizam o protagonismo e uma estrutura pensada para aprender.</p>
              <div className="feature-list">
                <div><span>✓</span><p><strong>Aprendizagem na prática</strong><small>Laboratórios de ciências e informática.</small></p></div>
                <div><span>✓</span><p><strong>Cultura e leitura</strong><small>Sala de leitura, projetos e acervo escolar.</small></p></div>
                <div><span>✓</span><p><strong>Esporte e convivência</strong><small>Quadra, pátio coberto e espaços coletivos.</small></p></div>
              </div>
              <Link className="text-link" href="/equipe">Conheça nossa equipe <span>→</span></Link>
            </div>
          </div>
          <div className="shell stat-row">
            <div><strong>3</strong><span>períodos de atendimento</span></div><div><strong>9+</strong><span>espaços de aprendizagem</span></div><div><strong>4</strong><span>modalidades de ensino</span></div><div><strong>1</strong><span>comunidade conectada</span></div>
          </div>
        </section>

        <section className="section library-section" id="biblioteca">
          <div className="shell">
            <div className="library-heading">
              <div><span className="section-label section-label-light">SALA DE LEITURA</span><h2>Uma história esperando por você.</h2><p>Pesquise, reserve e acompanhe a fila sem precisar criar uma conta.</p></div>
              <div className="library-stat"><strong>+1.200</strong><span>títulos no acervo</span></div>
            </div>
            <div className="catalog-tools">
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por título ou autor" /></label>
              <div className="category-scroller" aria-label="Filtrar livros por categoria">
                {categories.map((item) => <button key={item} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
            </div>
            <div className="book-grid">
              {filteredBooks.map((book) => (
                <article className="book-card" key={book.id}>
                  <div className={`book-cover cover-${book.color}`}><span className="cover-code">{book.code}</span><small>Biblioteca<br />Duprat</small><i /></div>
                  <div className="book-info"><span className="book-category">{book.category}</span><h3>{book.title}</h3><p>{book.author}</p><div className="availability"><span className={book.available > 0 ? "available" : "waiting"}><i /> {book.available > 0 ? `${book.available} ${book.available > 1 ? "disponíveis" : "disponível"}` : "Fila de espera"}</span></div><button onClick={() => openReservation(book)}>{book.available > 0 ? "Reservar livro" : "Entrar na fila"}<span>→</span></button></div>
                </article>
              ))}
              {filteredBooks.length === 0 && <div className="empty-books"><strong>Nenhum livro encontrado</strong><span>Tente buscar outro título, autor ou categoria.</span></div>}
            </div>
            <div className="queue-explainer">
              <span className="queue-icon" aria-hidden="true">☷</span>
              <div><strong>Como funciona a fila?</strong><p>Quando não há exemplar disponível, sua reserva entra na fila automaticamente. Você recebe um aviso quando chegar sua vez e terá um prazo para retirar o livro.</p></div>
              <button onClick={() => setChatOpen(true)}>Tirar uma dúvida</button>
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contato">
          <div className="shell contact-grid">
            <div className="contact-copy">
              <span className="section-label">FALE COM A ESCOLA</span><h2>Estamos perto de você.</h2><p>Use nossos canais oficiais ou trace sua rota até a escola.</p>
              <div className="contact-list">
                <a href="tel:+551127210278"><span aria-hidden="true">☎</span><div><small>TELEFONE</small><strong>(11) 2721-0278</strong></div></a>
                <a href="mailto:e043928a@educacao.sp.gov.br"><span aria-hidden="true">✉</span><div><small>E-MAIL</small><strong>e043928a@educacao.sp.gov.br</strong></div></a>
                <div><span aria-hidden="true">◷</span><div><small>SECRETARIA</small><strong>Segunda a sexta, 8h às 17h</strong></div></div>
              </div>
            </div>
            <div className="map-card">
              <div className="map-pattern"><span className="road road-a" /><span className="road road-b" /><span className="road road-c" /><span className="map-pin">JD</span></div>
              <div className="map-address"><div><small>ONDE ESTAMOS</small><strong>Rua Antonio Lombardo, 140</strong><span>Jardim Santa Terezinha • São Paulo — SP<br />CEP 03572-230</span></div><a href="https://www.google.com/maps/search/?api=1&query=Rua+Antonio+Lombardo%2C+140%2C+Sao+Paulo+SP" target="_blank" rel="noreferrer">Abrir rota <span>↗</span></a></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-accent" />
        <div className="shell footer-main">
          <div className="footer-brand"><Brand compact /><p>Educação pública, comunidade presente e caminhos para o futuro.</p></div>
          <div><strong>Portal</strong><a href="#escola">A escola</a><a href="#avisos">Avisos</a><a href="#biblioteca">Biblioteca</a><Link href="/equipe">Equipe</Link></div>
          <div><strong>Serviços</strong><a href="#contato">Contato</a><a href="#contato">Como chegar</a><Link href="/gestao">Área de gestão</Link><button onClick={() => setAccessOpen(true)}>Acessibilidade</button></div>
          <div><strong>Endereço</strong><p>Rua Antonio Lombardo, 140<br />Jd. Santa Terezinha<br />São Paulo — SP</p></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 E.E. Jorge Duprat Figueiredo</span><span>Portal escolar em desenvolvimento educacional</span></div>
      </footer>

      <div className="floating-tools" aria-label="Ferramentas rápidas">
        <button onClick={() => setDark((value) => !value)} title={dark ? "Ativar modo claro" : "Ativar modo noturno"} aria-label={dark ? "Ativar modo claro" : "Ativar modo noturno"}>{dark ? "☀" : "☾"}</button>
        <button onClick={() => setAccessOpen(true)} title="Acessibilidade" aria-label="Abrir recursos de acessibilidade">Aa</button>
      </div>

      <button className={chatOpen ? "chat-launcher is-open" : "chat-launcher"} onClick={() => setChatOpen((value) => !value)} aria-label={chatOpen ? "Fechar assistente virtual" : "Abrir assistente virtual"}>
        <span className="chat-face">{chatOpen ? "×" : "D"}</span>{!chatOpen && <span className="chat-label"><strong>Precisa de ajuda?</strong><small>Fale com a Duda</small></span>}
      </button>
      {chatOpen && (
        <aside className="chat-window" aria-label="Assistente virtual Duda">
          <header><span className="chat-avatar">D</span><div><strong>Duda</strong><small><i /> Assistente virtual</small></div><button onClick={() => setChatOpen(false)} aria-label="Fechar chat">×</button></header>
          <div className="chat-body">
            {chatMessages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}>{message.text}</div>)}
            {chatMessages.length === 1 && <div className="chat-suggestions"><button onClick={() => { setChatInput("Qual é o horário da escola?"); }}>Horários</button><button onClick={() => { setChatInput("Como reservar um livro?"); }}>Biblioteca</button><button onClick={() => { setChatInput("Onde fica a escola?"); }}>Endereço</button></div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Digite sua dúvida..." aria-label="Mensagem para a Duda" /><button aria-label="Enviar mensagem">➤</button></form>
          <small className="chat-note">A Duda pode cometer erros. Confirme informações importantes com a secretaria.</small>
        </aside>
      )}

      {accessOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAccessOpen(false)}>
          <section className="access-panel" role="dialog" aria-modal="true" aria-labelledby="access-title">
            <header><div><span className="modal-icon">Aa</span><div><small>PERSONALIZE O PORTAL</small><h2 id="access-title">Acessibilidade</h2></div></div><button onClick={() => setAccessOpen(false)} aria-label="Fechar">×</button></header>
            <div className="access-options">
              <button className={largeText ? "selected" : ""} onClick={() => setLargeText((value) => !value)}><span className="access-symbol">A+</span><strong>Texto ampliado</strong><small>Aumenta o tamanho das letras</small><i>{largeText ? "Ativo" : "Ativar"}</i></button>
              <button className={contrast ? "selected" : ""} onClick={() => setContrast((value) => !value)}><span className="access-symbol contrast-symbol" /><strong>Alto contraste</strong><small>Realça textos e elementos</small><i>{contrast ? "Ativo" : "Ativar"}</i></button>
              <button className={dark ? "selected" : ""} onClick={() => setDark((value) => !value)}><span className="access-symbol">☾</span><strong>Modo noturno</strong><small>Reduz o brilho da interface</small><i>{dark ? "Ativo" : "Ativar"}</i></button>
            </div>
            <button className="reset-access" onClick={() => { setDark(false); setContrast(false); setLargeText(false); }}>Restaurar configurações</button>
          </section>
        </div>
      )}

      {selectedNotice && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedNotice(null)}>
          <section className="reservation-modal notice-modal" role="dialog" aria-modal="true" aria-labelledby="notice-title">
            <button className="modal-close" onClick={() => setSelectedNotice(null)} aria-label="Fechar">×</button>
            <span className="modal-kicker">{selectedNotice.tag} • {selectedNotice.day} {selectedNotice.month}</span>
            <h2 id="notice-title">{selectedNotice.title}</h2>
            <p>{selectedNotice.text}</p>
            <div className="success-note"><strong>Quando e onde</strong><span>{selectedNotice.time}</span></div>
            <p className="notice-guidance">Em caso de dúvida, confirme os detalhes com a secretaria pelo telefone (11) 2721-0278.</p>
            <button className="button button-primary" onClick={() => setSelectedNotice(null)}>Entendi</button>
          </section>
        </div>
      )}

      {reservationBook && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setReservationBook(null)}>
          <section className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
            <button className="modal-close" onClick={() => setReservationBook(null)} aria-label="Fechar">×</button>
            {reservationState !== "success" ? (
              <>
                <span className="modal-kicker">{reservationBook.available > 0 ? "RESERVA DE LIVRO" : "FILA DE RESERVA"}</span>
                <div className="reservation-book"><div className={`book-cover small cover-${reservationBook.color}`}><span className="cover-code">{reservationBook.code}</span></div><div><h2 id="reservation-title">{reservationBook.title}</h2><p>{reservationBook.author}</p><span className={reservationBook.available > 0 ? "availability-inline available" : "availability-inline waiting"}>{reservationBook.available > 0 ? "Disponível para reserva" : "Você será incluído na fila"}</span></div></div>
                <form onSubmit={submitReservation}>
                  <label>Nome completo<input name="studentName" required minLength={3} placeholder="Nome do estudante" /></label>
                  <div className="form-row"><label>Turma<input name="className" required placeholder="Ex.: 2º B" /></label><label>WhatsApp<input name="phone" required inputMode="tel" placeholder="(11) 99999-9999" /></label></div>
                  <label className="consent"><input type="checkbox" required /><span>Autorizo o envio de avisos sobre esta reserva. Os dados serão usados somente pela escola.</span></label>
                  <button className="button button-primary" disabled={reservationState === "sending"}>{reservationState === "sending" ? "Registrando..." : reservationBook.available > 0 ? "Confirmar reserva" : "Entrar na fila"}</button>
                </form>
              </>
            ) : (
              <div className="reservation-success"><span>✓</span><small>SOLICITAÇÃO REGISTRADA</small><h2>Tudo certo!</h2><p>{reservationMessage}</p><div className="success-note"><strong>O que acontece agora?</strong><span>A secretaria acompanha a solicitação e o sistema prepara os avisos necessários para você.</span></div><button className="button button-primary" onClick={() => setReservationBook(null)}>Concluir</button></div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
