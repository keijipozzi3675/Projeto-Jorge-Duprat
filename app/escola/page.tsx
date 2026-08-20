import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";

export const metadata: Metadata = {
  title: "A Escola | Portal Duprat",
  description: "História, estrutura e projeto educacional da E.E. Jorge Duprat Figueiredo.",
};

const structure = [
  ["16", "salas de aula"],
  ["2", "laboratórios"],
  ["1", "quadra coberta"],
  ["1", "sala de atividades"],
  ["1", "refeitório"],
  ["3", "períodos"],
];

export default function EscolaPage() {
  return (
    <InstitutionalPage active="escola" eyebrow="Identidade e trajetória" title="A nossa escola" intro="Conheça a história, os espaços e os princípios que fazem da E.E. Jorge Duprat Figueiredo uma referência para a comunidade do Jardim Santa Terezinha." image="/assets/estrutura-escola.jpg" imageAlt="Área interna da E.E. Jorge Duprat Figueiredo">
      <section className="institutional-section">
        <div className="shell institutional-two-columns">
          <article className="institutional-copy-card">
            <span className="section-label">HISTÓRIA</span>
            <h2>Um nome que representa trabalho, conhecimento e responsabilidade.</h2>
            <p>A escola está localizada na Zona Leste de São Paulo e homenageia Jorge Duprat Figueiredo (1918–1978), engenheiro civil formado pela Escola Politécnica da USP e primeiro presidente da Fundacentro.</p>
            <p>A denominação foi oficializada pelo Decreto nº 15.580, de 25 de agosto de 1980. Antes disso, a unidade era conhecida como Escola Estadual de 1º Grau do Jardim Santa Terezinha.</p>
            <blockquote>“Jorge Duprat Figueiredo” passou a identificar oficialmente a escola e fortaleceu sua ligação com a história da educação e do trabalho no Brasil.</blockquote>
          </article>
          <aside className="institutional-identity-card">
            <Image src="/assets/brasao-watermark.png" alt="Brasão da escola em versão azul" width={500} height={531} unoptimized />
            <span>DESDE 1980</span>
            <h3>E.E. Jorge Duprat Figueiredo</h3>
            <p>Jardim Santa Terezinha • São Paulo</p>
          </aside>
        </div>
      </section>

      <section className="institutional-section alt-section">
        <div className="shell">
          <div className="institutional-section-heading"><span className="section-label">ESTRUTURA</span><h2>Espaços para aprender, criar e conviver</h2><p>A unidade reúne ambientes pedagógicos, esportivos, administrativos e de acolhimento.</p></div>
          <div className="profile-stat-grid">{structure.map(([number, label]) => <article key={label}><strong>{number}</strong><span>{label}</span></article>)}</div>
          <div className="institutional-feature-grid">
            <article><span>⌘</span><h3>Tecnologia e ciência</h3><p>Laboratórios de informática e ciências apoiam atividades práticas e projetos interdisciplinares.</p></article>
            <article><span>◉</span><h3>Esporte e convivência</h3><p>A quadra coberta recebe práticas esportivas, eventos e ações de integração da comunidade.</p></article>
            <article><span>✦</span><h3>Protagonismo estudantil</h3><p>Grêmio, feiras, passeios e projetos ampliam a participação dos estudantes na vida escolar.</p></article>
          </div>
        </div>
      </section>

      <section className="institutional-cta"><div className="shell"><div><span className="section-label section-label-light">TRABALHO COLETIVO</span><h2>Conheça quem faz a escola acontecer.</h2></div><Link className="button button-gold" href="/equipe">Ver equipe escolar →</Link></div></section>
    </InstitutionalPage>
  );
}
