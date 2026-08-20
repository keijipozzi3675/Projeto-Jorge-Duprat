import { env } from "cloudflare:workers";

export type PublicSchoolPost = {
  id: number;
  type: "notice" | "event" | "news";
  slug: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export async function getPublishedPosts(types?: PublicSchoolPost["type"][]) {
  try {
    const placeholders = types?.length ? types.map(() => "?").join(", ") : "";
    const sql = `
      SELECT id, type, slug, category, title, summary, content,
        event_date AS eventDate, event_time AS eventTime, location,
        published_at AS publishedAt, created_at AS createdAt
      FROM school_posts
      WHERE status = 'published'${types?.length ? ` AND type IN (${placeholders})` : ""}
      ORDER BY COALESCE(event_date, published_at, created_at) DESC
      LIMIT 100
    `;
    const query = types?.length ? env.DB.prepare(sql).bind(...types) : env.DB.prepare(sql);
    const result = await query.all<PublicSchoolPost>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    return await env.DB.prepare(`
      SELECT id, type, slug, category, title, summary, content,
        event_date AS eventDate, event_time AS eventTime, location,
        published_at AS publishedAt, created_at AS createdAt
      FROM school_posts
      WHERE slug = ? AND status = 'published'
      LIMIT 1
    `).bind(slug).first<PublicSchoolPost>();
  } catch {
    return null;
  }
}

export function publicPostDate(post: PublicSchoolPost) {
  const raw = post.eventDate ?? post.publishedAt ?? post.createdAt;
  const date = new Date(raw.length === 10 ? `${raw}T12:00:00` : raw.replace(" ", "T") + (raw.endsWith("Z") ? "" : "Z"));
  if (Number.isNaN(date.getTime())) return { day: "--", month: "---", fullDate: raw };
  return {
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).format(date).replace(".", "").toLocaleUpperCase("pt-BR"),
    fullDate: new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date),
  };
}
