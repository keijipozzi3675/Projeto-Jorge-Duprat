export type SchoolNotice = {
  slug: string;
  day: string;
  month: string;
  fullDate: string;
  tag: string;
  title: string;
  text: string;
  details: string;
  time: string;
};

export const schoolNotices: SchoolNotice[] = [
  {
    slug: "reuniao-de-pais-e-responsaveis", day: "20", month: "AGO", fullDate: "20 de agosto de 2026", tag: "Comunidade", title: "Reunião de pais e responsáveis",
    text: "Encontro por turma para acompanhar o desenvolvimento dos estudantes.",
    details: "A reunião aproxima escola e famílias para compartilhar orientações, acompanhar a rotina das turmas e esclarecer dúvidas. Consulte a sala da turma na entrada da escola.",
    time: "18h30 • Escola",
  },
  {
    slug: "feira-de-ciencias-e-tecnologia", day: "27", month: "AGO", fullDate: "27 de agosto de 2026", tag: "Pedagógico", title: "Feira de Ciências e Tecnologia",
    text: "Apresentação dos projetos desenvolvidos pelos estudantes ao longo do bimestre.",
    details: "Estudantes apresentarão experiências, pesquisas e soluções construídas nas aulas. A comunidade poderá visitar os trabalhos e conhecer diferentes etapas dos projetos.",
    time: "9h às 16h • Pátio",
  },
  {
    slug: "inscricoes-gremio-estudantil", day: "02", month: "SET", fullDate: "2 de setembro de 2026", tag: "Oportunidade", title: "Inscrições para o grêmio estudantil",
    text: "Forme sua chapa, consulte o regulamento e participe das decisões da escola.",
    details: "Os estudantes interessados devem organizar a chapa, conhecer as regras do processo e entregar a inscrição à equipe responsável dentro do prazo divulgado.",
    time: "Inscrições até 6 de setembro",
  },
];

export function getNoticeBySlug(slug: string) {
  return schoolNotices.find((notice) => notice.slug === slug);
}
