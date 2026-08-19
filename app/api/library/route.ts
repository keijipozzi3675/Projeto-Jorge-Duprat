import { env } from "cloudflare:workers";

type ReservationPayload = {
  bookId?: number;
  studentName?: string;
  className?: string;
  phone?: string;
};

function cleanPhone(value: string) {
  return value.replace(/\D/g, "");
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  if (message.includes("no such table") || message.includes("binding")) {
    return "A biblioteca está sendo preparada. Tente novamente em alguns instantes.";
  }
  return "Não foi possível registrar a solicitação agora.";
}

export async function GET() {
  try {
    const result = await env.DB.prepare(`
      SELECT b.id, b.title, b.author, b.category, b.total_copies AS totalCopies,
        MAX(b.total_copies - SUM(CASE WHEN r.status IN ('ready', 'borrowed') THEN 1 ELSE 0 END), 0) AS available,
        SUM(CASE WHEN r.status = 'waiting' THEN 1 ELSE 0 END) AS queueSize
      FROM books b
      LEFT JOIN reservations r ON r.book_id = b.id
      GROUP BY b.id
      ORDER BY b.title
    `).all();
    return Response.json({ books: result.results });
  } catch (error) {
    return Response.json({ error: safeError(error) }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as ReservationPayload;
    const studentName = payload.studentName?.trim() ?? "";
    const className = payload.className?.trim() ?? "";
    const phone = cleanPhone(payload.phone ?? "");
    const bookId = Number(payload.bookId);

    if (!Number.isInteger(bookId) || bookId < 1) return Response.json({ error: "Livro inválido." }, { status: 400 });
    if (studentName.length < 3 || studentName.length > 100) return Response.json({ error: "Informe o nome completo." }, { status: 400 });
    if (className.length < 1 || className.length > 30) return Response.json({ error: "Informe a turma." }, { status: 400 });
    if (phone.length < 10 || phone.length > 13) return Response.json({ error: "Informe um WhatsApp válido." }, { status: 400 });

    const duplicate = await env.DB.prepare(`
      SELECT id FROM reservations
      WHERE book_id = ? AND phone = ? AND status IN ('ready', 'waiting', 'borrowed')
      LIMIT 1
    `).bind(bookId, phone).first();
    if (duplicate) return Response.json({ error: "Já existe uma solicitação ativa para este livro e telefone." }, { status: 409 });

    const book = await env.DB.prepare("SELECT id, title, total_copies AS totalCopies FROM books WHERE id = ?")
      .bind(bookId).first<{ id: number; title: string; totalCopies: number }>();
    if (!book) return Response.json({ error: "Livro não encontrado." }, { status: 404 });

    const active = await env.DB.prepare("SELECT COUNT(*) AS count FROM reservations WHERE book_id = ? AND status IN ('ready', 'borrowed')")
      .bind(bookId).first<{ count: number }>();
    const waiting = await env.DB.prepare("SELECT COUNT(*) AS count FROM reservations WHERE book_id = ? AND status = 'waiting'")
      .bind(bookId).first<{ count: number }>();

    const isReady = Number(active?.count ?? 0) < book.totalCopies;
    const status = isReady ? "ready" : "waiting";
    const position = isReady ? null : Number(waiting?.count ?? 0) + 1;
    const pickupDeadline = isReady ? new Date(Date.now() + 2 * 86400000).toISOString() : null;

    const insertion = await env.DB.prepare(`
      INSERT INTO reservations (book_id, student_name, class_name, phone, status, queue_position, pickup_deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(bookId, studentName, className, phone, status, position, pickupDeadline).run();

    const reservationId = Number(insertion.meta.last_row_id);
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO notifications (reservation_id, recipient, channel, template, status) VALUES (?, ?, 'whatsapp', ?, 'pending')`)
        .bind(reservationId, phone, isReady ? "reservation_ready" : "queue_joined"),
      env.DB.prepare(`INSERT INTO notifications (reservation_id, recipient, channel, template, status) VALUES (?, 'secretaria', 'dashboard', 'new_reservation', 'pending')`)
        .bind(reservationId),
    ]);

    return Response.json({
      reservationId,
      status,
      position,
      message: isReady
        ? `O exemplar de “${book.title}” foi separado. Retire na sala de leitura em até 2 dias úteis.`
        : `Você entrou na fila de “${book.title}” na posição ${position}. Avisaremos quando chegar sua vez.`,
    }, { status: 201 });
  } catch (error) {
    return Response.json({ error: safeError(error) }, { status: 503 });
  }
}
