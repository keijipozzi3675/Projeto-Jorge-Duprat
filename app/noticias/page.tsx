import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";
import { getPublishedPosts, publicPostDate } from "../public-posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notícias | Portal Duprat",
  description: "Conquistas, projetos e acontecimentos da E.E. Jorge Duprat Figueiredo.",
};

const highlights = [
  {
    category: "Esporte escolar",
    title: "Vôlei em destaque",
    text: "O trabalho em equipe, a disciplina e a participação dos estudantes fortalecem a presença do Duprat nas atividades esportivas.",
    image: "/assets/noticias/volei-duprat.jpg",
    alt: "Equipe de vôlei da escola reunida na quadra",
  },
  {
    category: "Aprendizagem",
    title: "Ciência perto da prática",
    text: "O laboratório amplia as possibilidades das aulas e aproxima os conteúdos de experiências, observações e descobertas.",
    image: "/assets/noticias/laboratorio-ciencias.jpg",
    alt: "Laboratório de Ciências da escola com bancadas e materiais didáticos",
  },
  {
    category: "Tecnologia",
    title: "Recursos digitais para aprender",
    text: "A sala de informática apoia pesquisas, projetos autorais e o desenvolvimento de novas habilidades pelos estudantes.",
    image: "/assets/noticias/sala-informatica.jpg",
    alt: "Sala de informática da escola com computadores e mesas de trabalho",
  },
];

