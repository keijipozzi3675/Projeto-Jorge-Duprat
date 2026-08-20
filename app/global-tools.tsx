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
};

export const GLOBAL_CHAT_EVENT = "duprat:open-chat";
export const GLOBAL_ACCESSIBILITY_EVENT = "duprat:open-accessibility";

export function openGlobalChat() {
  window.dispatchEvent(new Event(GLOBAL_CHAT_EVENT));
}

export function openGlobalAccessibility() {
  window.dispatchEvent(new Event(GLOBAL_ACCESSIBILITY_EVENT));
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function hasAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function answerChat(question: string): ChatAnswer {
  const normalized = normalizeText(question);

  if (hasAny(normalized, ["obrigad", "valeu", "ajudou"])) return { topic: "welcome", text: "Por nada! Se quiser, escolha uma das perguntas sugeridas abaixo para continuar." };
  if (/^(oi|ola|bom dia|boa tarde|boa noite)[!,. ]*$/.test(normalized)) return { topic: "welcome", text: "Olá! Como posso orientar você hoje? Escolha um assunto abaixo ou escreva sua dúvida." };
  if (hasAny(normalized, ["horario", "que horas", "funcionamento", "aberto", "atendimento"])) return { topic: "schedule", text: "A escola funciona de segunda a sexta, das 7h às 22h40. A secretaria atende das 8h às 17h. Em feriados, recessos ou datas especiais, confirme os avisos oficiais.", action: { label: "Ver contato e horários", href: "/contato" } };
  if (hasAny(normalized, ["endereco", "onde fica", "localizacao", "mapa", "como chegar"])) return { topic: "location", text: "A escola fica na Rua Antonio Lombardo, 140, Jardim Santa Terezinha, São Paulo. Na página Contato você encontra o mapa e o atalho para traçar a rota.", action: { label: "Abrir localização", href: "/contato" } };
  if (hasAny(normalized, ["telefone", "email", "e-mail", "contato", "falar com", "ligar"])) return { topic: "contact", text: "O telefone da escola é (11) 2721-0278 e o e-mail institucional é e043928a@educacao.sp.gov.br. Informações pessoais ou situações específicas devem ser tratadas diretamente com a equipe escolar.", action: { label: "Abrir página de contato", href: "/contato" } };
  if (hasAny(normalized, ["recomend", "parecido", "similar", "romance", "aventura", "genero de livro"])) return { topic: "recommendations", text: "Na Biblioteca, abra o livro desejado em “Saber mais”. A mini página mostra a sinopse e recomenda títulos relacionados por gênero, categoria e temas em comum.", action: { label: "Explorar livros", href: "/biblioteca" } };
  if (hasAny(normalized, ["livro", "biblioteca", "reserva", "emprestimo", "fila", "catalogo", "indisponivel"])) return { topic: "library", text: "Na Biblioteca você pode explorar o catálogo, abrir os detalhes de cada livro e solicitar uma reserva. Se não houver exemplar disponível, o pedido entra na fila e a escola acompanha a solicitação.", action: { label: "Abrir Biblioteca", href: "/biblioteca" } };
  if (hasAny(normalized, ["fundamental", "ensino medio", "eja", "curso", "etapa de ensino", "serie"])) return { topic: "courses", text: "O Portal apresenta o Ensino Fundamental II (6º ao 9º ano), o Ensino Médio e a EJA. Cada opção tem uma página com os objetivos e informações da etapa.", action: { label: "Conhecer os cursos", href: "/cursos" } };
  if (hasAny(normalized, ["equipe", "joelma", "silas", "marcus", "diretor", "coordenador", "profissional"])) return { topic: "team", text: "Na página Equipe, selecione um profissional para abrir uma mini página com sua função, área de atuação e contribuição para a escola.", action: { label: "Conhecer a equipe", href: "/equipe" } };
  if (hasAny(normalized, ["aviso", "agenda", "comunicado", "reuniao", "prazo"])) return { topic: "notices", text: "A página Avisos reúne os comunicados oficiais. Ao selecionar um aviso, você abre os detalhes com data, horário, local e orientações completas.", action: { label: "Ver avisos", href: "/avisos" } };
  if (hasAny(normalized, ["noticia", "enem", "pro-enem", "mutirao"])) return { topic: "news", text: "A área de Notícias reúne novidades e campanhas da escola, incluindo conteúdos do Mutirão Pró-ENEM. Para datas e procedimentos oficiais, confira também os Avisos.", action: { label: "Abrir Notícias", href: "/noticias" } };
  if (hasAny(normalized, ["interescolar", "campeonato", "esporte", "evento", "volei", "handebol", "xadrez", "basquete", "conquista", "medalha"])) return { topic: "sports", text: "Na página Esportes & Eventos você encontra o Interescolar, modalidades, encontros e conquistas do Duprat. As datas oficiais dos próximos compromissos também podem aparecer em Avisos.", action: { label: "Ver Esportes & Eventos", href: "/esportes-eventos" } };
  if (hasAny(normalized, ["gestao", "login", "entrar", "perfil", "permissao", "cargo", "secretaria", "professor"])) return { topic: "management", text: "A Área de gestão é exclusiva para profissionais autorizados pela escola. Cada conta é individual e recebe funções conforme o cargo; por exemplo, Secretaria, Direção, Coordenação, Professor e Sala de Leitura veem módulos diferentes.", action: { label: "Abrir Área de gestão", href: "/gestao" } };
  if (hasAny(normalized, ["segredo", "secreto", "easter egg", "misterio", "mistério"])) return { topic: "secret", text: "Há quem diga que uma passagem responde a um antigo padrão de direções. No final, seriam necessários controle e mudança..." };
  if (hasAny(normalized, ["acessibilidade", "contraste", "texto grande", "modo noturno", "tema escuro"])) return { topic: "accessibility", text: "Os recursos de acessibilidade ficam no botão “Aa” presente em todas as páginas. É possível ampliar o texto, ativar alto contraste e usar o modo noturno." };
  if (hasAny(normalized, ["historia", "sobre a escola", "jorge duprat", "estrutura", "quem somos"])) return { topic: "school", text: "Na página A Escola você encontra a apresentação institucional, a história e informações sobre a estrutura do Jorge Duprat Figueiredo.", action: { label: "Conhecer a escola", href: "/escola" } };

  return { topic: "fallback", text: "Ainda não encontrei uma resposta exata para essa pergunta. Posso ajudar com horários, localização, cursos, biblioteca, livros, avisos, notícias, equipe, campeonatos, eventos e acesso da gestão. Para uma situação específica, fale com a secretaria.", action: { label: "Falar com a escola", href: "/contato" } };
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
  const replyTimerRef = useRef<number | null>(null);
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
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    if (secretTimerRef.current !== null) window.clearTimeout(secretTimerRef.current);
  }, []);

  function sendChat(event: FormEvent) {
    event.preventDefault();
    submitQuestion(chatInput);
  }

  function submitQuestion(rawQuestion: string) {
    const question = rawQuestion.trim().slice(0, 300);
    if (!question || isTyping) return;
    setChatMessages((messages) => [...messages, { from: "user", text: question }].slice(-29));
    setChatInput("");
    setIsTyping(true);
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = window.setTimeout(() => {
      setChatMessages((messages) => [...messages, { from: "bot", ...answerChat(question) }].slice(-30));
      setIsTyping(false);
      replyTimerRef.current = null;
    }, 360);
  }

  function resetChat() {
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = null;
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
            <div><strong>DupratBot</strong><small><i /> Assistente virtual do portal</small></div>
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
          <small className="chat-note">Conversa mantida apenas nesta sessão. Confirme informações importantes com a secretaria.</small>
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
