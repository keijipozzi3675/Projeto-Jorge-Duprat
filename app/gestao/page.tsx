import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import ManagementDashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function GestaoPage() {
  const user = await requireChatGPTUser("/gestao");
  return <ManagementDashboard name={user.displayName} email={user.email} signOutPath={chatGPTSignOutPath("/")} />;
}
