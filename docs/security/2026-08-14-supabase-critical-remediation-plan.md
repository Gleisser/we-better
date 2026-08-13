# Plano de ação — riscos críticos do Supabase

**Projeto:** We Better
**Supabase:** `gvfyrrkfiktuyfsvnavd`
**Data da análise:** 2026-08-14
**Estado:** contenções críticas e Storage privado aplicados; rotação de paths concluída e originais em quarentena
**Severidade:** P0 / crítica

## Status de implementação — 2026-08-14

- **Frente A / RLS:** migration implementada, revisada por agente independente e aplicada.
- **Frente B / RPCs:** migration implementada, revisada por agente independente e aplicada.
- **Frentes C/D/E / Storage:** backend e frontend publicados em produção; segredo dedicado configurado; bucket privado e smoke test autenticado concluído.
- **Rotação de paths:** cinco paths referenciados foram copiados, verificados por tamanho e SHA-256 e atualizados para `private-v1`; os cinco originais permanecem privados em quarentena e não foram apagados.
- **Objeto não referenciado:** o sexto objeto foi classificado como candidato órfão, sem referência atual e sem hash correspondente aos objetos rotacionados. O proprietário ainda existe e possui Dream Boards, portanto o objeto permanece privado em quarentena até aprovação de retenção/remoção.
- **Validação de produção:** upload autenticado, emissão via `/api`, transformação WebP e cache privado retornaram 200; leitura pública direta retornou 400. Os dados temporários do smoke test foram removidos.

## 1. Objetivo

Conter e corrigir as exposições críticas confirmadas no Supabase, preservar evidências suficientes para uma análise de incidente e impedir que o mesmo padrão seja reintroduzido.

Este documento cobre três frentes:

1. Quatro tabelas de canais com RLS desabilitado e privilégios completos para clientes públicos.
2. Sete funções `SECURITY DEFINER` executáveis por `PUBLIC`, `anon` e `authenticated`.
3. Imagens pessoais do Dream Board publicadas em bucket público, URLs permanentes e assinaturas sem expiração.

Também inclui a rotação do `credential_secret` existente em `channel_accounts`, pois ele deve ser tratado como potencialmente exposto.

## 2. Evidências confirmadas

As evidências abaixo foram obtidas por consultas somente de leitura via MCP do Supabase e revisão dos três repositórios. Nenhum segredo foi consultado ou copiado.

### 2.1 Tabelas de canais

| Tabela                     |          RLS | Policies | Acesso de `anon` e `authenticated` | Linhas em 2026-08-14 |
| -------------------------- | -----------: | -------: | ---------------------------------- | -------------------: |
| `public.channel_accounts`  | desabilitado |        0 | CRUD completo                      |                    1 |
| `public.channel_jobs`      | desabilitado |        0 | CRUD completo                      |                    0 |
| `public.channel_messages`  | desabilitado |        0 | CRUD completo                      |                    0 |
| `public.connector_devices` | desabilitado |        0 | CRUD completo                      |                    0 |

Os dois papéis de cliente possuem `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` e `TRIGGER`. O registro de `channel_accounts` possui um `credential_secret` não vazio, criado em 2026-05-06.

Não foram encontradas referências a essas quatro tabelas em `we-better`, `user-service` ou `webetter-backend`. Isso sugere criação manual ou consumo por integração externa, mas essa origem precisa ser confirmada antes da contenção em produção.

### 2.2 Funções privilegiadas

As funções abaixo pertencem a `postgres`, usam `SECURITY DEFINER` e podem ser executadas por `PUBLIC`, `anon`, `authenticated` e `service_role`:

- `cleanup_old_avatars(uuid, integer)`
- `generate_backup_codes(uuid, integer, boolean)`
- `handle_new_user()`
- `insert_backup_code(uuid, text, text, integer, timestamptz)`
- `log_milestone_event()`
- `validate_avatar_path(text, uuid)`
- `validate_backup_code(uuid, text, text, text)`

As rotinas de backup codes aceitam um UUID arbitrário controlado pelo chamador. `insert_backup_code` pode preparar um código escolhido pelo atacante para um usuário válido e `validate_backup_code` pode testar e consumir códigos. A tabela `user_backup_codes` está vazia atualmente, reduzindo o impacto imediato, mas não a capacidade exposta.

