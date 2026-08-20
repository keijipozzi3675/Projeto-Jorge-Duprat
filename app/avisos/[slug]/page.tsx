import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../../institutional-page";
import { getNoticeBySlug, schoolNotices } from "../../notice-data";
import { getPublishedPostBySlug, publicPostDate } from "../../public-posts";

type NoticePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return schoolNotices.map((notice) => ({ slug: notice.slug }));
}

export async function generateMetadata({ params }: NoticePageProps): Promise<Metadata> {
  const { slug } = await params;
  const notice = await resolveNotice(slug);
  return { title: notice ? `${notice.title} | Avisos Duprat` : "Aviso | Portal Duprat", description: notice?.text };
}

export default async function NoticeDetailPage({ params }: NoticePageProps) {
  const { slug } = await params;
  const notice = await resolveNotice(slug);
  if (!notice) return <InstitutionalPage compact active="avisos" eyebrow="Agenda escolar" title="Aviso não encontrado" intro="Este comunicado não está disponível."><section className="compact-detail-section"><div className="shell"><Link className="button button-primary" href="/avisos">Voltar aos avisos</Link></div></section></InstitutionalPage>;

  return (
    <InstitutionalPage compact active="avisos" eyebrow="Comunicado escolar" title={notice.title} intro={notice.text}>
      <section className="compact-detail-section">
        <div className="shell compact-detail-narrow">
          <article className="compact-detail-card notice-detail-card">
            <div className="notice-detail-date"><strong>{notice.day}</strong><span>{notice.month}</span></div>
            <div><span className="detail-kicker">{notice.tag}</span><h2>Informações do aviso</h2><p>{notice.details}</p><div className="notice-detail-facts"><span><small>DATA</small><strong>{notice.fullDate}</strong></span><span><small>HORÁRIO E LOCAL</small><strong>{notice.time}</strong></span></div><p className="notice-guidance">Datas e horários podem ser atualizados pela escola. Em caso de dúvida, confirme pelos canais oficiais.</p><div className="detail-actions"><Link className="button button-primary" href="/contato">Canais da escola</Link><Link className="button button-secondary" href="/avisos">← Voltar aos avisos</Link></div></div>
          </article>
        </div>
      </section>
    </InstitutionalPage>
  );
}

async function resolveNotice(slug: string) {
  const managed = await getPublishedPostBySlug(slug);
  if (managed) {
    const date = publicPostDate(managed);
    return {
      slug: managed.slug,
      day: date.day,
      month: date.month,
      fullDate: date.fullDate,
      tag: managed.category,
      title: managed.title,
      text: managed.summary,
      details: managed.content,
      time: [managed.eventTime, managed.location].filter(Boolean).join(" • ") || "Consulte os canais oficiais",
    };
  }
  return getNoticeBySlug(slug);
}
