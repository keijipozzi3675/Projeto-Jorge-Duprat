import Link from "next/link";

const areas = [
  { code: "DI", title: "Direção escolar", type: "Liderança", text: "Coordena o projeto pedagógico, a organização da unidade e a relação com a comunidade." },
  { code: "VD", title: "Vice-direção", type: "Gestão", text: "Acompanha a rotina escolar e apoia estudantes, famílias e servidores." },
  { code: "CP", title: "Coordenação pedagógica", type: "Pedagógico", text: "Articula práticas de ensino, formação docente e acompanhamento das aprendizagens." },
  { code: "PR", title: "Corpo docente", type: "Ensino", text: "Professores das diferentes áreas que orientam as experiências de aprendizagem." },
  { code: "SE", title: "Secretaria", type: "Atendimento", text: "Cuida da vida escolar, documentos, matrículas e atendimento administrativo." },
  { code: "AP", title: "Equipe de apoio", type: "Convivência", text: "Organiza os espaços e colabora para uma escola acolhedora e segura." },
];

export default function EquipePage() {
  return (
    <main className="subpage">
      <header className="simple-header">
        <div className="shell">
          <Link href="/" className="brand" aria-label="Voltar ao Portal Duprat">
            <span className="brand-mark"><span>JD</span></span>
            <span className="brand-copy"><strong>Portal Duprat</strong><small>Escola Estadual</small></span>
          </Link>
          <Link href="/" className="simple-back">← Voltar ao portal</Link>
        </div>
      </header>
      <section className="subpage-hero">
        <div className="shell">
          <span className="section-label">QUEM FAZ A ESCOLA</span>
          <h1>Nossa equipe escolar</h1>
          <p>Educação é um trabalho coletivo. Conheça as áreas responsáveis por acolher, orientar e construir a rotina da E.E. Jorge Duprat Figueiredo.</p>
        </div>
      </section>
      <section className="shell team-content">
        <div className="team-intro">
          <div><h2>Uma equipe, muitos caminhos para apoiar</h2><p>Os nomes e horários de atendimento poderão ser atualizados pela direção na Área de gestão, sem necessidade de alterar o código do portal.</p></div>
          <a className="button button-primary" href="mailto:e043928a@educacao.sp.gov.br">Falar com a escola</a>
        </div>
        <div className="team-grid">
          {areas.map((area) => (
            <article className="team-card" key={area.code}>
              <span className="team-avatar">{area.code}</span>
              <h3>{area.title}</h3>
              <span>{area.type}</span>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
