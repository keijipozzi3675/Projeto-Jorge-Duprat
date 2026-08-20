import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/escola", label: "A escola", key: "escola" },
  { href: "/cursos", label: "Cursos", key: "cursos" },
  { href: "/noticias", label: "Notícias", key: "noticias" },
  { href: "/esportes-eventos", label: "Esportes & Eventos", key: "esportes-eventos" },
  { href: "/avisos", label: "Avisos", key: "avisos" },
  { href: "/biblioteca", label: "Biblioteca", key: "biblioteca" },
  { href: "/equipe", label: "Equipe", key: "equipe" },
  { href: "/contato", label: "Contato", key: "contato" },
];

function SchoolBrand() {
  return (
    <Link href="/" className="brand" aria-label="Página inicial do Portal Duprat">
      <span className="brand-mark" aria-hidden="true"><Image src="/assets/brasao-jdf.png" alt="" width={400} height={425} priority unoptimized /></span>
      <span className="brand-copy"><strong>E.E. Jorge Duprat</strong><small>Figueiredo</small></span>
    </Link>
  );
}

export default function InstitutionalPage({
  active,
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  compact = false,
  children,
}: {
  active: string;
  eyebrow: string;
  title: string;
  intro: string;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`institutional-page ${compact ? "compact-detail-page" : ""}`}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="service-strip">
        <div className="shell service-strip-inner"><span><span className="status-dot" /> Escola aberta de segunda a sexta</span><span className="strip-links"><a href="tel:+551127210278">(11) 2721-0278</a><Link href="/contato">Canais oficiais</Link></span></div>
      </div>
      <header className="site-header institutional-header">
        <div className="shell header-inner">
          <SchoolBrand />
          <nav className="main-nav institutional-nav" aria-label="Navegação principal">
            {navigation.map((item) => <Link className={active === item.key ? "active" : ""} href={item.href} key={item.key}>{item.label}</Link>)}
            <Link href="/gestao" className="nav-login">Área de gestão <span aria-hidden="true">↗</span></Link>
          </nav>
          <details className="institutional-menu">
            <summary aria-label="Abrir menu">Menu</summary>
            <nav aria-label="Navegação para celular">
              {navigation.map((item) => <Link className={active === item.key ? "active" : ""} href={item.href} key={item.key}>{item.label}</Link>)}
              <Link href="/gestao">Área de gestão</Link>
            </nav>
          </details>
        </div>
      </header>

      <main id="conteudo">
        <section className={`institutional-hero ${image ? "has-image" : ""}`}>
          <div className="institutional-hero-grid" aria-hidden="true" />
          <div className="shell institutional-hero-inner">
            <div>
              <span className="eyebrow"><span /> {eyebrow}</span>
              <h1>{title}</h1>
              <p>{intro}</p>
              <div className="institutional-breadcrumb"><Link href="/">Início</Link><span>›</span><strong>{title}</strong></div>
            </div>
            {image && <div className="institutional-hero-image"><Image src={image} alt={imageAlt ?? ""} fill priority unoptimized sizes="(max-width: 760px) 100vw, 44vw" /></div>}
          </div>
        </section>
        {children}
      </main>

      <footer className="institutional-footer">
        <div className="shell institutional-footer-grid">
          <div><SchoolBrand /><p>Educação pública, comunidade presente e caminhos para o futuro.</p></div>
          <div><strong>Navegação</strong><Link href="/escola">A escola</Link><Link href="/cursos">Cursos</Link><Link href="/noticias">Notícias</Link><Link href="/esportes-eventos">Esportes & Eventos</Link><Link href="/avisos">Avisos</Link><Link href="/biblioteca">Biblioteca</Link></div>
          <div><strong>Atendimento</strong><a href="tel:+551127210278">(11) 2721-0278</a><Link href="/contato">Contato e localização</Link><Link href="/gestao">Área de gestão</Link></div>
          <div><strong>Endereço</strong><p>Rua Antonio Lombardo, 140<br />Jardim Santa Terezinha<br />São Paulo — SP</p></div>
        </div>
        <div className="shell institutional-footer-bottom"><span>© 2026 E.E. Jorge Duprat Figueiredo</span><Link href="/">Voltar ao início</Link></div>
      </footer>
    </div>
  );
}
