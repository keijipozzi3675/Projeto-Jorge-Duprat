import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";
import { teamMembers } from "../team-data";

export const metadata: Metadata = {
  title: "Equipe | Portal Duprat",
  description: "Áreas e profissionais que fazem a E.E. Jorge Duprat Figueiredo.",
};

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
    <InstitutionalPage active="equipe" eyebrow="Quem faz a escola" title="Nossa equipe escolar" intro="Educação é um trabalho coletivo. Conheça as áreas responsáveis por acolher, orientar e construir a rotina da E.E. Jorge Duprat Figueiredo.">
      <section className="shell team-content institutional-team-content">
        <div className="team-intro">
          <div><h2>Uma equipe, muitos caminhos para apoiar</h2><p>Direção, coordenação, professores, secretaria e equipe de apoio trabalham de forma integrada para atender a comunidade escolar.</p></div>
          <a className="button button-primary" href="mailto:e043928a@educacao.sp.gov.br">Falar com a escola</a>
        </div>
        <div className="team-section-heading"><span className="section-label">GESTÃO ESCOLAR</span><h2>Conheça os profissionais</h2><p>Selecione uma pessoa para conhecer sua função e sua área de atuação.</p></div>
        <div className="team-member-grid">
          {teamMembers.map((member) => (
            <Link className="team-member-card" href={`/equipe/${member.slug}`} key={member.slug}>
              <span className="team-avatar">{member.code}</span>
              <span className="team-member-copy"><small>{member.area}</small><strong>{member.name}</strong><span>{member.role}</span></span>
              <span className="team-member-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="team-section-heading team-areas-heading"><span className="section-label">TRABALHO COLETIVO</span><h2>Áreas da equipe</h2></div>
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
    </InstitutionalPage>
  );
}
