# Segurança

## Princípios

- Autenticação não substitui autorização: o servidor deve validar o perfil em cada ação protegida.
- Coletar somente dados necessários e evitar exposição de dados de estudantes.
- Nunca manter senhas próprias em texto simples; usar o provedor de identidade autorizado.
- Não registrar tokens, chaves, conteúdo de mensagens ou telefones completos em logs.
- Validar entradas no servidor e limitar tentativas de reserva por IP/telefone.
- Registrar ações administrativas importantes em trilha de auditoria.
- Manter backups, plano de restauração e processo para revogar acessos.

## Antes de usar com dados reais

- Implantar allowlist institucional e perfis no banco.
- Adicionar proteção contra abuso e limitação de requisições.
- Definir prazos de retenção e rotina de exclusão de dados.
- Revisar LGPD, consentimento e aviso de privacidade com a direção.
- Testar recuperação, acessibilidade e permissões com contas de cada perfil.

## Relato responsável

Falhas não devem ser publicadas em avisos ou issues públicas. Comunique a direção ou o administrador técnico pelo canal institucional.
