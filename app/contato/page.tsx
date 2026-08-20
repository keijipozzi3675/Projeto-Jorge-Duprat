import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InstitutionalPage from "../institutional-page";

export const metadata: Metadata = {
  title: "Contato | Portal Duprat",
  description: "Canais oficiais e localização da E.E. Jorge Duprat Figueiredo.",
};

export default function ContatoPage() {
  return (
    <InstitutionalPage active="contato" eyebrow="Canais oficiais" title="Contato e localização" intro="Encontre os telefones, o e-mail institucional, os horários de atendimento e a rota para chegar à escola." image="/assets/frente-escola.jpg" imageAlt="Entrada da E.E. Jorge Duprat Figueiredo">
      <section className="institutional-section">
        <div className="shell contact-page-grid">
          <div className="contact-channel-grid">
            <a href="tel:+551127210278"><span>☎</span><small>TELEFONE PRINCIPAL</small><strong>(11) 2721-0278</strong><p>Atendimento da unidade escolar.</p></a>
            <a href="tel:+551127222631"><span>☎</span><small>TELEFONE ALTERNATIVO</small><strong>(11) 2722-2631</strong><p>Canal complementar de contato.</p></a>
            <a href="mailto:e043928a@educacao.sp.gov.br"><span>✉</span><small>E-MAIL INSTITUCIONAL</small><strong>e043928a@educacao.sp.gov.br</strong><p>Envio de dúvidas e solicitações.</p></a>
            <article><span>◷</span><small>SECRETARIA</small><strong>Segunda a sexta</strong><p>Atendimento das 8h às 17h.</p></article>
          </div>
          <aside className="contact-location-card">
            <div className="contact-map-visual"><span>JD</span></div>
            <small>ENDEREÇO</small><h2>Rua Antonio Lombardo, 140</h2><p>Jardim Santa Terezinha<br />São Paulo — SP • CEP 03572-230</p>
            <a className="button button-primary" href="https://www.google.com/maps/search/?api=1&query=Rua+Antonio+Lombardo%2C+140%2C+Sao+Paulo+SP" target="_blank" rel="noreferrer">Abrir rota no mapa ↗</a>
          </aside>
        </div>
      </section>
      <section className="contact-assistant-section"><div className="shell"><Image src="/assets/mascote-full.png" alt="DupratBot, mascote azul do portal" width={330} height={476} unoptimized /><div><span className="section-label section-label-light">ATENDIMENTO DIGITAL</span><h2>O DupratBot também pode orientar você.</h2><p>Na página inicial, o assistente responde dúvidas rápidas sobre horários, endereço e biblioteca. Informações importantes devem ser confirmadas com a secretaria.</p><Link className="button button-gold" href="/#conteudo">Voltar ao portal →</Link></div></div></section>
    </InstitutionalPage>
  );
}