Correções importantes em relação à primeira triagem:

- `cleanup_old_avatars` usa `storage.foldername(name)[0]`. Arrays PostgreSQL começam em 1, então a função é atualmente um no-op. Ela não consegue apagar os avatares existentes hoje, mas se torna explorável assim que o índice for corrigido sem antes remover os grants públicos.
- `generate_backup_codes` retorna códigos `NULL` e, quando solicitado, apenas invalida códigos ativos. O comportamento atual pode causar negação de recuperação quando houver códigos.
- `handle_new_user` e `log_milestone_event` são trigger functions. Revogar sua execução dos papéis de cliente não impede que os triggers continuem sendo disparados pelo banco.

### 2.3 Storage do Dream Board

- O bucket `dream-board-images` está configurado como público.
- Existem 6 objetos, totalizando aproximadamente 10,4 MB.
- As policies de `storage.objects` restringem operações autenticadas por pasta, mas um bucket público ignora RLS para download público.
- O frontend usa `getPublicUrl()` e persiste a URL pública em `vision_board_entries.content`.
- O endpoint de preview usa `SUPABASE_SERVICE_ROLE_KEY` como segredo HMAC.
- A assinatura cobre apenas `bucket:path:variant`, sem usuário, expiração ou versão de chave.
- As respostas usam cache público de um ano com `immutable`.

Arquivos relacionados:

- `../user-service/supabase/migrations/20260309_create_dream_board_images_bucket.sql`
- `src/features/dream-board/utils/imageStorage.ts`
- `src/features/dream-board/utils/imageVariants.ts`
- `../user-service/src/lib/dreamBoardPreviews.ts`
- `../user-service/src/app/api/dream-board/previews/route.ts`

## 3. Organização das frentes

| Frente                             | Agente responsável          | Responsabilidade                                                          | Dependências                   |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| A — RLS e tabelas de canais        | **RLS Channels Agent**      | ACL, RLS, inventário de consumidores e smoke test do conector             | Owner da integração de canais  |
| B — RPCs privilegiadas e recovery  | **RPC Security Agent**      | Revogação de `EXECUTE`, default privileges e redesign de backup codes     | Backend/Auth Agent             |
| C — Storage e resposta a incidente | **Storage Incident Agent**  | Bucket privado, URLs efêmeras, rotação de segredos e análise de impacto   | Frontend, Backend, Integrações |
| D — Implementação backend          | **Backend/Auth Agent**      | Endpoints autenticados, uso mínimo de `service_role`, recovery e previews | Frentes B e C                  |
| E — Implementação frontend         | **Frontend Agent**          | Remover URLs públicas e renovar URLs efêmeras                             | Backend/Auth Agent             |
| F — Verificação independente       | **QA/Security Agent**       | Testes negativos, cross-user, concorrência e regressão                    | Todas as frentes               |
| G — Operação pós-correção          | **SRE/Observability Agent** | Logs, alertas e acompanhamento de 14 dias                                 | QA/Security Agent              |

Os agentes A, B e C já concluíram a análise especializada usada na elaboração deste documento. Nenhum deles alterou o banco ou os arquivos do projeto.

## 4. Ordem obrigatória de execução

```text
Preservar evidências
        ↓
Identificar consumidores externos
        ↓
Conter tabelas e RPCs
        ↓
Rotacionar credential_secret
        ↓
Privatizar Storage + publicar fluxo privado
        ↓
Migrar URLs e paths antigos
        ↓
Executar testes independentes
        ↓
Monitorar e encerrar incidente
```

As contenções de banco devem ser preparadas em migrations versionadas no `user-service`, testadas em branch/staging e aplicadas por migration. Não aplicar SQL avulso sem registrar a mesma mudança no repositório.

## 5. P0 — Contenção imediata (0–4 horas)

### 5.1 Preservação e inventário

**Responsáveis:** Storage Incident Agent + SRE/Observability Agent
**Bloqueia:** todas as alterações remotas

