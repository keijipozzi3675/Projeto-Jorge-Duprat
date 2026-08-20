"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type ChatTopic = "welcome" | "schedule" | "location" | "contact" | "library" | "recommendations" | "team" | "notices" | "news" | "sports" | "courses" | "management" | "accessibility" | "school" | "secret" | "fallback";
type ChatAction = { label: string; href: string };
type ChatMessage = { from: "bot" | "user"; text: string; topic?: ChatTopic; action?: ChatAction };
type ChatSuggestion = { label: string; question: string };
type ChatAnswer = { text: string; topic: ChatTopic; action?: ChatAction };

const CHAT_STORAGE_KEY = "duprat-chat-session";
const SECRET_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "Control", "Shift"] as const;
const initialMessage: ChatMessage = {
  from: "bot",
  topic: "welcome",
  text: "Olá! Eu sou o DupratBot, assistente do Portal Duprat. Posso orientar você sobre horários, cursos, biblioteca, avisos, equipe, esportes, eventos e serviços da escola.",
};

const defaultSuggestions: ChatSuggestion[] = [
  { label: "Horários", question: "Qual é o horário da escola e da secretaria?" },
  { label: "Cursos", question: "Quais etapas de ensino a escola oferece?" },
  { label: "Biblioteca", question: "Como conhecer e reservar um livro?" },
  { label: "Avisos", question: "Onde vejo os avisos da escola?" },
  { label: "Esportes", question: "Onde vejo os campeonatos e eventos?" },
  { label: "Um segredo?", question: "Existe alguma fase secreta no portal? Me dê apenas a primeira pista." },
];

const topicSuggestions: Partial<Record<ChatTopic, ChatSuggestion[]>> = {
  library: [
    { label: "Fazer reserva", question: "Como faço uma reserva de livro?" },
    { label: "Fila de espera", question: "O que acontece se o livro estiver indisponível?" },
    { label: "Livros parecidos", question: "Como vejo recomendações de livros parecidos?" },
    { label: "Avisos", question: "Onde vejo os avisos da escola?" },
  ],
  recommendations: [
    { label: "Abrir Biblioteca", question: "Onde encontro o catálogo da biblioteca?" },
    { label: "Romance", question: "Como encontro livros de romance?" },
    { label: "Aventura", question: "Como encontro livros de aventura?" },
    { label: "Reservar", question: "Como faço uma reserva de livro?" },
  ],
  sports: [
    { label: "Interescolar", question: "O que encontro na área do Interescolar?" },
    { label: "Próximos eventos", question: "Onde confirmo as datas dos próximos eventos?" },
    { label: "Conquistas", question: "Onde vejo as conquistas esportivas do Duprat?" },
    { label: "Avisos", question: "Onde vejo os avisos da escola?" },
  ],
  notices: [
    { label: "Abrir comunicado", question: "Como abro os detalhes de um aviso?" },
    { label: "Notícias", question: "Onde encontro as notícias da escola?" },
    { label: "Eventos", question: "Onde vejo os eventos da escola?" },
    { label: "Secretaria", question: "Qual é o horário da secretaria?" },
  ],
  news: [
    { label: "Avisos", question: "Onde vejo os avisos da escola?" },
    { label: "Pró-ENEM", question: "Onde encontro informações do Mutirão Pró-ENEM?" },
    { label: "Eventos", question: "Onde vejo os eventos da escola?" },
    { label: "Cursos", question: "Quais etapas de ensino a escola oferece?" },
  ],
  team: [
    { label: "Conhecer a equipe", question: "Como conheço os profissionais da escola?" },
    { label: "Secretaria", question: "Qual é o horário da secretaria?" },
    { label: "Gestão", question: "Quem pode acessar a Área de gestão?" },
    { label: "Contato", question: "Como entro em contato com a escola?" },
  ],
  management: [
    { label: "Acesso", question: "Como funciona o acesso da equipe à gestão?" },
    { label: "Perfis", question: "Cada cargo vê funções diferentes na gestão?" },
    { label: "Equipe", question: "Como conheço os profissionais da escola?" },
    { label: "Voltar ao portal", question: "Onde vejo os avisos públicos?" },
  ],
  courses: [
    { label: "Fundamental II", question: "Como funciona o Ensino Fundamental II?" },
    { label: "Ensino Médio", question: "Como funciona o Ensino Médio?" },
    { label: "EJA", question: "A escola oferece EJA?" },
    { label: "Falar com a escola", question: "Como entro em contato com a escola?" },
  ],
  schedule: [
    { label: "Localização", question: "Onde fica a escola?" },
    { label: "Telefone", question: "Qual é o telefone da escola?" },
    { label: "Avisos", question: "Onde vejo os avisos da escola?" },
    { label: "Cursos", question: "Quais etapas de ensino a escola oferece?" },
  ],
  location: [
    { label: "Como chegar", question: "Onde encontro o mapa para chegar à escola?" },
    { label: "Telefone", question: "Qual é o telefone da escola?" },
    { label: "Horários", question: "Qual é o horário da secretaria?" },
    { label: "Equipe", question: "Como conheço os profissionais da escola?" },
  ],
  contact: [
    { label: "Horário", question: "Qual é o horário da secretaria?" },
    { label: "Endereço", question: "Onde fica a escola?" },
    { label: "Avisos", question: "Onde vejo os avisos da escola?" },
    { label: "Biblioteca", question: "Como conhecer e reservar um livro?" },
  ],
  secret: [
    { label: "Primeira pista", question: "Me dê a primeira pista da fase secreta, sem revelar a sequência." },
    { label: "Mais uma pista", question: "Quero a segunda pista da fase secreta." },
    { label: "Pista final", question: "Me dê a última pista antes da sequência completa." },
    { label: "Revelar sequência", question: "Qual é a sequência completa para liberar a fase secreta?" },
  ],
};

