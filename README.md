# Portal Duprat

Portal escolar da E.E. Jorge Duprat Figueiredo, criado para reunir informações públicas, catálogo da sala de leitura, reservas, fila de espera, avisos e uma área protegida para a equipe escolar.

## O que já funciona

- Página pública responsiva com informações da escola, avisos, contatos e rota.
- Catálogo pesquisável e filtros por categoria.
- Reserva de livros e fila automática quando não há exemplar disponível.
- Registro persistente de livros, reservas e notificações em D1.
- Notificação interna para a secretaria e fila de envio para WhatsApp.
- Assistente virtual Duda com respostas para dúvidas frequentes.
- Modo noturno, texto ampliado, alto contraste e navegação por teclado.
- Página da equipe e Área de gestão protegida por autenticação.
- Painel administrativo com visão de empréstimos, filas e alertas.

## Tecnologias

- Next.js 16, React 19 e TypeScript.
- Vinext/Vite para execução compatível com Cloudflare Workers.
- Cloudflare D1 com Drizzle ORM para dados estruturados.
- Autenticação gerenciada pela plataforma para rotas internas.

## Execução local

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run lint
npm test
```

## Estrutura principal

- `app/portal-client.tsx`: página pública e interações.
- `app/equipe`: página da equipe escolar.
- `app/gestao`: painel protegido.
- `app/api/library`: API de catálogo, reservas e fila.
- `db/schema.ts`: modelo de dados.
- `drizzle/`: migrações e catálogo inicial.

Consulte também `ARQUITETURA-E-PERFIS.md`, `PRIMEIRO-ACESSO-DIRECAO.md`, `BACKEND-WHATSAPP.md` e `SECURITY.md`.
