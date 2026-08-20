import type { Metadata } from "next";
import Link from "next/link";
import InstitutionalPage from "../../institutional-page";
import { getTeamMemberBySlug, teamMembers } from "../../team-data";

type TeamPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return teamMembers.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  return { title: member ? `${member.name} — ${member.role} | Portal Duprat` : "Equipe | Portal Duprat", description: member?.introduction };
}

export default async function TeamMemberPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const member = getTeamMemberBySlug(slug);
  if (!member) return <InstitutionalPage compact active="equipe" eyebrow="Equipe escolar" title="Profissional não encontrado" intro="Este perfil não está disponível."><section className="compact-detail-section"><div className="shell"><Link className="button button-primary" href="/equipe">Voltar à equipe</Link></div></section></InstitutionalPage>;

  return (
    <InstitutionalPage compact active="equipe" eyebrow="Equipe escolar" title={member.name} intro={`${member.role} • ${member.area}`}>
      <section className="compact-detail-section">
        <div className="shell compact-detail-narrow">
          <article className="compact-detail-card member-detail-card">
            <span className="member-detail-avatar">{member.code}</span>
            <div><span className="detail-kicker">{member.area}</span><h2>Sobre a atuação de {member.name}</h2><p>{member.introduction}</p><h3>Principais responsabilidades</h3><ul>{member.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}</ul><div className="detail-actions"><Link className="button button-primary" href="/contato">Falar com a escola</Link><Link className="button button-secondary" href="/equipe">← Voltar à equipe</Link></div></div>
          </article>
        </div>
      </section>
    </InstitutionalPage>
  );
}
