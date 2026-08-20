"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { books, type Book } from "./library-data";
import { openGlobalAccessibility, openGlobalChat } from "./global-tools";
import { schoolNotices as notices } from "./notice-data";

const courses = [
  { icon: "6º", title: "Ensino Fundamental II", period: "Manhã e tarde", text: "Corresponde aos 6º, 7º, 8º e 9º anos. Nessa etapa, os estudantes aprofundam os conhecimentos adquiridos e desenvolvem maior autonomia nos estudos." },
  { icon: "EM", title: "Ensino Médio", period: "Manhã e tarde", text: "Etapa final da Educação Básica, prepara os estudantes para a continuidade dos estudos, o mundo do trabalho e a vida em sociedade." },
  { icon: "</>", title: "Técnico em Desenvolvimento de Sistemas", period: "Integrado ao Ensino Médio", text: "Curso técnico implementado em 2024, com programação, tecnologia e desenvolvimento de projetos autorais." },
  { icon: "EJA", title: "Educação de Jovens e Adultos", period: "Período noturno", text: "Oportunidade de retomada e conclusão dos estudos com certificação válida do Ensino Médio." },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand ${compact ? "brand-compact" : ""}`} aria-label="Página inicial do Portal Duprat">
      <span className="brand-mark" aria-hidden="true"><Image src="/assets/brasao-jdf.png" alt="" width={400} height={425} priority unoptimized /></span>
      <span className="brand-copy"><strong>E.E. Jorge Duprat</strong><small>Figueiredo</small></span>
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
            <Link href="/escola" onClick={() => setMenuOpen(false)}>A escola</Link>
            <Link href="/cursos" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <Link href="/noticias" onClick={() => setMenuOpen(false)}>Notícias</Link>
            <Link href="/esportes-eventos" onClick={() => setMenuOpen(false)}>Esportes & Eventos</Link>
            <Link href="/avisos" onClick={() => setMenuOpen(false)}>Avisos</Link>
            <Link href="/biblioteca" onClick={() => setMenuOpen(false)}>Biblioteca</Link>
            <Link href="/equipe" onClick={() => setMenuOpen(false)}>Equipe</Link>
            <Link href="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
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
      <Header onAccessibility={openGlobalAccessibility} />

      <main id="conteudo">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="shell hero-inner">
            <div className="hero-copy reveal">
              <span className="eyebrow"><span /> Secretaria escolar e comunidade</span>
              <h1>Apoio, acolhimento e <em>organização</em> para toda a jornada escolar.</h1>
              <p>Um portal oficial para acessar informações, conhecer a escola, acompanhar avisos e usar os serviços da biblioteca.</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/contato">Falar com a escola <span>→</span></Link>
                <Link className="button button-ghost" href="/biblioteca">Explorar biblioteca</Link>
              </div>
              <div className="hero-stats" aria-label="Destaques da escola">
                <span><strong>1980</strong><small>ano da denominação Jorge Duprat</small></span>
                <span><strong>4</strong><small>modalidades de ensino</small></span>
                <span><strong>3</strong><small>períodos de atendimento</small></span>
              </div>
            </div>
            <div className="hero-media reveal delay-1">
              <Image src="/assets/frente-escola.jpg" alt="Fachada da Escola Estadual Jorge Duprat Figueiredo" fill priority unoptimized sizes="(max-width: 760px) 100vw, 48vw" />
              <div className="hero-media-overlay" />
              <Image className="hero-crest" src="/assets/brasao-jdf.png" alt="Brasão da E.E. Jorge Duprat Figueiredo" width={400} height={425} priority unoptimized />
              <div className="hero-photo-card">
                <span className="live-pill"><i /> Escola em funcionamento</span>
                <strong>E.E. Jorge Duprat Figueiredo</strong>
                <small>Jardim Santa Terezinha • São Paulo</small>
              </div>
            </div>
          </div>
          <div className="hero-wave" aria-hidden="true" />
        </section>

        <section className="section notices-section" id="avisos">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><span className="section-label">FIQUE POR DENTRO</span><h2>Atualizações da escola</h2><p>Acompanhe eventos, oportunidades e informações importantes.</p></div>
              <Link className="text-link" href="/avisos">Todos os avisos <span>→</span></Link>
            </div>
            <div className="notice-grid">
              {notices.map((notice, index) => (
                <article className="notice-card" key={notice.title}>
                  <div className="date-badge"><strong>{notice.day}</strong><span>{notice.month}</span></div>
                  <div className="notice-content"><span className={`tag tag-${index + 1}`}>{notice.tag}</span><h3>{notice.title}</h3><p>{notice.text}</p><small><span aria-hidden="true">◷</span> {notice.time}</small></div>
                  <Link className="notice-card-link" href={`/avisos/${notice.slug}`} aria-label={`Abrir aviso: ${notice.title}`}><span>→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section school-section" id="escola">
          <div className="shell school-grid">
            <div className="school-visual">
              <div className="school-photo-card">
                <Image src="/assets/estrutura-escola.jpg" alt="Área interna da E.E. Jorge Duprat Figueiredo" fill priority unoptimized sizes="(max-width: 760px) 100vw, 48vw" />
                <span className="school-photo-label"><strong>Estrutura real</strong><small>Espaços de acolhimento e aprendizagem</small></span>
              </div>
              <div className="history-chip"><strong>Desde 1980</strong><span>Com o nome Jorge Duprat Figueiredo</span></div>
            </div>
            <div className="school-copy">
              <span className="section-label">NOSSA ESCOLA</span>
              <h2>Uma história ligada à educação, à comunidade e ao futuro.</h2>
              <p>Localizada no Jardim Santa Terezinha, na Zona Leste de São Paulo, a escola homenageia o engenheiro Jorge Duprat Figueiredo (1918–1978), primeiro presidente da Fundacentro e referência brasileira em segurança e medicina do trabalho.</p>
              <p>O nome atual foi oficializado pelo Decreto nº 15.580, de 25 de agosto de 1980. Desde então, a escola fortalece vínculos, incentiva o protagonismo estudantil e amplia caminhos de aprendizagem.</p>
              <div className="feature-list">
                <div><span>16</span><p><strong>Salas de aula</strong><small>Ambientes para os diferentes ciclos.</small></p></div>
                <div><span>2</span><p><strong>Laboratórios</strong><small>Ciências e informática para aulas práticas.</small></p></div>
                <div><span>1</span><p><strong>Quadra coberta</strong><small>Esporte, convivência e projetos coletivos.</small></p></div>
              </div>
              <Link className="text-link" href="/equipe">Conheça nossa equipe <span>→</span></Link>
            </div>
          </div>
        </section>

        <section className="section courses-section" id="cursos">
          <div className="shell">
            <div className="section-heading courses-heading">
              <span className="section-label">FORMAÇÃO PARA CADA ETAPA</span>
              <h2>Nossos cursos</h2>
              <p>Da continuidade da Educação Básica à formação técnica e à retomada dos estudos.</p>
            </div>
            <div className="courses-grid">
              {courses.map((course, index) => (
                <article className={`course-card ${index === 2 ? "is-featured" : ""}`} key={course.title}>
                  <span className="course-icon" aria-hidden="true">{course.icon}</span>
                  <small>{course.period}</small>
                  <h3>{course.title}</h3>
                  <p>{course.text}</p>
                  {index === 2 && <span className="course-badge">Formação técnica</span>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="legacy-section" aria-label="Destaques da comunidade escolar">
          <Image className="legacy-watermark" src="/assets/brasao-watermark.png" alt="" width={500} height={531} aria-hidden="true" unoptimized />
          <div className="shell legacy-grid">
            <div>
              <span className="section-label section-label-light">ORGULHO DUPRAT</span>
              <h2>Talento que vai além da sala de aula.</h2>
              <p>Grêmio estudantil, feiras, passeios culturais e equipes interescolares aproximam estudantes, famílias e educadores.</p>
            </div>
            <div className="legacy-cards">
              <article><span>♕</span><div><strong>Xadrez</strong><small>Conquistas nas categorias sub-14 e sub-17</small></div></article>
              <article><span>◉</span><div><strong>Vôlei feminino</strong><small>Tradição e destaque em competições escolares</small></div></article>
              <article><span>✦</span><div><strong>Protagonismo</strong><small>Grêmio, ciência, cultura e projetos estudantis</small></div></article>
            </div>
          </div>
        </section>

        <section className="section home-news-section" aria-labelledby="home-news-title">
          <div className="shell">
            <div className="split-heading">
              <div><span className="section-label">ACONTECE NO DUPRAT</span><h2 id="home-news-title">Notícias da escola</h2><p>Conquistas, projetos e registros da nossa comunidade escolar.</p></div>
              <Link className="text-link" href="/noticias">Ver todas as notícias <span>→</span></Link>
            </div>
            <div className="home-news-grid">
              <Link className="home-news-feature" href="/noticias">
                <Image src="/assets/noticias/mural-campeoes-duprat.jpg" alt="Mural de conquistas esportivas do Duprat" fill unoptimized sizes="(max-width: 760px) 100vw, 60vw" />
                <span className="home-news-overlay"><small>ESPORTE ESCOLAR</small><strong>Um legado de dedicação e conquistas</strong><span>Conheça os destaques →</span></span>
              </Link>
              <Link className="home-news-side" href="/noticias">
                <span className="home-news-side-image"><Image src="/assets/noticias/time-feminino-medalhas.jpg" alt="Equipe feminina da escola reunida com medalhas" fill unoptimized sizes="(max-width: 760px) 100vw, 34vw" /></span>
                <span><small>COMUNIDADE</small><strong>Trabalho em equipe dentro e fora da quadra</strong><span>Ler notícia →</span></span>
              </Link>
            </div>
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
                  <Link className="book-cover-link" href={`/biblioteca/livro/${book.slug}`} aria-label={`Conhecer o livro ${book.title}`}><span className={`book-cover cover-${book.color}`}><span className="cover-code">{book.code}</span><small>Biblioteca<br />Duprat</small><i /></span></Link>
                  <div className="book-info"><span className="book-category">{book.category}</span><h3><Link href={`/biblioteca/livro/${book.slug}`}>{book.title}</Link></h3><p>{book.author}</p><div className="availability"><span className={book.available > 0 ? "available" : "waiting"}><i /> {book.available > 0 ? `${book.available} ${book.available > 1 ? "disponíveis" : "disponível"}` : "Fila de espera"}</span></div><Link className="book-detail-link" href={`/biblioteca/livro/${book.slug}`}>Conhecer o livro <span>→</span></Link><button onClick={() => openReservation(book)}>{book.available > 0 ? "Reservar livro" : "Entrar na fila"}<span>→</span></button></div>
                </article>
              ))}
              {filteredBooks.length === 0 && <div className="empty-books"><strong>Nenhum livro encontrado</strong><span>Tente buscar outro título, autor ou categoria.</span></div>}
            </div>
            <div className="queue-explainer">
              <span className="queue-icon" aria-hidden="true">☷</span>
              <div><strong>Como funciona a fila?</strong><p>Quando não há exemplar disponível, sua reserva entra na fila automaticamente. Você recebe um aviso quando chegar sua vez e terá um prazo para retirar o livro.</p></div>
              <button onClick={openGlobalChat}>Tirar uma dúvida</button>
            </div>
          </div>
        </section>

        <section className="section contact-section" id="contato">
          <div className="shell contact-grid">
            <div className="contact-copy">
              <span className="section-label">FALE COM A ESCOLA</span><h2>Estamos perto de você.</h2><p>Use nossos canais oficiais ou trace sua rota até a escola.</p>
              <div className="contact-list">
                <a href="tel:+551127210278"><span aria-hidden="true">☎</span><div><small>TELEFONE</small><strong>(11) 2721-0278</strong></div></a>
                <a href="tel:+551127222631"><span aria-hidden="true">☎</span><div><small>TELEFONE ALTERNATIVO</small><strong>(11) 2722-2631</strong></div></a>
                <a href="mailto:e043928a@educacao.sp.gov.br"><span aria-hidden="true">✉</span><div><small>E-MAIL</small><strong>e043928a@educacao.sp.gov.br</strong></div></a>
                <div><span aria-hidden="true">◷</span><div><small>SECRETARIA</small><strong>Segunda a sexta, 8h às 17h</strong></div></div>
              </div>
              <div className="assistant-invite">
                <Image src="/assets/mascote-full.png" alt="DupratBot, mascote azul do portal" width={330} height={476} unoptimized />
                <div><small>POSSO AJUDAR?</small><strong>Converse com o DupratBot</strong><span>Tire dúvidas rápidas sobre horários, contato e biblioteca.</span><button onClick={openGlobalChat}>Iniciar conversa →</button></div>
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
        <div className="footer-story"><div className="shell"><Image src="/assets/brasao-jdf.png" alt="" width={400} height={425} unoptimized /><div><strong>Faça parte da nossa história</strong><span>Educação que transforma, conecta e inspira.</span></div></div></div>
        <div className="footer-accent" />
        <div className="shell footer-main">
          <div className="footer-brand"><Brand compact /><p>Educação pública, comunidade presente e caminhos para o futuro.</p></div>
          <div><strong>Portal</strong><Link href="/escola">A escola</Link><Link href="/noticias">Notícias</Link><Link href="/esportes-eventos">Esportes & Eventos</Link><Link href="/avisos">Avisos</Link><Link href="/biblioteca">Biblioteca</Link><Link href="/equipe">Equipe</Link></div>
          <div><strong>Serviços</strong><Link href="/contato">Contato</Link><Link href="/contato">Como chegar</Link><Link href="/gestao">Área de gestão</Link><button onClick={openGlobalAccessibility}>Acessibilidade</button></div>
          <div><strong>Endereço</strong><p>Rua Antonio Lombardo, 140<br />Jd. Santa Terezinha<br />São Paulo — SP</p></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 E.E. Jorge Duprat Figueiredo</span><span>Portal escolar em desenvolvimento educacional</span></div>
      </footer>

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
