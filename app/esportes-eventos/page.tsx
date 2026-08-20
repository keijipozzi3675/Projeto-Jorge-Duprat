import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";
import { getPublishedPosts, publicPostDate } from "../public-posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Esportes e Eventos | Portal Duprat",
  description: "Interescolar, campeonatos, modalidades e conquistas esportivas da E.E. Jorge Duprat Figueiredo.",
};

const modalities = [
  { icon: "V", title: "Vôlei", text: "Participação em categorias femininas e masculinas, com registros que atravessam diferentes faixas etárias." },
  { icon: "H", title: "Handebol", text: "Vivências de estratégia, agilidade, cooperação e responsabilidade coletiva dentro da quadra." },
  { icon: "X", title: "Xadrez", text: "Concentração, tomada de decisões e raciocínio estratégico em competições escolares." },
  { icon: "B", title: "Basquete", text: "Prática esportiva que fortalece convivência, leitura de jogo e trabalho em equipe." },
];

const events = [
  {
    label: "Competição escolar",
    title: "Jogos Interescolares",
    text: "Encontros entre escolas que promovem participação, respeito, cooperação e novas experiências para os estudantes.",
    image: "/assets/noticias/time-feminino-medalhas.jpg",
    alt: "Equipe feminina do Duprat reunida com medalhas na quadra",
  },
  {
    label: "Evento da comunidade",
    title: "Torneio de Primavera Duprat",
    text: "Uma atividade que reúne equipes, estudantes e comunidade escolar em torno do esporte e da convivência.",
    image: "/assets/noticias/conquistas-2023-primavera-e-2024-handebol.jpeg",
    alt: "Registro do Torneio de Primavera Duprat no mural de conquistas",
  },
  {
    label: "Preparação",
    title: "Treinos, seletivas e organização",
    text: "As informações de participação, categorias e horários são divulgadas pelos canais oficiais e pela equipe responsável.",
    image: "/assets/noticias/volei-duprat.jpg",
    alt: "Equipe da escola reunida na quadra esportiva",
  },
];

const recentAchievements = [
  { year: "2026", category: "Vôlei feminino • Sub-17", title: "Tricampeão da URE Leste 4", image: "/assets/noticias/tricampeao-volei-feminino-sub17-2026.jpeg", alt: "Equipe de vôlei feminino sub-17 tricampeã da URE Leste 4 em 2026" },
  { year: "2026", category: "Vôlei feminino • Sub-14", title: "Vice-campeão da URE Leste 4", image: "/assets/noticias/vice-volei-feminino-sub14-2026.jpeg", alt: "Equipe de vôlei feminino sub-14 vice-campeã da URE Leste 4 em 2026" },
  { year: "2025", category: "Vôlei feminino • Sub-12", title: "Campeão da DE Leste 4", image: "/assets/noticias/campeao-volei-feminino-sub12-2025.jpeg", alt: "Equipe de vôlei feminino sub-12 campeã da DE Leste 4 em 2025" },
  { year: "2025", category: "Vôlei feminino • Sub-17", title: "Bicampeão da DE Leste 4", image: "/assets/noticias/bicampeao-volei-feminino-sub17-2025.jpeg", alt: "Equipe de vôlei feminino sub-17 bicampeã da DE Leste 4 em 2025" },
  { year: "2024", category: "Handebol feminino • Sub-12", title: "Campeão da DE Leste 4", image: "/assets/noticias/campeao-handebol-feminino-sub12-2024.jpeg", alt: "Equipe de handebol feminino sub-12 campeã da DE Leste 4 em 2024" },
  { year: "2024", category: "Xadrez feminino • Sub-17", title: "Vice-campeão da DE Leste 4", image: "/assets/noticias/vice-xadrez-feminino-sub17-2024-a.jpeg", alt: "Equipe de xadrez feminino sub-17 vice-campeã da DE Leste 4 em 2024" },
];