- [ ] Registrar o horário de início do incidente e os responsáveis.
- [ ] Exportar os logs disponíveis de PostgREST, Storage, Auth e do provedor do conector.
- [ ] Preservar metadados atuais de ACL, RLS, policies, funções, contagens e timestamps.
- [ ] Não registrar `credential_secret`, hashes, tokens, paths pessoais ou URLs assinadas.
- [ ] Verificar Edge Functions, Realtime, webhooks, workers, integrações externas e conexões diretas.
- [ ] Confirmar que qualquer consumidor legítimo usa `service_role` ou identidade DB exclusivamente backend.
- [ ] Confirmar backup/PITR antes das migrations.

### 5.2 Fechar as quatro tabelas de canais

**Responsável:** RLS Channels Agent
**Decisão:** backend-only, sem policies para `anon` ou `authenticated`

**Status:** aplicado e revisado; validação final do Advisor permanece no gate de encerramento.

Migration proposta:

```sql
BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

REVOKE ALL PRIVILEGES ON TABLE
  public.connector_devices,
  public.channel_jobs,
  public.channel_accounts,
  public.channel_messages
FROM PUBLIC, anon, authenticated;

ALTER TABLE public.connector_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

COMMIT;
```

Regras:

- Não criar policy `USING (true)` ou `FOR ALL`.
- Não revogar o acesso de `service_role` nesta contenção.
- Não usar `FORCE ROW LEVEL SECURITY`, pois o backend autorizado precisa continuar operando.
- Se o lock exceder o timeout, investigar transações e repetir em nova janela; não aplicar parcialmente.

### 5.3 Revogar execução das funções privilegiadas

**Responsável:** RPC Security Agent

**Status:** aplicado e revisado; redesign estrutural de recovery continua como P1.

Migration proposta, usando as assinaturas exatas confirmadas no catálogo remoto:

```sql
BEGIN;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_avatars(uuid, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_backup_codes(uuid, integer, boolean)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_backup_code(uuid, text, text, integer, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_milestone_event()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_avatar_path(text, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_backup_code(uuid, text, text, text)
  FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM authenticated;

COMMIT;
```

- [ ] Congelar o recurso de backup codes até o redesign P1.
- [ ] Manter `service_role` temporariamente apenas para descobrir consumidores legítimos.
- [ ] Não alterar os defaults de `supabase_admin` nesta hotfix sem auditoria específica da plataforma.

### 5.4 Rotacionar o segredo do canal

**Responsáveis:** Storage Incident Agent + owner da integração

- [ ] Identificar o provedor e o escopo do `credential_secret` sem copiá-lo.
- [ ] Emitir nova credencial.
- [ ] Atualizar primeiro o worker/integrador e validar o fluxo.
- [ ] Revogar a credencial antiga.
- [ ] Confirmar no provedor que a credencial antiga é recusada.
- [ ] Revisar atividade desde 2026-05-06 conforme a retenção do provedor.
- [ ] Acionar responsável jurídico/privacidade se houver evidência de acesso indevido.

Nunca reativar a credencial antiga como rollback. Se a nova falhar, corrigir sua configuração ou emitir uma terceira.

### 5.5 Conter o bucket público

**Responsáveis:** Storage Incident Agent + Backend/Auth Agent

Esta etapa deve ser coordenada com o deploy do novo fluxo privado. Se a interface atual depender das URLs públicas, aceitar degradação temporária ou servir imagens por proxy autenticado; não manter a exposição para preservar disponibilidade.

**Status:** concluído em produção na ordem obrigatória: segredo/versão configurados, user-service e frontend publicados, smoke test aprovado, migration aplicada, bloqueio público confirmado e backfill executado após dry-run limpo.

Migration:

```sql
UPDATE storage.buckets
SET public = false
WHERE id = 'dream-board-images';
```

- [x] Criar `DREAM_BOARD_PREVIEW_SIGNING_SECRET` dedicado com pelo menos 256 bits.
- [x] Parar de aceitar assinaturas antigas baseadas na service-role.
- [ ] Não rotacionar a service-role somente porque foi usada como HMAC; rotacioná-la apenas se houver outra evidência de exposição e após inventariar dependências.
- [x] Durante a transição, responder previews com cache privado e TTL limitado.

## 6. P1 — Correção estrutural (4–24 horas)

### 6.1 Redesign de backup codes

**Responsáveis:** RPC Security Agent + Backend/Auth Agent

