import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../../../institutional-page";
import { books, getBookBySlug, getBookRecommendations } from "../../../library-data";

type BookPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return { title: "Livro não encontrado | Portal Duprat" };
  return {
    title: `${book.title} | Biblioteca Duprat`,
    description: `Conheça ${book.title}, de ${book.author}, e veja leituras relacionadas.`,
    openGraph: { title: `${book.title} | Biblioteca Duprat`, description: book.summary, images: [] },
    twitter: { title: `${book.title} | Biblioteca Duprat`, description: book.summary, images: [] },
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return <InstitutionalPage compact active="biblioteca" eyebrow="Sala de leitura" title="Livro não encontrado" intro="Este título não está disponível no catálogo."><section className="compact-detail-section"><div className="shell"><Link className="button button-primary" href="/biblioteca">Voltar à biblioteca</Link></div></section></InstitutionalPage>;
  }

  const recommendations = getBookRecommendations(book);

  return (
    <InstitutionalPage compact active="biblioteca" eyebrow="Detalhes do livro" title={book.title} intro={`Conheça esta obra de ${book.author} e encontre outras leituras relacionadas.`}>
      <section className="compact-detail-section book-detail-page">
        <div className="shell">
          <article className="compact-detail-card book-detail-card">
            <div className={`book-cover book-detail-cover cover-${book.color}`}><span className="cover-code">{book.code}</span><small>Biblioteca<br />Duprat</small><i /></div>
            <div className="book-detail-copy">
              <span className="detail-kicker">{book.category}</span>
              <h2>{book.title}</h2>
              <p className="detail-byline">{book.author}</p>
              <div className="detail-meta"><span>{book.genre}</span><span>Publicado em {book.publicationYear}</span><span className={book.available > 0 ? "available" : "waiting"}>{book.available > 0 ? `${book.available} ${book.available > 1 ? "exemplares disponíveis" : "exemplar disponível"}` : "Fila de espera"}</span></div>
              <h3>Sobre o livro</h3>
              <p>{book.summary}</p>
              <div className="detail-themes" aria-label="Temas do livro">{book.themes.map((theme) => <span key={theme}>{theme}</span>)}</div>
              <div className="detail-actions"><Link className="button button-primary" href="/biblioteca">Reservar no catálogo</Link><Link className="button button-secondary" href="/biblioteca">← Voltar</Link></div>
            </div>
          </article>

          <section className="recommendations-section" aria-labelledby="recommendations-title">
            <div className="compact-section-heading"><span className="section-label">LEITURAS RELACIONADAS</span><h2 id="recommendations-title">Recomendações</h2><p>Selecionadas por gênero, categoria e temas em comum com este livro.</p></div>
            <div className="recommendation-grid">
              {recommendations.map((recommended) => (
                <Link className="recommendation-card" href={`/biblioteca/livro/${recommended.slug}`} key={recommended.id}>
                  <span className={`book-cover cover-${recommended.color}`}><span className="cover-code">{recommended.code}</span><small>Biblioteca<br />Duprat</small><i /></span>
                  <span className="recommendation-copy"><small>{recommended.genre}</small><strong>{recommended.title}</strong><span>{recommended.author}</span><em>Conhecer livro →</em></span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </InstitutionalPage>
  );
}