export const GLOBAL_CHAT_EVENT = "duprat:open-chat";
export const GLOBAL_ACCESSIBILITY_EVENT = "duprat:open-accessibility";

export function openGlobalChat() {
  window.dispatchEvent(new Event(GLOBAL_CHAT_EVENT));
}

export function openGlobalAccessibility() {
  window.dispatchEvent(new Event(GLOBAL_ACCESSIBILITY_EVENT));
}

function suggestedQuestions(messages: ChatMessage[]) {
  const topic = [...messages].reverse().find((message) => message.from === "bot")?.topic ?? "welcome";
  const suggestions = topicSuggestions[topic];
  return Array.isArray(suggestions) ? suggestions : defaultSuggestions;
}

function validStoredMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.slice(-30).every((item) => {
    if (!item || typeof item !== "object") return false;
    const message = item as ChatMessage;
    const validAction = !message.action || (typeof message.action.label === "string" && typeof message.action.href === "string" && message.action.href.startsWith("/") && !message.action.href.startsWith("//"));
    return (message.from === "bot" || message.from === "user") && typeof message.text === "string" && message.text.length <= 1000 && validAction;
  });
}

export default function GlobalTools() {
  const [dark, setDark] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialMessage]);
  const [historyReady, setHistoryReady] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [secretAwake, setSecretAwake] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const secretSequenceIndexRef = useRef(0);
  const secretTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem("duprat-theme");
      const savedContrast = window.localStorage.getItem("duprat-contrast");
      const savedLargeText = window.localStorage.getItem("duprat-large-text");
      setDark(savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
      setContrast(savedContrast === "true");
      setLargeText(savedLargeText === "true");
      try {
        const stored: unknown = JSON.parse(window.sessionStorage.getItem(CHAT_STORAGE_KEY) ?? "null");
        if (validStoredMessages(stored)) setChatMessages(stored.slice(-30));
      } catch {
        window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
      }
      setHistoryReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const listenForSecret = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      const expected = SECRET_SEQUENCE[secretSequenceIndexRef.current];
      if (event.key === expected) {
        event.preventDefault();
        secretSequenceIndexRef.current += 1;
      } else {
        secretSequenceIndexRef.current = event.key === SECRET_SEQUENCE[0] ? 1 : 0;
      }
      if (secretSequenceIndexRef.current === SECRET_SEQUENCE.length) {
        secretSequenceIndexRef.current = 0;
        window.sessionStorage.setItem("duprat-secret-unlocked", "true");
        setSecretAwake(true);
        if (secretTimerRef.current !== null) window.clearTimeout(secretTimerRef.current);
        secretTimerRef.current = window.setTimeout(() => window.location.assign("/renascer"), 900);
      }
    };
    window.addEventListener("keydown", listenForSecret);
    return () => window.removeEventListener("keydown", listenForSecret);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.classList.toggle("high-contrast", contrast);
    document.documentElement.classList.toggle("large-text", largeText);
    window.localStorage.setItem("duprat-theme", dark ? "dark" : "light");
    window.localStorage.setItem("duprat-contrast", String(contrast));
    window.localStorage.setItem("duprat-large-text", String(largeText));
  }, [dark, contrast, largeText]);

  useEffect(() => {
    if (historyReady) window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages.slice(-30)));
  }, [chatMessages, historyReady]);

  useEffect(() => {
    const openChat = () => setChatOpen(true);
    const openAccessibility = () => setAccessOpen(true);
    window.addEventListener(GLOBAL_CHAT_EVENT, openChat);
    window.addEventListener(GLOBAL_ACCESSIBILITY_EVENT, openAccessibility);
    return () => {
      window.removeEventListener(GLOBAL_CHAT_EVENT, openChat);
      window.removeEventListener(GLOBAL_ACCESSIBILITY_EVENT, openAccessibility);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen, isTyping]);

  useEffect(() => () => {
    if (secretTimerRef.current !== null) window.clearTimeout(secretTimerRef.current);
  }, []);

  function sendChat(event: FormEvent) {
    event.preventDefault();
    submitQuestion(chatInput);
  }

  async function submitQuestion(rawQuestion: string) {
    const question = rawQuestion.trim().slice(0, 300);
    if (!question || isTyping) return;
    const userMessage: ChatMessage = { from: "user", text: question };
    const requestMessages = [...chatMessages, userMessage].slice(-12);
    setChatMessages((messages) => [...messages, userMessage].slice(-29));
    setChatInput("");
    setIsTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages.map((message) => ({
            role: message.from === "bot" ? "assistant" : "user",
            content: message.text,
          })),
        }),
      });
      const payload = await response.json() as Partial<ChatAnswer> & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível obter uma resposta.");
      if (typeof payload.text !== "string" || !payload.text.trim()) throw new Error("A resposta chegou vazia.");
      setChatMessages((messages) => [...messages, {
        from: "bot",
        text: payload.text.trim().slice(0, 1400),
        topic: payload.topic ?? "fallback",
        action: payload.action,
      }].slice(-30));
    } catch (error) {
      const message = error instanceof Error ? error.message : "O assistente está temporariamente indisponível.";
      setChatMessages((messages) => [...messages, {
        from: "bot",
        topic: "fallback",
        text: message,
        action: { label: "Falar com a escola", href: "/contato" },
      }].slice(-30));
    } finally {
      setIsTyping(false);
    }
  }

  function resetChat() {
    setIsTyping(false);
    setChatInput("");
    setChatMessages([initialMessage]);
    window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
  }

  return (
    <>
      {secretAwake && <div className="secret-awakening" role="status" aria-live="assertive"><i>✦</i><small>CHAVE RECONHECIDA</small><strong>A passagem despertou</strong></div>}
      <div className="floating-tools" aria-label="Ferramentas rápidas">
        <button onClick={() => setDark((value) => !value)} title={dark ? "Ativar modo claro" : "Ativar modo noturno"} aria-label={dark ? "Ativar modo claro" : "Ativar modo noturno"}>{dark ? "☀" : "☾"}</button>
        <button onClick={() => setAccessOpen(true)} title="Acessibilidade" aria-label="Abrir recursos de acessibilidade">Aa</button>
      </div>

      <button className={chatOpen ? "chat-launcher is-open" : "chat-launcher"} onClick={() => setChatOpen((value) => !value)} aria-label={chatOpen ? "Fechar assistente virtual" : "Abrir assistente virtual"}>
        <span className="chat-face">{chatOpen ? "×" : <Image src="/assets/mascote-avatar.png" alt="" width={230} height={230} unoptimized />}</span>
        {!chatOpen && <span className="chat-label"><strong>Precisa de ajuda?</strong><small>Fale com o DupratBot</small></span>}
      </button>

      {chatOpen && (
        <aside className="chat-window" aria-label="Assistente virtual DupratBot">
          <header>
            <span className="chat-avatar"><Image src="/assets/mascote-avatar.png" alt="Mascote azul da escola" width={230} height={230} unoptimized /></span>
            <div><strong>DupratBot</strong><small><i /> Assistente escolar com GPT</small></div>
            <span className="chat-header-actions">
              <button type="button" onClick={resetChat} aria-label="Iniciar nova conversa" title="Nova conversa">↻</button>
              <button type="button" onClick={() => setChatOpen(false)} aria-label="Fechar chat" title="Fechar">×</button>
            </span>
          </header>
          <div className="chat-body" aria-live="polite">
            {chatMessages.map((message, index) => (
              <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}>
                <span>{message.text}</span>
                {message.action && <a href={message.action.href}>{message.action.label} →</a>}
              </div>
            ))}
            {isTyping && <div className="chat-message bot chat-typing" aria-label="DupratBot está respondendo"><i /><i /><i /></div>}
            {!isTyping && (
              <div className="chat-suggestions" aria-label="Perguntas sugeridas">
                <small>Você também pode perguntar:</small>
                <div>{suggestedQuestions(chatMessages).map((suggestion) => <button type="button" key={suggestion.question} onClick={() => submitQuestion(suggestion.question)}>{suggestion.label}</button>)}</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat}>
            <input value={chatInput} maxLength={300} disabled={isTyping} onChange={(event) => setChatInput(event.target.value)} placeholder={isTyping ? "Preparando resposta..." : "Digite sua dúvida..."} aria-label="Mensagem para o DupratBot" />
            <button disabled={isTyping || !chatInput.trim()} aria-label="Enviar mensagem">➤</button>
          </form>
          <small className="chat-note">Respostas geradas por IA. Não envie dados pessoais e confirme informações importantes com a secretaria.</small>
        </aside>
      )}

      {accessOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAccessOpen(false)}>
          <section className="access-panel" role="dialog" aria-modal="true" aria-labelledby="global-access-title">
            <header><div><span className="modal-icon">Aa</span><div><small>PERSONALIZE O PORTAL</small><h2 id="global-access-title">Acessibilidade</h2></div></div><button onClick={() => setAccessOpen(false)} aria-label="Fechar">×</button></header>
            <div className="access-options">
              <button className={largeText ? "selected" : ""} onClick={() => setLargeText((value) => !value)}><span className="access-symbol">A+</span><strong>Texto ampliado</strong><small>Aumenta o tamanho das letras</small><i>{largeText ? "Ativo" : "Ativar"}</i></button>
              <button className={contrast ? "selected" : ""} onClick={() => setContrast((value) => !value)}><span className="access-symbol contrast-symbol" /><strong>Alto contraste</strong><small>Realça textos e elementos</small><i>{contrast ? "Ativo" : "Ativar"}</i></button>
              <button className={dark ? "selected" : ""} onClick={() => setDark((value) => !value)}><span className="access-symbol">☾</span><strong>Modo noturno</strong><small>Reduz o brilho da interface</small><i>{dark ? "Ativo" : "Ativar"}</i></button>
            </div>
            <button className="reset-access" onClick={() => { setDark(false); setContrast(false); setLargeText(false); }}>Restaurar configurações</button>
          </section>
        </div>
      )}
    </>
  );
}