- [ ] Remover o fluxo RPC direto de geração, inserção e validação.
- [ ] Criar uma única operação server-only ou Edge Function autenticada.
- [ ] Exigir reautenticação recente e nível de garantia apropriado antes de gerar códigos.
- [ ] Derivar o usuário da sessão verificada; nunca aceitar UUID alvo fornecido pelo cliente.
- [ ] Gerar códigos com CSPRNG, tamanho e contagem limitados.
- [ ] Normalizar o código de forma idêntica antes de gerar e comparar o hash.
- [ ] Armazenar apenas hash e hint derivado; retornar plaintext uma única vez.
- [ ] Consumir o código atomicamente para garantir exatamente um sucesso sob concorrência.
- [ ] Implementar rate limit por conta, IP e dispositivo, resposta genérica anti-enumeração, auditoria e alertas.
- [ ] Revogar acesso direto de `anon` e `authenticated` a `user_backup_codes` e remover policies de cliente.
- [ ] Revisar `user_security_settings`: alterações de 2FA/recovery devem passar por backend com step-up authentication.

### 6.2 Corrigir limpeza e validação de avatares

**Responsáveis:** RPC Security Agent + Storage Incident Agent

- [ ] Não corrigir `[0]` para `[1]` antes de os grants públicos terem sido removidos.
- [ ] Remover `validate_avatar_path` ou convertê-la para `SECURITY INVOKER`, sem UUID arbitrário.
- [ ] Derivar ownership de `auth.uid()`/JWT verificado.
- [ ] Remover objetos pelo Storage API `.remove()`, não por `DELETE` direto em `storage.objects`.
- [ ] Limitar `keep_count` e rejeitar valores negativos, zero e excessivos.
- [ ] Reconciliar a convenção de paths do frontend com as policies reais do bucket `avatars`.

### 6.3 Novo contrato de imagens do Dream Board

**Backend/Auth Agent**

- [x] Persistir apenas `storageBucket`, `storagePath`, MIME, tamanho, dimensões e placeholder.
- [x] Remover/sanitizar `src` público ou efêmero no servidor em POST/PUT.
- [x] Aceitar somente o bucket `dream-board-images` e paths pertencentes ao usuário autenticado.
- [ ] Preferir URLs assinadas nativas do Supabase Storage com TTL de 5–15 minutos.
- [x] Se mantido o proxy, assinar `userId + bucket + path + variant + expiresAt + keyVersion`.
- [x] Validar expiração, referência persistida e ownership antes do download.
- [x] Usar cache privado com duração menor ou igual ao TTL da assinatura.

**Frontend Agent**

- [x] Remover todos os usos de `getPublicUrl()` para Dream Board.
- [x] Alterar o resultado do upload para referência de Storage, não `publicUrl`.
- [x] Usar `blob:` apenas como preview local transitório e revogá-lo ao sair.
- [x] Renderizar URLs efêmeras emitidas pela API.
- [x] Nunca reenviar ou persistir URLs efêmeras.
- [x] Renovar a URL ao receber 401/403, sem perder o estado do board.
- [x] Não usar URL pública antiga como fallback quando houver `storageBucket/storagePath`.

### 6.4 Migrar referências e invalidar URLs antigas

**Responsáveis:** Storage Incident Agent + Backend/Auth Agent

- [x] Inventariar referências em todas as versões de `vision_board_entries.content`.
- [x] Identificar URLs contendo `/object/public/dream-board-images` ou `/render/image/public/`.
- [x] Identificar objetos órfãos e referências sem objeto.
- [x] Executar backfill idempotente que remova `src` público quando houver referência válida.
- [x] Preservar URLs externas legítimas que não pertençam ao bucket.
- [x] Copiar objetos para novos paths privados aleatórios e verificáveis.
- [x] Atualizar todas as referências sem apagar o path antigo.
- [x] Verificar tamanho e SHA-256 antes de atualizar a referência.
- [x] Manter objetos antigos em quarentena privada por período curto.
- [ ] Eliminar órfãos apenas após reconciliação completa.

Runbook implementado e executado: `user-service/scripts/backfill-private-dream-board-storage.mjs`. O dry-run encontrou 5 objetos referenciados e 0 referências inválidas; a aplicação copiou e verificou os 5 objetos, atualizou 1 entrada e manteve os originais privados. Um dry-run posterior encontrou 0 paths pendentes. O sexto objeto foi classificado como candidato órfão e permanece em quarentena.

