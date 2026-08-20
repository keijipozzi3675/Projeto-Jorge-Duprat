# Portal Escolar Jorge Duprat

Portal digital da **E.E. Jorge Duprat Figueiredo**, desenvolvido para centralizar informações escolares, notícias, avisos, eventos, biblioteca, acessibilidade e ferramentas de gestão em um ambiente moderno, responsivo e seguro.

## Preview

O projeto está publicado e pode ser acessado em:

**https://portal-duprat.viciadosjogos01.chatgpt.site**

## Sobre o projeto

O Portal Escolar Jorge Duprat aproxima estudantes, responsáveis, professores e funcionários da escola. A parte pública reúne informações institucionais, cursos, equipe, notícias, avisos, campeonatos, eventos e o catálogo da sala de leitura.

O sistema também possui uma área de gestão protegida, na qual cada profissional recebe uma conta individual e permissões de acordo com o seu cargo. Dessa forma, Direção, Vice-Direção, Secretaria, Coordenação, Professores, Sala de Leitura e Administração Técnica acessam somente as ferramentas relacionadas às suas responsabilidades.

## Funcionalidades

### Portal público

- Página inicial responsiva com informações e destaques da escola.
- Páginas próprias para Escola, Cursos, Equipe, Notícias, Avisos, Esportes e Eventos, além das informações da Secretaria.
- Informações sobre Ensino Fundamental II, Ensino Médio e EJA.
- Notícias e avisos com páginas individuais para leitura completa.
- Área dedicada a campeonatos, Interescolar, conquistas e eventos escolares.
- Perfil individual dos integrantes da equipe escolar.
- Informações de contato, horários, localização e rota para a escola.

### Biblioteca escolar

- Catálogo pesquisável com filtros por categoria.
- Página individual de cada livro com sinopse e informações detalhadas.
- Recomendações de títulos semelhantes ao livro selecionado.
- Reserva de livros.
- Fila automática quando todos os exemplares estiverem reservados.
- Registro de datas e situação da reserva.
- Fila interna de notificações para integração com WhatsApp.

### Gestão escolar

- Autenticação e autorização individual por e-mail.
- Cargos e permissões personalizáveis.
- Painéis para Direção, Vice-Direção, Secretaria, Coordenação, Professores, Sala de Leitura e Administração Técnica.
- Cadastro e ativação de profissionais da escola.
- Criação, edição, publicação e arquivamento de notícias, avisos e eventos.
- Gerenciamento de tarefas internas.
- Acompanhamento das reservas da biblioteca.
- Registro de auditoria das ações administrativas.
- Proteção das operações no servidor e controle de acesso por permissão.

### DupratBot e acessibilidade

- Chatbot disponível em todas as páginas.
- Respostas geradas pela API da OpenAI por uma rota protegida no servidor.
- Perguntas sugeridas e sugestões contextuais após cada resposta.
- Respostas sobre horários, endereço, cursos, biblioteca, equipe, notícias, eventos e gestão.
- Dicas progressivas sobre a fase secreta e revelação da sequência quando solicitada.
- Atalhos para as páginas relacionadas à resposta.
- Histórico da conversa durante a sessão e botão para reiniciar.
- Modo noturno.
- Alto contraste.
- Aumento e redução do tamanho do texto.
- Navegação por teclado e melhorias semânticas para leitores de tela.

## Tecnologias utilizadas

### Linguagens

- **TypeScript** e **TSX** para a aplicação e seus componentes.
- **CSS** para o design, responsividade, temas e acessibilidade.
- **SQL** nas migrações do banco de dados.
- **Shell Script** nos processos de instalação, build e validação.

### Frameworks e bibliotecas

