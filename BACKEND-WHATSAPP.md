# Integração com WhatsApp

O portal já registra notificações pendentes, mas não envia mensagens externas sem a configuração oficial da escola.

## Eventos previstos

- `reservation_ready`: exemplar separado e prazo para retirada.
- `queue_joined`: confirmação e posição inicial na fila.
- `queue_turn`: chegou a vez da pessoa.
- `due_soon`: lembrete de devolução.
- `overdue`: aviso de atraso.
- `reservation_cancelled`: cancelamento ou prazo encerrado.

## Requisitos para produção

1. Conta oficial no WhatsApp Business Platform ou provedor homologado.
2. Modelos de mensagem aprovados e linguagem institucional.
3. Segredo da API armazenado somente no ambiente de hospedagem.
4. Worker protegido que consome registros `pending` e atualiza para `sent` ou `failed`.
5. Retentativas com limite, idempotência e registro do identificador do provedor.
6. Opção clara para interromper avisos e política de retenção dos telefones.

Nenhuma chave, token ou telefone real deve ser salvo no repositório. A escola deve revisar consentimento, finalidade e retenção antes de ativar o envio.