A troca de path é necessária porque respostas antigas foram marcadas como públicas e cacheáveis por um ano. Somente alterar `public=false` pode não invalidar cópias já armazenadas em caches intermediários.

### 6.5 Isolar infraestrutura interna

**Responsáveis:** RLS Channels Agent + Backend/Auth Agent

- [ ] Planejar migration separada das quatro tabelas para schema privado não exposto, como `internal`.
- [ ] Substituir `credential_secret` em texto legível por referência a Vault/secret manager ou criptografia envelope.
- [ ] Criar identidade dedicada de mínimo privilégio para o worker.
- [ ] Redigir segredos em logs, exceptions, traces e ferramentas de observabilidade.
- [ ] Documentar owner e periodicidade de rotação de cada credencial.

## 7. P2 — Verificação independente (24–48 horas)

**Responsável:** QA/Security Agent

### 7.1 Banco e Data API

- [ ] As quatro tabelas têm `relrowsecurity = true` e zero policies de cliente.
- [ ] `anon` e `authenticated` não possuem nenhum privilégio nas quatro tabelas.
- [ ] `GET /rest/v1/<tabela>` com anon e JWT comum falha com permissão, em vez de apenas retornar `[]`.
- [ ] INSERT, UPDATE e DELETE com cliente público falham em staging.
- [ ] `service_role` consegue executar `count(*)` e o smoke test real do conector.
- [ ] Nenhuma view, GraphQL, Realtime ou RPC reexpõe os dados.
- [ ] Os quatro erros críticos desaparecem do Security Advisor.

### 7.2 Funções

- [ ] `has_function_privilege` é falso para `PUBLIC`, `anon` e `authenticated` nas sete funções.
- [ ] Chamadas `/rest/v1/rpc/...` com anon e usuário comum retornam permission denied.
- [ ] Os triggers de criação de perfil e eventos de milestone continuam funcionando.
- [ ] A criação de uma função descartável em uma branch prova que os novos default privileges não concedem execução pública.
- [ ] Dois validadores concorrentes para o mesmo backup code produzem exatamente um sucesso.
- [ ] Código incorreto, expirado ou usado não altera linhas nem permite enumeração.
- [ ] Usuário A não gera, insere, valida ou limpa recursos do usuário B.

### 7.3 Storage

- [ ] `anon` não baixa bytes por `/object/public/dream-board-images/...`.
- [ ] Usuário A não lê, sobrescreve ou remove objeto do usuário B.
- [ ] Assinatura ausente, alterada, antiga ou expirada retorna 403.
- [ ] Alterar usuário, bucket, path, variante ou expiração invalida a assinatura.
- [ ] Nenhuma resposta de mídia pessoal possui cache público superior ao TTL.
- [ ] Nenhum JSON persistido contém URL pública ou efêmera do bucket.
- [ ] Todas as referências migradas apontam para objeto existente e validado.
- [ ] Upload, edição, histórico, overview, exclusão de item e exclusão de conta continuam funcionando.

### 7.4 Segredos

- [ ] A credencial antiga é recusada pelo provedor.
- [ ] A nova credencial completa o fluxo esperado com privilégio mínimo.
- [ ] Busca no bundle e nos repositórios não encontra a nova credencial ou a service-role.
- [ ] Não houve inclusão de segredos em migrations, tickets, logs ou neste documento.

## 8. Rollback seguro

O rollback não deve restaurar o estado vulnerável.

- **Tabelas:** corrigir o consumidor para usar identidade backend ou conceder privilégio mínimo a uma role dedicada. Nunca devolver grants a `anon`, `authenticated` ou `PUBLIC`.
- **RPCs:** se um consumidor legítimo quebrar, conceder `EXECUTE` somente ao `service_role` ou publicar wrapper autenticado com ownership check. Nunca reabrir as funções antigas aos papéis de cliente.
- **Bucket:** manter privado. Em caso de falha de UI, servir temporariamente por proxy autenticado; nunca retornar `public=true`.
- **Assinaturas:** manter a chave dedicada nova. Não voltar a aceitar assinaturas eternas baseadas na service-role.
- **Objetos migrados:** durante a quarentena, reverter apenas as referências de banco para paths ainda privados. Nunca republicar os paths antigos.
- **Credential secret:** manter o segredo antigo revogado. Corrigir o novo ou emitir outro.

