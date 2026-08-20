import { env } from "cloudflare:workers";

type ChatRole = "user" | "assistant";
type ChatInput = { role: ChatRole; content: string };
type ChatTopic = "welcome" | "schedule" | "location" | "contact" | "library" | "recommendations" | "team" | "notices" | "news" | "sports" | "courses" | "management" | "accessibility" | "school" | "secret" | "fallback";
type ChatAction = { label: string; href: string };
type RuntimeEnv = {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 600;
const MAX_TOTAL_LENGTH = 3600;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_REQUESTS = 12;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const SYSTEM_INSTRUCTIONS = `
Você é o DupratBot, assistente escolar virtual da E.E. Jorge Duprat Figueiredo. Responda sempre em português do Brasil, de forma acolhedora, objetiva e apropriada para estudantes, famílias e profissionais da escola.

Informações do portal:
- Escola: E.E. Jorge Duprat Figueiredo.
- Escola: segunda a sexta, das 7h às 22h40. Secretaria: das 8h às 17h; horários especiais devem ser confirmados nos avisos.
- Etapas: Ensino Fundamental II, Ensino Médio e EJA.
- Páginas: /escola, /cursos, /noticias, /esportes-eventos, /avisos, /biblioteca, /equipe, /contato e /gestao.
- Para endereço, telefone, e-mail, mapa ou rota, oriente a pessoa a consultar /contato em vez de reproduzir dados no chat.
- A gestão é restrita a profissionais autorizados, com funções diferentes por cargo.
- A biblioteca permite conhecer livros, abrir detalhes, receber recomendações e solicitar reserva ou fila.

Regras:
1. Não invente datas, nomes, resultados, vagas, regras ou informações pessoais. Quando não houver confirmação no contexto, indique a página adequada ou a secretaria.
2. Não solicite nem repita dados pessoais, documentos, senhas, telefones de estudantes ou informações sensíveis.
3. Não finja realizar matrículas, reservas ou ações administrativas. Explique o caminho correto no portal.
4. Mantenha o foco na escola e no portal; para assuntos sem relação, explique brevemente essa limitação.
5. Use no máximo três parágrafos curtos. Não use Markdown complexo.

Fase secreta do portal:
- Na primeira pergunta sobre o segredo, dê apenas uma pista vaga: existe um antigo padrão de direções que começa olhando para cima.
- Se pedirem outra pista, revele que são duas direções para cima, duas para baixo, depois esquerda e direita.
- Na pista final, diga que termina com as teclas de controle e mudança.
- Somente se pedirem explicitamente a sequência completa, revele: ↑ ↑ ↓ ↓ ← → Ctrl Shift. Explique que deve ser digitada nessa ordem, fora de campos de texto, em qualquer página do portal.
`;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem da solicitação não permitida." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) return Response.json({ error: "Mensagem grande demais." }, { status: 413 });
  if (!withinRateLimit(request)) return Response.json({ error: "Muitas mensagens em pouco tempo. Aguarde um minuto e tente novamente." }, { status: 429 });

  const runtimeEnv = env as unknown as RuntimeEnv;
  const apiKey = runtimeEnv.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: "O assistente com GPT ainda aguarda a configuração segura da escola." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitação inválida." }, { status: 400 });
  }

  const messages = readMessages(body);
  if (!messages) return Response.json({ error: "Digite uma mensagem válida para o DupratBot." }, { status: 400 });
  const lastQuestion = messages.at(-1)?.content ?? "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 22_000);

  try {
    const upstream = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Client-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        model: runtimeEnv.OPENAI_MODEL?.trim() || "gpt-5.6",
        instructions: SYSTEM_INSTRUCTIONS,
        input: messages,
        max_output_tokens: 420,
        store: false,
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      console.error("OpenAI request failed", upstream.status, upstream.headers.get("x-request-id"));
      const error = upstream.status === 429
        ? "O DupratBot está muito ocupado agora. Aguarde um momento e tente novamente."
        : "O DupratBot não conseguiu responder agora. Tente novamente em instantes.";
      return Response.json({ error }, { status: upstream.status === 429 ? 429 : 502 });
    }

    const data = await upstream.json() as unknown;
    const text = extractOutputText(data);
    if (!text) return Response.json({ error: "O DupratBot recebeu uma resposta vazia. Tente reformular a pergunta." }, { status: 502 });
    const navigation = navigationFor(lastQuestion);
    return Response.json({ text: text.slice(0, 1400), ...navigation });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "O DupratBot demorou para responder. Tente novamente."
      : "O DupratBot está temporariamente indisponível.";
    return Response.json({ error: message }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}