const achievementYears = [
  {
    year: "2026",
    heading: "Conquistas mais recentes",
    items: [
      {
        category: "Vôlei feminino • Sub-17",
        title: "Tricampeão da URE Leste 4",
        image: "/assets/noticias/tricampeao-volei-feminino-sub17-2026.jpeg",
        alt: "Equipe de vôlei feminino sub-17 tricampeã da URE Leste 4 em 2026",
      },
      {
        category: "Vôlei feminino • Sub-14",
        title: "Vice-campeão da URE Leste 4",
        image: "/assets/noticias/vice-volei-feminino-sub14-2026.jpeg",
        alt: "Equipe de vôlei feminino sub-14 vice-campeã da URE Leste 4 em 2026",
      },
    ],
  },
  {
    year: "2025",
    heading: "Talento, constância e evolução",
    items: [
      {
        category: "Vôlei feminino • Sub-12",
        title: "Campeão da DE Leste 4",
        image: "/assets/noticias/campeao-volei-feminino-sub12-2025.jpeg",
        alt: "Equipe de vôlei feminino sub-12 campeã da DE Leste 4 em 2025",
      },
      {
        category: "Vôlei feminino • Sub-17",
        title: "Bicampeão da DE Leste 4",
        image: "/assets/noticias/bicampeao-volei-feminino-sub17-2025.jpeg",
        alt: "Equipe de vôlei feminino sub-17 bicampeã da DE Leste 4 em 2025",
      },
      {
        category: "Handebol feminino • Sub-14",
        title: "Vice-campeão da DE Leste 4",
        image: "/assets/noticias/vice-handebol-feminino-sub14-2025.jpeg",
        alt: "Equipe de handebol feminino sub-14 vice-campeã da DE Leste 4 em 2025",
      },
    ],
  },
  {
    year: "2024",
    heading: "Um ano de grandes resultados",
    items: [
      {
        category: "Vôlei feminino • Sub-14",
        title: "Vice-campeão da DE Leste 4",
        image: "/assets/noticias/vice-volei-feminino-sub14-2024.jpeg",
        alt: "Equipe de vôlei feminino sub-14 vice-campeã da DE Leste 4 em 2024",
      },
      {
        category: "Handebol feminino • Sub-12",
        title: "Campeão da DE Leste 4",
        image: "/assets/noticias/campeao-handebol-feminino-sub12-2024.jpeg",
        alt: "Equipe de handebol feminino sub-12 campeã da DE Leste 4 em 2024",
      },
      {
        category: "Vôlei masculino • Sub-17",
        title: "3º lugar na DE Leste 4",
        image: "/assets/noticias/terceiro-volei-masculino-sub17-2024.jpeg",
        alt: "Equipe de vôlei masculino sub-17 em terceiro lugar na DE Leste 4 em 2024",
      },
      {
        category: "Vôlei feminino • Sub-17",
        title: "Campeão da DE Leste 4",
        image: "/assets/noticias/campeao-volei-feminino-sub17-2024.jpeg",
        alt: "Equipe de vôlei feminino sub-17 campeã da DE Leste 4 em 2024",
      },
      {
        category: "Basquete feminino • Sub-17",
        title: "Vice-campeão da DE Leste 4",
        image: "/assets/noticias/vice-basquete-feminino-sub17-2024.jpeg",
        alt: "Equipe de basquete feminino sub-17 vice-campeã da DE Leste 4 em 2024",
      },
      {
        category: "Xadrez masculino • Sub-17",
        title: "3º lugar na DE Leste 4",
        image: "/assets/noticias/terceiro-xadrez-masculino-sub17-2024.jpeg",
        alt: "Equipe de xadrez masculino sub-17 em terceiro lugar na DE Leste 4 em 2024",
      },
      {
        category: "Vôlei feminino • Sub-12",
        title: "Vice-campeão da DE Leste 4",
        image: "/assets/noticias/vice-volei-feminino-sub12-2024.jpeg",
        alt: "Equipe de vôlei feminino sub-12 vice-campeã da DE Leste 4 em 2024",
      },
      {
        category: "Xadrez feminino • Sub-17",
        title: "Vice-campeão da DE Leste 4",
        image: "/assets/noticias/vice-xadrez-feminino-sub17-2024-a.jpeg",
        alt: "Equipe de xadrez feminino sub-17 vice-campeã da DE Leste 4 em 2024",
      },
      {
        category: "Xadrez feminino • Sub-17",
        title: "Outro registro da equipe vice-campeã",
        image: "/assets/noticias/vice-xadrez-feminino-sub17-2024-b.jpeg",
        alt: "Outro registro da equipe de xadrez feminino sub-17 vice-campeã em 2024",
      },
    ],
  },
  {
    year: "2023",
    heading: "Participação que fez história",
    items: [
      {
        category: "Vôlei feminino",
        title: "3º lugar no 1º Torneio de Primavera Duprat",
        image: "/assets/noticias/conquistas-2023-primavera-e-2024-handebol.jpeg",
        alt: "Mural com a equipe de vôlei feminino no Torneio de Primavera Duprat de 2023",
      },
      {
        category: "Xadrez misto • Sub-17",
        title: "Campeão da Leste 4",
        image: "/assets/noticias/campeao-xadrez-sub17-2023.jpeg",
        alt: "Equipe de xadrez sub-17 campeã da Leste 4 em 2023",
      },
    ],
  },
  {
    year: "2022",
    heading: "O começo de uma trajetória vencedora",
    items: [
      {
        category: "Vôlei feminino • Sub-14",
        title: "4º lugar no Inter DE Capital",
        image: "/assets/noticias/quarto-lugar-volei-feminino-sub14-2022.jpeg",
        alt: "Equipe de vôlei feminino sub-14 em quarto lugar no Inter DE Capital de 2022",
      },
      {
        category: "Vôlei feminino • Sub-14",
        title: "Outro registro do Inter DE Capital",
        image: "/assets/noticias/quarto-lugar-volei-feminino-sub14-2022-b.jpeg",
        alt: "Outro registro da equipe de vôlei feminino sub-14 no Inter DE Capital de 2022",
      },
      {
        category: "Xadrez misto • Sub-14",
        title: "Campeão da Capital",
        image: "/assets/noticias/campeao-capital-xadrez-sub14-2022.jpeg",
        alt: "Equipe de xadrez sub-14 campeã da Capital em 2022",
      },
      {
        category: "Xadrez misto • Sub-14",
        title: "Campeão da DE Leste 4",
        image: "/assets/noticias/campeao-leste4-xadrez-sub14-2022.jpeg",
        alt: "Equipe de xadrez sub-14 campeã da DE Leste 4 em 2022",
      },
      {
        category: "Vôlei feminino • Sub-14",
        title: "Campeão da DE Leste 4",
        image: "/assets/noticias/campeao-volei-feminino-sub14-2022.jpeg",
        alt: "Equipe de vôlei feminino sub-14 campeã da DE Leste 4 em 2022",
      },
    ],
  },
];