Se a migration de RLS atingir `lock_timeout`, a transação deve abortar integralmente. Isso é falha segura e não exige rollback de dados.

## 9. Monitoramento pós-correção

**Responsável:** SRE/Observability Agent
**Período mínimo:** 14 dias

- [ ] Alertar por tentativas de acesso de clientes às quatro tabelas.
- [ ] Alertar se qualquer bucket sensível voltar a `public=true`.
- [ ] Monitorar 401/403/404 no fluxo de preview e renovação de URL.
- [ ] Monitorar falhas do conector após rotação.
- [ ] Alertar por emissão excessiva de URLs assinadas por usuário ou IP.
- [ ] Rodar Security Advisor diariamente na primeira semana e semanalmente depois.
- [ ] Guardar somente métricas e IDs de request; não registrar URLs completas, assinaturas, paths ou segredos.
- [ ] Documentar a conclusão da avaliação jurídica/privacidade.

## 10. Critérios de encerramento

O incidente poderá ser encerrado somente quando todos os itens forem verdadeiros:

- [x] Os quatro erros `RLS Disabled in Public` desapareceram.
- [x] As quatro tabelas estão backend-only e indisponíveis para `anon` e `authenticated`.
- [x] Nenhuma das sete funções privilegiadas pode ser executada por papéis de cliente ou `PUBLIC`.
- [ ] O fluxo de recovery foi substituído por implementação autenticada, atômica e com rate limit.
- [x] `dream-board-images` está privado e não há `getPublicUrl()` no fluxo.
- [x] Não existem URLs públicas ou efêmeras persistidas no Dream Board.
- [x] URLs públicas diretas não entregam bytes em verificação externa.
- [ ] A credencial de canal antiga foi revogada e auditada.
- [ ] Testes negativos, cross-user, concorrência e regressão passaram.
- [ ] O fluxo de backend e conector funciona com identidade de mínimo privilégio.
- [ ] Não houve regressão sustentada durante 48 horas.
- [ ] O monitoramento de 14 dias foi configurado.
- [ ] Migrations, evidências e aprovações foram versionadas sem segredos.

## 11. Entregáveis por agente

### RLS Channels Agent

- Migration de ACL/RLS.
- Inventário dos consumidores externos.
- Smoke test do worker/conector.
- Evidência de ausência dos quatro erros no Advisor.

### RPC Security Agent

- Migration de `REVOKE EXECUTE` e default privileges.
- Especificação do novo fluxo de recovery.
- Testes de concorrência e autorização das RPCs.
- Revisão das políticas de `user_backup_codes` e `user_security_settings`.

### Storage Incident Agent

- Evidências preservadas e timeline do incidente.
- Bucket privado e estratégia de migração de paths.
- Rotação do `credential_secret` coordenada com o provedor.
- Avaliação de impacto e decisão de privacidade documentada.

### Backend/Auth Agent

- API de URL assinada/proxy autenticado.
- Sanitização server-side de URLs persistidas.
- Novo fluxo de recovery e uso restrito de `service_role`.

### Frontend Agent

- Remoção de `getPublicUrl()`.
- Suporte a URLs efêmeras e renovação.
- Regressão completa do Dream Board.

### QA/Security Agent

- Matriz de testes e evidências de execução.
- Reexecução independente do Advisor.
- Aprovação de segurança para produção.

### SRE/Observability Agent

- Dashboards e alertas sem conteúdo sensível.
- Relatório de 48 horas e acompanhamento de 14 dias.

## 12. Aprovações

| Etapa                     | Responsável        | Aprovação | Data |
| ------------------------- | ------------------ | --------- | ---- |
| Contenção de tabelas/RPCs | Security/DB owner  | pendente  | —    |
| Rotação de credencial     | Integration owner  | pendente  | —    |
| Mudança de Storage        | Product + Security | pendente  | —    |
| Deploy backend/frontend   | Engineering owner  | pendente  | —    |
| Encerramento do incidente | Security + Privacy | pendente  | —    |