function readMessages(body: unknown): ChatInput[] | null {
  if (!body || typeof body !== "object") return null;
  const rawMessages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) return null;
  const messages: ChatInput[] = [];
  let totalLength = 0;

  for (const raw of rawMessages.slice(-MAX_MESSAGES)) {
    if (!raw || typeof raw !== "object") continue;
    const role = (raw as { role?: unknown }).role;
    const content = (raw as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const cleaned = content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!cleaned) continue;
    totalLength += cleaned.length;
    if (totalLength > MAX_TOTAL_LENGTH) return null;
    messages.push({ role, content: cleaned });
  }

  if (!messages.length || messages.at(-1)?.role !== "user") return null;
  return messages;
}

function extractOutputText(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const direct = (data as { output_text?: unknown }).output_text;
  if (typeof direct === "string") return direct.trim();
  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  return output.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) return [];
    return content.flatMap((part) => {
      if (!part || typeof part !== "object") return [];
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? [text] : [];
    });
  }).join("\n").trim();
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function withinRateLimit(request: Request) {
  const now = Date.now();
  const client = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket = rateLimitBuckets.get(client);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(client, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  if (rateLimitBuckets.size > 500) {
    for (const [key, value] of rateLimitBuckets) if (value.resetAt <= now) rateLimitBuckets.delete(key);
  }
  return bucket.count <= RATE_LIMIT_REQUESTS;
}

function navigationFor(question: string): { topic: ChatTopic; action?: ChatAction } {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const includes = (...words: string[]) => words.some((word) => normalized.includes(word));
  if (includes("segredo", "secreto", "easter egg", "fase secreta", "sequencia", "pista")) return { topic: "secret" };
  if (includes("horario", "funcionamento", "que horas")) return { topic: "schedule", action: { label: "Ver horários", href: "/contato" } };
  if (includes("endereco", "localizacao", "mapa", "como chegar")) return { topic: "location", action: { label: "Abrir localização", href: "/contato" } };
  if (includes("telefone", "e-mail", "email", "contato")) return { topic: "contact", action: { label: "Falar com a escola", href: "/contato" } };
  if (includes("livro", "biblioteca", "reserva", "fila", "emprestimo", "recomend")) return { topic: "library", action: { label: "Abrir Biblioteca", href: "/biblioteca" } };
  if (includes("curso", "fundamental", "ensino medio", "eja")) return { topic: "courses", action: { label: "Conhecer os cursos", href: "/cursos" } };
  if (includes("equipe", "diretor", "professor", "coordenador", "joelma")) return { topic: "team", action: { label: "Conhecer a equipe", href: "/equipe" } };
  if (includes("aviso", "comunicado", "reuniao", "prazo")) return { topic: "notices", action: { label: "Ver avisos", href: "/avisos" } };
  if (includes("noticia", "enem", "mutirao")) return { topic: "news", action: { label: "Abrir Notícias", href: "/noticias" } };
  if (includes("interescolar", "campeonato", "esporte", "evento", "volei", "xadrez")) return { topic: "sports", action: { label: "Ver Esportes & Eventos", href: "/esportes-eventos" } };
  if (includes("gestao", "login", "perfil", "permissao", "cargo")) return { topic: "management", action: { label: "Abrir Área de gestão", href: "/gestao" } };
  if (includes("acessibilidade", "contraste", "modo noturno")) return { topic: "accessibility" };
  if (includes("historia", "escola", "jorge duprat", "estrutura")) return { topic: "school", action: { label: "Conhecer a escola", href: "/escola" } };
  return { topic: "fallback" };
}
