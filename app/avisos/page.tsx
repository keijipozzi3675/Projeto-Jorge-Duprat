import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";
import { schoolNotices } from "../notice-data";
import { getPublishedPosts, publicPostDate } from "../public-posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avisos | Portal Duprat",
  description: "Agenda, comunicados e oportunidades da E.E. Jorge Duprat Figueiredo.",
};

export default async function AvisosPage() {
  const managedPosts = await getPublishedPosts(["notice", "event"]);
  const managedNotices = managedPosts.map((post) => {
    const date = publicPostDate(post);
    return {
      slug: post.slug,
      day: date.day,
      month: date.month,
      tag: post.category,
      title: post.title,
      text: post.summary,
      time: [post.eventTime, post.location].filter(Boolean).join(" • ") || "Consulte o comunicado",
    };
  });
  const managedSlugs = new Set(managedNotices.map((notice) => notice.slug));
  const notices = [...managedNotices, ...schoolNotices.filter((notice) => !managedSlugs.has(notice.slug))];
  return (
    <InstitutionalPage active="avisos" eyebrow="Agenda escolar" title="Avisos e comunicados" intro="Uma página dedicada a eventos, oportunidades, reuniões e informações importantes para estudantes, famílias e educadores.">
      <section className="institutional-section">
        <div className="shell">
          <div className="notice-page-grid">
            {notices.map((notice) => <Link className="notice-page-card" href={`/avisos/${notice.slug}`} key={notice.slug}><div className="notice-page-date"><strong>{notice.day}</strong><span>{notice.month}</span></div><div><span className="notice-page-category">{notice.tag}</span><h2>{notice.title}</h2><p>{notice.text}</p><strong className="notice-page-detail">◷ {notice.time}</strong></div><span className="notice-page-open" aria-hidden="true">→</span></Link>)}
          </div>
          <div className="editorial-note"><span>i</span><div><strong>Informação importante</strong><p>Datas e horários podem ser atualizados pela escola. Em caso de dúvida, confirme o comunicado pelos canais oficiais da secretaria.</p></div><Link href="/contato">Ver contato →</Link></div>
        </div>
      </section>
      <section className="institutional-section alt-section">
        <div className="shell institutional-two-columns compact-columns">
          <article className="institutional-copy-card"><span className="section-label">COMO ACOMPANHAR</span><h2>Informação organizada em um só lugar</h2><p>Os avisos desta página são apresentados por data e categoria para facilitar a consulta da comunidade escolar.</p></article>
          <div className="information-list"><article><span>01</span><div><strong>Consulte a agenda</strong><p>Confira os próximos eventos e prazos.</p></div></article><article><span>02</span><div><strong>Confirme os detalhes</strong><p>Use os canais oficiais quando necessário.</p></div></article><article><span>03</span><div><strong>Participe</strong><p>A presença da comunidade fortalece a escola.</p></div></article></div>
        </div>
      </section>
    </InstitutionalPage>
  );
}
