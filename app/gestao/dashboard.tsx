"use client";

import Link from "next/link";
import { useState } from "react";

const loans = [
  { student: "Ana Souza", className: "2º B", book: "Dom Casmurro", due: "22/08", status: "Em dia", color: "green" },
  { student: "Lucas Lima", className: "1º A", book: "O Pequeno Príncipe", due: "20/08", status: "Vence hoje", color: "amber" },
  { student: "Mariana Reis", className: "3º C", book: "Capitães da Areia", due: "17/08", status: "Atrasado", color: "red" },
  { student: "João Pedro", className: "2º A", book: "Torto Arado", due: "27/08", status: "Em dia", color: "green" },
];

const notifications = [
  { icon: "✓", title: "Reserva confirmada", text: "Ana Souza • Dom Casmurro • agora" },
  { icon: "☷", title: "Nova entrada na fila", text: "Pedro Alves • Extraordinário • 12 min" },
  { icon: "!", title: "Devolução atrasada", text: "Mariana Reis • 2 dias • 35 min" },
  { icon: "↗", title: "Aviso preparado", text: "4 lembretes de devolução • 1h" },
];

export default function ManagementDashboard({ name, email, signOutPath }: { name: string; email: string; signOutPath: string }) {
  const [active, setActive] = useState("Visão geral");
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  return (
    <main className="dashboard-root">
      <aside className="dashboard-sidebar">
        <Link href="/" className="brand brand-compact"><span className="brand-mark"><span>JD</span></span><span className="brand-copy"><strong>Portal Duprat</strong><small>Gestão escolar</small></span></Link>
        <nav className="dashboard-nav" aria-label="Menu da gestão">
          {["Visão geral", "Biblioteca", "Reservas e fila", "Estudantes", "Avisos", "Notificações", "Equipe e acessos"].map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => { setActive(item); if (item !== "Visão geral") showToast(`${item}: módulo preparado para a próxima etapa.`); }}>{item}</button>)}
        </nav>
        <div className="dashboard-user"><strong>{name}</strong><span>{email}</span><span>Perfil: Administrador</span></div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar"><div><small>E.E. JORGE DUPRAT FIGUEIREDO</small><strong>Central de gestão</strong></div><a href={signOutPath}>Sair com segurança</a></header>
        <div className="dashboard-content">
          <div className="dashboard-heading"><div><h1>Bom dia, equipe!</h1><p>Resumo operacional da escola em 19 de agosto de 2026.</p></div><button className="dashboard-action" onClick={() => showToast("Novo aviso iniciado. O editor completo entra na próxima etapa.")}>+ Criar aviso</button></div>
          <div className="metric-grid">
            <article className="metric-card"><span>Empréstimos ativos</span><strong>42</strong><small>+8 nesta semana</small></article>
            <article className="metric-card"><span>Reservas aguardando</span><strong>11</strong><small>3 livros com fila</small></article>
            <article className="metric-card"><span>Devoluções hoje</span><strong>7</strong><small>4 avisos preparados</small></article>
            <article className="metric-card"><span>Títulos disponíveis</span><strong>936</strong><small>78% do acervo</small></article>
          </div>
          <div className="dashboard-grid">
            <section className="dashboard-panel">
              <div className="panel-title"><strong>Empréstimos recentes</strong><button onClick={() => showToast("Lista completa aberta em modo demonstrativo.")}>Ver todos →</button></div>
              <table className="management-table"><thead><tr><th>ESTUDANTE</th><th>LIVRO</th><th>DEVOLUÇÃO</th><th>SITUAÇÃO</th></tr></thead><tbody>{loans.map((loan) => <tr key={`${loan.student}-${loan.book}`}><td><strong>{loan.student}</strong><span>{loan.className}</span></td><td>{loan.book}</td><td>{loan.due}</td><td><span className={`status-pill ${loan.color}`}>{loan.status}</span></td></tr>)}</tbody></table>
            </section>
            <section className="dashboard-panel">
              <div className="panel-title"><strong>Atividade do sistema</strong><button onClick={() => showToast("Central de notificações selecionada.")}>Central →</button></div>
              <div className="notification-list">{notifications.map((item) => <article className="notification-item" key={item.title}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.text}</small></div></article>)}</div>
            </section>
          </div>
          <div className="role-banner"><div><strong>Perfis separados e menos conflitos</strong><span>Direção, secretaria e professores receberão somente as ferramentas e dados necessários para suas funções.</span></div><button onClick={() => showToast("Configuração de perfis reservada ao administrador.")}>Configurar perfis</button></div>
        </div>
      </section>
      {toast && <div className="dashboard-toast" role="status">{toast}</div>}
    </main>
  );
}