export default async function EsportesEventosPage() {
  const managedEvents = await getPublishedPosts(["event"]);
  return (
    <InstitutionalPage
      active="esportes-eventos"
      eyebrow="Interescolar e comunidade"
      title="Esportes & Eventos"
      intro="Um espaço para acompanhar campeonatos, encontros interescolares, modalidades e conquistas que fazem parte da história do Duprat."
      image="/assets/noticias/tricampeao-volei-feminino-sub17-2026.jpeg"
      imageAlt="Equipe de vôlei feminino sub-17 do Duprat com medalhas"
    >
      <section className="institutional-section sports-intro-section">
        <div className="shell sports-intro-grid">
          <article className="sports-intro-copy">
            <span className="section-label">ESPORTE ESCOLAR</span>
            <h2>Interescolar: aprender, representar e conviver</h2>
            <p>Os campeonatos interescolares criam oportunidades para representar a escola, conhecer outras equipes e desenvolver atitudes importantes, como respeito, responsabilidade e cooperação.</p>
            <p>Mais do que resultados, cada participação reúne preparação, compromisso dos estudantes e apoio da comunidade escolar.</p>
            <div className="sports-values" aria-label="Valores do esporte escolar"><span>Respeito</span><span>Cooperação</span><span>Disciplina</span><span>Protagonismo</span></div>
          </article>
          <div className="sports-intro-photo"><Image src="/assets/noticias/mural-campeoes-duprat.jpg" alt="Mural Campeões do Duprat com registros de equipes e conquistas" fill unoptimized sizes="(max-width: 760px) 100vw, 44vw" /></div>
        </div>
      </section>

      <section className="institutional-section alt-section">
        <div className="shell">
          <div className="institutional-section-heading"><span className="section-label">MODALIDADES</span><h2>Esporte em diferentes formas</h2><p>As modalidades registradas no mural de conquistas mostram a diversidade da participação estudantil.</p></div>
          <div className="sports-modality-grid">
            {modalities.map((item) => <article key={item.title}><span>{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="institutional-section sports-events-section">
        <div className="shell">
          <div className="institutional-section-heading"><span className="section-label">CAMPEONATOS E ENCONTROS</span><h2>Eventos que movimentam o Duprat</h2><p>Informações sobre participação, categorias e horários devem sempre ser confirmadas nos avisos oficiais.</p></div>
          {managedEvents.length > 0 && <div className="managed-event-agenda"><div className="managed-event-heading"><strong>Agenda publicada pela escola</strong><span>Atualizada pela equipe autorizada na Área de gestão.</span></div><div className="notice-page-grid">{managedEvents.map((event) => { const date = publicPostDate(event); return <Link className="notice-page-card" href={`/avisos/${event.slug}`} key={event.id}><div className="notice-page-date"><strong>{date.day}</strong><span>{date.month}</span></div><div><span className="notice-page-category">{event.category}</span><h2>{event.title}</h2><p>{event.summary}</p><strong className="notice-page-detail">◷ {[event.eventTime, event.location].filter(Boolean).join(" • ") || "Ver detalhes"}</strong></div><span className="notice-page-open" aria-hidden="true">→</span></Link>; })}</div></div>}
          <div className="sports-event-grid">
            {events.map((event) => (
              <article className="sports-event-card" key={event.title}>
                <div className="sports-event-image"><Image src={event.image} alt={event.alt} fill unoptimized sizes="(max-width: 760px) 100vw, 33vw" /></div>
                <div><span>{event.label}</span><h3>{event.title}</h3><p>{event.text}</p></div>
              </article>
            ))}
          </div>
          <div className="editorial-note sports-schedule-note"><span>i</span><div><strong>Agenda oficial</strong><p>Datas de jogos, seletivas e reuniões podem mudar. Consulte os Avisos ou confirme com a escola.</p></div><Link href="/avisos">Ver avisos →</Link></div>
        </div>
      </section>

      <section className="institutional-section achievements-section sports-achievements-section">
        <div className="shell">
          <div className="institutional-section-heading achievements-heading"><span className="section-label">DESTAQUES RECENTES</span><h2>Conquistas do Duprat</h2><p>Alguns registros da trajetória esportiva recente da escola.</p></div>
          <div className="sports-achievement-grid">
            {recentAchievements.map((item) => (
              <article className="achievement-card" key={item.image}>
                <a href={item.image} target="_blank" rel="noreferrer" aria-label={`Abrir foto: ${item.title}`}>
                  <div className="achievement-photo"><Image src={item.image} alt={item.alt} fill unoptimized sizes="(max-width: 760px) 86vw, 360px" /></div>
                  <div className="achievement-card-copy"><span>{item.year} • {item.category}</span><h4>{item.title}</h4><small>Abrir foto em tamanho maior ↗</small></div>
                </a>
              </article>
            ))}
          </div>
          <div className="sports-history-link"><Link className="button button-gold" href="/noticias">Ver a galeria histórica completa →</Link></div>
        </div>
      </section>

      <section className="institutional-cta"><div className="shell"><div><span className="section-label section-label-light">PARTICIPAÇÃO ESTUDANTIL</span><h2>Quer saber sobre o próximo evento?</h2></div><Link className="button button-gold" href="/contato">Falar com a escola →</Link></div></section>
    </InstitutionalPage>
  );
}
