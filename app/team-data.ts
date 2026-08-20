export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  area: string;
  code: string;
  introduction: string;
  responsibilities: string[];
};

export const teamMembers: TeamMember[] = [
  {
    slug: "silas", name: "Silas", role: "Diretor", area: "Direção escolar", code: "SI",
    introduction: "Na direção escolar, Silas acompanha a organização da unidade e articula o trabalho das diferentes equipes para apoiar a aprendizagem e o atendimento à comunidade.",
    responsibilities: ["Coordenação da rotina escolar", "Acompanhamento do projeto pedagógico", "Diálogo com estudantes, famílias e profissionais"],
  },
  {
    slug: "joelma", name: "Joelma", role: "Vice-diretora", area: "Vice-direção", code: "JO",
    introduction: "Na vice-direção, Joelma acompanha o cotidiano escolar e colabora com ações de acolhimento, organização e convivência em parceria com toda a equipe.",
    responsibilities: ["Acompanhamento da rotina dos estudantes", "Apoio à direção e às equipes", "Atendimento e orientação à comunidade escolar"],
  },
  {
    slug: "marcus", name: "Marcus", role: "Coordenador", area: "Coordenação pedagógica", code: "MA",
    introduction: "Na coordenação pedagógica, Marcus apoia o planejamento educacional, o trabalho docente e o acompanhamento das aprendizagens dos estudantes.",
    responsibilities: ["Articulação do planejamento pedagógico", "Apoio às práticas de ensino", "Acompanhamento das aprendizagens"],
  },
];

export function getTeamMemberBySlug(slug: string) {
  return teamMembers.find((member) => member.slug === slug);
}
