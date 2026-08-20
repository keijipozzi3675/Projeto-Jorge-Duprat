import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";

export const metadata: Metadata = {
  title: "Cursos | Portal Duprat",
  description: "Modalidades de ensino oferecidas pela E.E. Jorge Duprat Figueiredo.",
};

const courses = [
  { icon: "6º", title: "Ensino Fundamental II", period: "Manhã e tarde", audience: "6º ao 9º ano", text: "O Ensino Fundamental II corresponde aos 6º, 7º, 8º e 9º anos. Nessa etapa, os estudantes aprofundam os conhecimentos adquiridos nos anos iniciais e desenvolvem maior autonomia nos estudos.", topics: ["Linguagens e comunicação", "Matemática e ciências", "Projetos e convivência"] },
  { icon: "EM", title: "Ensino Médio", period: "Manhã e tarde", audience: "1º ao 3º ano", text: "O Ensino Médio é a etapa final da Educação Básica e busca preparar os estudantes tanto para a continuidade dos estudos quanto para o mundo do trabalho e para a vida em sociedade.", topics: ["Formação geral básica", "Projetos interdisciplinares", "Orientação para o futuro"] },
  { icon: "</>", title: "Técnico em Desenvolvimento de Sistemas", period: "Integrado ao Ensino Médio", audience: "Formação técnica", text: "Implementado em 2024, aproxima os estudantes de programação, tecnologia e desenvolvimento de soluções digitais.", topics: ["Lógica e programação", "Desenvolvimento web", "Projetos autorais"] },
  { icon: "EJA", title: "Educação de Jovens e Adultos", period: "Noturno", audience: "Conclusão do Ensino Médio", text: "Oferece uma oportunidade de retomada dos estudos com organização adequada à trajetória de jovens e adultos.", topics: ["Formação reconhecida", "Aulas no período noturno", "Acolhimento de trajetórias"] },
];

export default function CursosPage() {
  return (
    <InstitutionalPage active="cursos" eyebrow="Formação para cada etapa" title="Cursos e modalidades" intro="Conheça as opções de formação oferecidas pela escola, da continuidade da Educação Básica à qualificação técnica e à retomada dos estudos." image="/assets/frente-escola.jpg" imageAlt="Fachada da E.E. Jorge Duprat Figueiredo">
      <section className="institutional-section">
        <div className="shell course-page-grid">
          {courses.map((course, index) => (
            <article className={`course-page-card ${index === 2 ? "featured" : ""}`} key={course.title}>
              <div className="course-page-icon">{course.icon}</div>
              <div><span className="course-page-period">{course.period}</span><h2>{course.title}</h2><strong>{course.audience}</strong><p>{course.text}</p><ul>{course.topics.map((topic) => <li key={topic}>{topic}</li>)}</ul></div>
            </article>
          ))}
        </div>
      </section>
      <section className="institutional-cta"><div className="shell"><div><span className="section-label section-label-light">DÚVIDAS SOBRE MATRÍCULA</span><h2>Fale com a secretaria escolar.</h2></div><Link className="button button-gold" href="/contato">Ver canais de atendimento →</Link></div></section>
    </InstitutionalPage>
  );
}
