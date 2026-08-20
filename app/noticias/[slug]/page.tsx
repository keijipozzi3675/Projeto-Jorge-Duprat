import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../../institutional-page";
import { getPublishedPostBySlug, publicPostDate } from "../../public-posts";

type NewsDetailProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post || post.type !== "news") return { title: "Notícia | Portal Duprat" };
  return { title: `${post.title} | Notícias Duprat`, description: post.summary };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post || post.type !== "news") {
    return <InstitutionalPage compact active="noticias" eyebrow="Acontece no Duprat" title="Notícia não encontrada" intro="Este conteúdo não está disponível."><section className="compact-detail-section"><div className="shell"><Link className="button button-primary" href="/noticias">Voltar às notícias</Link></div></section></InstitutionalPage>;
  }

  const date = publicPostDate(post);
  return (
    <InstitutionalPage compact active="noticias" eyebrow={post.category} title={post.title} intro={post.summary}>
      <section className="compact-detail-section">
        <div className="shell compact-detail-narrow">
          <article className="compact-detail-card managed-news-detail">
            <span className="detail-kicker">PUBLICADO EM {date.fullDate}</span>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            {(post.eventDate || post.eventTime || post.location) && <div className="notice-detail-facts"><span><small>DATA</small><strong>{date.fullDate}</strong></span><span><small>HORÁRIO E LOCAL</small><strong>{[post.eventTime, post.location].filter(Boolean).join(" • ") || "Consulte a escola"}</strong></span></div>}
            <div className="detail-actions"><Link className="button button-primary" href="/noticias">← Voltar às notícias</Link><Link className="button button-secondary" href="/contato">Canais da escola</Link></div>
          </article>
        </div>
      </section>
    </InstitutionalPage>
  );
}
