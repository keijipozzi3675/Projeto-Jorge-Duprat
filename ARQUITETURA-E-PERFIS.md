# Arquitetura e perfis

## Superfícies do portal

### Pública

Não exige login. Inclui apresentação da escola, avisos, equipe, contatos, catálogo e solicitação de reserva. O usuário fornece apenas nome, turma e WhatsApp ao reservar.

### Gestão

Exige autenticação. A autorização final deve relacionar o e-mail institucional a um perfil cadastrado.

## Perfis planejados

| Perfil | Responsabilidades |
| --- | --- |
| Direção | Usuários e perfis, publicações, relatórios e configurações gerais. |
| Secretaria | Matrículas, contatos, documentos, avisos e atendimento. |
| Sala de leitura | Acervo, exemplares, empréstimos, devoluções, reservas e fila. |
| Professor | Consulta de turmas, projetos e comunicados pedagógicos permitidos. |
| Administrador técnico | Configuração do sistema, integrações, auditoria e recuperação. |

O princípio é negar por padrão: cada perfil acessa apenas o necessário. Permissões devem ser verificadas no servidor, nunca somente escondendo botões no navegador.

## Fluxo da biblioteca

1. O estudante escolhe um livro e informa os dados mínimos.
2. A API verifica duplicidade pelo livro e telefone.
3. Se houver exemplar livre, a reserva fica pronta para retirada por dois dias úteis.
4. Se não houver, a solicitação recebe posição na fila.
5. A secretaria vê a atividade no painel e uma notificação é preparada.
6. Na devolução, a primeira pessoa da fila recebe prioridade e prazo de retirada.

## Dados

As tabelas atuais são `books`, `reservations` e `notifications`. A evolução recomendada inclui `staff_users`, `roles`, `permissions`, `audit_events`, `book_copies` e `school_notices`.
