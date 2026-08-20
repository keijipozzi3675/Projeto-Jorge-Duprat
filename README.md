# Portal Duprat

O Portal escolar da E.E. Jorge Duprat Figueiredo é um sistema web desenvolvido para centralizar o acesso a 
informações públicas, catálogo da sala de leitura, reservas, fila de esperas , avisos e oferecer uma área 
administrativa restrita para a equipe escolar


## Funcionalidades

- Página pública informativa e responsiva com informações da escola, avisos, contatos e rota.
- Catálogo pesquisável e filtros por categoria.
- Reserva de livros e fila automática quando não há exemplar disponível.
- Registro persistente de livros, reservas e notificações em D1.
- Notificação interna para a secretaria e fila de envio para WhatsApp.
- DupratBot conectado à OpenAI Responses API, com respostas geradas pelo GPT e dicas progressivas sobre a fase secreta.
- Modo noturno, texto ampliado, alto contraste e navegação por teclado.
- Página da equipe e Área de gestão protegida por autenticação.
- Painel administrativo com visão de empréstimos, filas e alertas.

## Tecnologias

- Core e Interface: Next.js 16, React 19 e TypeScript.
- Execução e Deploy: Vinext/Vite para execução compatível com Cloudflare Workers.
- Banco  de dados e ORM: Cloudflare D1 com Drizzle ORM para dados estruturados.
- Inteligência artificial: OpenAI Responses API em uma rota protegida no servidor.
- Autenticação gerenciada pela plataforma para rotas internas.

## Execução local

```bash
# Clone o repositório
git clone[https://github.com/seu-usuario/portal-jorge-duprat.git](https://github.com/seu-usuario/portal-jorge-duprat.git)

# Acesse a pasta do projeto
cd portal-jorge-duprat

# Instale as dependências
npm install

# Configure a chave somente em .env.local (nunca envie esse arquivo ao GitHub)
OPENAI_API_KEY=sua_chave_de_projeto
OPENAI_MODEL=gpt-5.6

#Inicie o servidor de desenvolvimento
npm run dev
```

## Verificações

```bash
# Executa a verificação de linting e padronização do código 
npm run lint

# Executa a suíte de testes automatizados
npm test
```

## Estrutura principal

- `app/portal-client.tsx`: página pública e interações.
- `app/equipe`: página da equipe escolar.
- `app/gestao`: painel protegido.
- `app/api/chat`: API segura do DupratBot com GPT.
- `app/api/library`: API de catálogo, reservas e fila.
- `db/schema.ts`: modelo de dados.
- `drizzle/`: migrações e catálogo inicial.

Consulte também `ARQUITETURA-E-PERFIS.md`, `PRIMEIRO-ACESSO-DIRECAO.md`, `BACKEND-WHATSAPP.md` e `SECURITY.md`.