- **Next.js 16** — estrutura da aplicação, páginas, rotas dinâmicas e APIs.
- **React 19** — componentes e interações da interface.
- **Drizzle ORM** e **Drizzle Kit** — modelagem, consultas e migrações do banco.
- **Vite 8** e **Vinext** — compilação e execução compatível com Workers.
- **Cloudflare Vite Plugin** — integração da aplicação com Cloudflare Workers.
- **Cloudflare D1** — banco de dados SQL usado por livros, reservas, gestão e publicações.
- **Cloudflare Workers** — ambiente de execução do backend e do site.
- **OpenAI Responses API** — geração das respostas do DupratBot com GPT.
- **PostCSS** e **Tailwind CSS tooling** — processamento e suporte à camada de estilos.
- **ESLint** — análise de qualidade e padronização do código.
- **Node.js Test Runner** — testes automatizados do HTML renderizado.
- **Autenticação da plataforma ChatGPT** — identificação segura para a área interna hospedada.

## Estrutura do projeto

```text
Projeto-Jorge-Duprat/
├── app/
│   ├── api/
│   │   ├── chat/             # API segura do DupratBot com GPT
│   │   ├── library/          # API de livros, reservas e fila
│   │   └── management/       # API protegida da gestão escolar
│   ├── avisos/               # Lista e páginas individuais de avisos
│   ├── biblioteca/           # Catálogo, reservas e páginas dos livros
│   ├── contato/              # Contatos, horários e localização
│   ├── cursos/               # Modalidades de ensino
│   ├── equipe/               # Equipe e perfis individuais
│   ├── escola/               # História e informações institucionais
│   ├── esportes-eventos/     # Campeonatos e eventos escolares
│   ├── gestao/               # Painel administrativo por cargo
│   ├── noticias/             # Notícias e páginas individuais
│   ├── global-tools.tsx      # DupratBot e ferramentas de acessibilidade
│   └── globals.css           # Estilos globais e responsivos
├── db/
│   ├── index.ts              # Conexão com o banco
│   └── schema.ts             # Tabelas e relacionamentos
├── drizzle/                  # Migrações e metadados do banco
├── public/
│   └── assets/               # Brasão, mascote e fotografias da escola
├── worker/                   # Entrada do Cloudflare Worker
├── build/                    # Integração de build para hospedagem
├── scripts/                  # Instalação, build e validações
├── tests/                    # Testes automatizados
├── package.json              # Dependências e comandos do projeto
├── README.md                 # Documentação principal
└── SECURITY.md               # Decisões e orientações de segurança
```

## Como executar

### Requisitos

- **Node.js 22.13 ou superior**.
- **npm** instalado.
- VS Code ou outro editor de sua preferência.

### Passo a passo

1. Baixe ou clone o repositório:

```bash
git clone URL-DO-REPOSITORIO
cd Projeto-Jorge-Duprat
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env.local` com a chave da API da OpenAI. Nunca envie esse arquivo ao GitHub:

```text
OPENAI_API_KEY=sua_chave_de_projeto
OPENAI_MODEL=gpt-5.6
```

4. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

5. Abra no navegador o endereço local mostrado no terminal.

### Comandos disponíveis

```bash
npm run dev                # Inicia o ambiente de desenvolvimento
npm run build              # Gera e valida a versão de produção
npm start                  # Inicia a versão de produção já compilada
npm run lint               # Analisa a qualidade do código
npm test                   # Executa o build e os testes automatizados
npm run db:generate        # Gera uma nova migração do banco
npm run validate:artifact  # Valida o artefato de hospedagem
```

> As páginas públicas podem ser desenvolvidas localmente. O DupratBot precisa de uma chave de projeto da API da OpenAI configurada somente no servidor. Os recursos persistentes de biblioteca e gestão dependem de um banco Cloudflare D1 configurado. A autenticação da gestão hospedada utiliza a identidade fornecida pela plataforma.

## Documentação complementar

- `ARQUITETURA-E-PERFIS.md` — cargos, permissões e arquitetura da gestão.
- `PRIMEIRO-ACESSO-DIRECAO.md` — configuração inicial da área administrativa.
- `BACKEND-WHATSAPP.md` — fluxo de notificações e integração com WhatsApp.
- `SECURITY.md` — segurança, autorização e proteção de dados.
