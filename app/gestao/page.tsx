import Link from "next/link";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { resolveStaffContext } from "../management-auth";
import { loadManagementSnapshot } from "../management-service";
import ManagementDashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function GestaoPage() {
  await requireChatGPTUser("/gestao");
  const staff = await resolveStaffContext();
  const signOutPath = chatGPTSignOutPath("/");

  if (!staff) {
    return (
      <main className="management-access-page">
        <section className="management-access-card">
          <span className="management-lock" aria-hidden="true">◆</span>
          <small>ACESSO INSTITUCIONAL</small>
          <h1>Conta aguardando autorização</h1>
          <p>Seu login foi reconhecido, mas a escola ainda não vinculou esta conta a um cargo. Por segurança, somente a Direção ou um administrador autorizado pode liberar o acesso.</p>
          <div><Link className="button button-primary" href="/">Voltar ao portal</Link><a className="button button-outline" href={signOutPath}>Sair desta conta</a></div>
          <span>Procure a Direção e informe o e-mail usado no login. Não compartilhe senha ou conta com outras pessoas.</span>
        </section>
      </main>
    );
  }

  const snapshot = await loadManagementSnapshot(staff);
  return <ManagementDashboard initialSnapshot={snapshot} signOutPath={signOutPath} />;
}