export default async function NoticiasPage() {
  const managedNews = await getPublishedPosts(["news"]);
  return (
    <InstitutionalPage
      active="noticias"
      eyebrow="Acontece no Duprat"
      title="Notícias da escola"
      intro="Conquistas, projetos e registros que mostram a participação dos estudantes e o trabalho realizado pela comunidade escolar."
      image="/assets/noticias/mural-campeoes-duprat.jpg"
      imageAlt="Mural de conquistas esportivas da E.E. Jorge Duprat Figueiredo"
    >
      <section className="institutional-section">
        <div className="shell">
          {managedNews.length > 0 && <section className="managed-news-section" aria-labelledby="noticias-publicadas"><div className="institutional-section-heading"><span className="section-label">ATUALIZAÇÕES DA ESCOLA</span><h2 id="noticias-publicadas">Notícias publicadas pela equipe</h2><p>Conteúdos atualizados por profissionais autorizados na Área de gestão.</p></div><div className="managed-news-grid">{managedNews.map((post) => { const date = publicPostDate(post); return <Link href={`/noticias/${post.slug}`} key={post.id}><span>{post.category} • {date.fullDate}</span><h3>{post.title}</h3><p>{post.summary}</p><strong>Ler notícia →</strong></Link>; })}</div></section>}
          <article className="news-lead">
            <div className="news-lead-image">
              <Image
                src="/assets/noticias/time-feminino-medalhas.jpg"
                alt="Equipe feminina da escola reunida na quadra com suas medalhas"
                fill
                priority
                unoptimized
                sizes="(max-width: 760px) 100vw, 52vw"
              />
            </div>
            <div className="news-lead-copy">
              <span className="news-category">Esporte escolar</span>
              <h2>Dedicação que se transforma em conquista</h2>
              <p>O registro da equipe com suas medalhas celebra treino, participação e trabalho coletivo. O esporte escolar ajuda a desenvolver cooperação, responsabilidade e confiança dentro e fora da quadra.</p>
              <div className="news-tags" aria-label="Temas da notícia"><span>Trabalho em equipe</span><span>Protagonismo</span><span>Comunidade</span></div>
            </div>
          </article>

          <article className="news-announcement">
            <div className="news-announcement-image">
              <Image
                src="/assets/noticias/mutirao-pro-enem.png"
                alt="Cartaz do Mutirão Pró-Enem da URE Leste 4"
                fill
                unoptimized
                sizes="(max-width: 760px) 100vw, 36vw"
              />
            </div>
            <div className="news-announcement-copy">
              <span className="news-category">Enem • 3ª série</span>
              <h2>Mutirão Pró-Enem fortalece a preparação para o futuro</h2>
              <p>A iniciativa da URE Leste 4 reforça a importância de confirmar a inscrição no Enem e incentiva estudantes da 3ª série a não deixar essa etapa para a última hora.</p>
              <p>O exame pode abrir caminhos para universidades públicas pelo SiSU, bolsas em instituições particulares pelo ProUni, financiamento pelo Fies e outras oportunidades educacionais.</p>
              <strong>Confirme. Incentive. Transforme futuros!</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="institutional-section achievements-section">
        <div className="shell">
          <div className="institutional-section-heading achievements-heading">
            <span className="section-label">GALERIA DE CONQUISTAS</span>
            <h2>Campeões do Duprat</h2>
            <p>Uma linha do tempo com registros de dedicação, espírito de equipe e participação estudantil em diferentes modalidades.</p>
          </div>

          <div className="achievement-timeline">
            {achievementYears.map((group) => (
              <section className="achievement-year" key={group.year} aria-labelledby={`conquistas-${group.year}`}>
                <div className="achievement-year-heading">
                  <div><span>{group.year}</span><h3 id={`conquistas-${group.year}`}>{group.heading}</h3></div>
                  {group.items.length > 3 ? <small>Deslize para ver mais →</small> : null}
                </div>
                <div className="achievement-strip" tabIndex={0} aria-label={`Conquistas esportivas de ${group.year}`}>
                  {group.items.map((item) => (
                    <article className="achievement-card" key={item.image}>
                      <a href={item.image} target="_blank" rel="noreferrer" aria-label={`Abrir foto: ${item.title}`}>
                        <div className="achievement-photo">
                          <Image src={item.image} alt={item.alt} fill unoptimized sizes="(max-width: 760px) 86vw, 360px" />
                        </div>
                        <div className="achievement-card-copy">
                          <span>{item.category}</span>
                          <h4>{item.title}</h4>
                          <small>Abrir foto em tamanho maior ↗</small>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="institutional-section alt-section">
        <div className="shell">
          <div className="institutional-section-heading">
            <span className="section-label">MAIS DESTAQUES</span>
            <h2>Uma escola em movimento</h2>
            <p>Esporte, ciência e tecnologia fazem parte das experiências que conectam conhecimento, convivência e futuro.</p>
          </div>
          <div className="news-card-grid">
            {highlights.map((item) => (
              <article className="news-card" key={item.title}>
                <div className="news-card-image"><Image src={item.image} alt={item.alt} fill unoptimized sizes="(max-width: 760px) 100vw, 33vw" /></div>
                <div className="news-card-copy"><span className="news-category">{item.category}</span><h3>{item.title}</h3><p>{item.text}</p></div>
              </article>
            ))}
          </div>
          <div className="editorial-note news-editorial-note"><span>i</span><div><strong>Notícia ou aviso?</strong><p>Esta página reúne histórias e acontecimentos. Datas, reuniões e comunicados oficiais continuam organizados na página de Avisos.</p></div><Link href="/avisos">Ver avisos →</Link></div>
        </div>
      </section>

      <section className="institutional-cta"><div className="shell"><div><span className="section-label section-label-light">COMUNIDADE DUPRAT</span><h2>Acompanhe o que acontece na escola.</h2></div><Link className="button button-gold" href="/avisos">Consultar agenda e avisos →</Link></div></section>
    </InstitutionalPage>
  );
}
