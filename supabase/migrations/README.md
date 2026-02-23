# Como Executar a Migration: vm_inbound_performance

## ⚠️ IMPORTANTE: Executar em Ordem

Para evitar problemas de timeout, execute as migrations nesta ordem:

1. **Primeiro**: `00_create_indexes_for_inbound_performance.sql` (cria índices nas tabelas fonte)
2. **Depois**: `create_vm_inbound_performance_optimized.sql` (cria a view materializada otimizada)

---

## Passo 1: Criar Índices nas Tabelas Fonte

### Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: `azmtxhjtqodtaeoshrye`
3. Navegue até **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `00_create_indexes_for_inbound_performance.sql`
6. Cole no editor SQL
7. Clique em **Run** ou pressione `Ctrl + Enter`
8. ⏱️ **Aguarde**: Este processo pode levar alguns minutos dependendo do tamanho das tabelas

**Nota**: Se você receber timeout, execute os índices em grupos menores (veja seção "Troubleshooting" abaixo).

---

## Passo 2: Criar a View Materializada

### Via Supabase Dashboard (Recomendado)

1. Ainda no **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `create_vm_inbound_performance_optimized.sql`
4. Cole no editor SQL
5. Clique em **Run** ou pressione `Ctrl + Enter`
6. ⏱️ **Aguarde**: Este processo pode levar alguns minutos na primeira execução

## Opção 2: Via Supabase CLI

```bash
# Certifique-se de estar logado no Supabase CLI
supabase login

# Link seu projeto (se ainda não linkado)
supabase link --project-ref azmtxhjtqodtaeoshrye

# Execute a migration
supabase db push
```

## Opção 3: Via psql (PostgreSQL CLI)

```bash
# Conecte ao seu banco de dados
psql "postgresql://postgres:[YOUR-PASSWORD]@db.azmtxhjtqodtaeoshrye.supabase.co:5432/postgres"

# Execute o arquivo SQL
\i supabase/migrations/create_vm_inbound_performance.sql
```

## Verificação

Após executar a migration, verifique se a view foi criada corretamente:

```sql
-- Verificar se a view existe
SELECT * FROM pg_matviews WHERE matviewname = 'vm_inbound_performance';

-- Testar a view
SELECT COUNT(*) FROM vm_inbound_performance;

-- Ver alguns registros
SELECT * FROM vm_inbound_performance LIMIT 10;
```

## Atualização dos Dados

A view materializada precisa ser atualizada manualmente:

```sql
-- Atualização normal (bloqueia leituras durante o refresh)
REFRESH MATERIALIZED VIEW vm_inbound_performance;

-- Atualização concorrente (não bloqueia leituras, mas requer índices únicos)
REFRESH MATERIALIZED VIEW CONCURRENTLY vm_inbound_performance;
```

### Automatizar Atualização

Você pode criar uma função e um cron job para atualizar automaticamente:

```sql
-- 1. Criar função para refresh
CREATE OR REPLACE FUNCTION refresh_inbound_performance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW vm_inbound_performance;
END;
$$ LANGUAGE plpgsql;

-- 2. Adicionar permissões (se necessário)
GRANT EXECUTE ON FUNCTION refresh_inbound_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_inbound_performance() TO service_role;

-- 3. Usar pg_cron para agendar atualização diária às 3h da manhã
SELECT cron.schedule(
  'refresh-inbound-performance',
  '0 3 * * *',
  'SELECT refresh_inbound_performance();'
);
```

## Troubleshooting

### ⏱️ Erro: "SQL query ran into an upstream timeout"

Este erro ocorre quando a query é muito pesada. Soluções:

#### Solução 1: Criar Índices em Etapas Menores

Se a criação de índices der timeout, execute-os em grupos menores:

```sql
-- Grupo 1: Índices em BD_Conversoes_RD
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_email
ON "BD_Conversoes_RD"(email)
WHERE email IS NOT NULL AND email != '';

CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_email_created_at
ON "BD_Conversoes_RD"(email, created_at)
WHERE email IS NOT NULL;

ANALYZE "BD_Conversoes_RD";
```

```sql
-- Grupo 2: Índices em BD_RDOportunidades
CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_email
ON "BD_RDOportunidades"(email)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_id
ON "BD_RDOportunidades"(id);

ANALYZE "BD_RDOportunidades";
```

```sql
-- Grupo 3: Índices principais em aux_kommo (emails)
CREATE INDEX IF NOT EXISTS idx_kommo_email_comercial
ON aux_kommo("Email comercial")
WHERE "Email comercial" IS NOT NULL AND "Email comercial" != '';

CREATE INDEX IF NOT EXISTS idx_kommo_email_pessoal
ON aux_kommo("Email pessoal")
WHERE "Email pessoal" IS NOT NULL AND "Email pessoal" != '';

CREATE INDEX IF NOT EXISTS idx_kommo_outro_email
ON aux_kommo("Outro email")
WHERE "Outro email" IS NOT NULL AND "Outro email" != '';

CREATE INDEX IF NOT EXISTS idx_kommo_rd_station_id
ON aux_kommo("RD Station_ID")
WHERE "RD Station_ID" IS NOT NULL AND "RD Station_ID" != '';
```

```sql
-- Grupo 4: Índices secundários em aux_kommo
CREATE INDEX IF NOT EXISTS idx_kommo_etapa_do_lead
ON aux_kommo("Etapa do lead")
WHERE "Etapa do lead" = 'Venda ganha';

ANALYZE aux_kommo;
```

#### Solução 2: Usar CONCURRENTLY (não bloqueia tabela)

```sql
-- Criar índices de forma concorrente (mais lento, mas não bloqueia)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bd_conversoes_rd_email
ON "BD_Conversoes_RD"(email)
WHERE email IS NOT NULL AND email != '';
```

#### Solução 3: Aumentar Timeout do Cliente

Se estiver usando psql ou código:

```bash
# Via psql
psql -c "SET statement_timeout = '10min';" -c "\i create_vm_inbound_performance_optimized.sql"
```

```typescript
// Via JavaScript/TypeScript
await supabase.rpc('exec_sql', {
  sql: 'SET statement_timeout = \'10min\';'
});
```

#### Solução 4: Executar em Horário de Baixo Uso

Execute as migrations durante a madrugada ou fim de semana quando há menos carga no banco.

### Erro: "permission denied"

Se você receber erro de permissão, certifique-se de estar usando o Supabase Dashboard como admin ou use o service_role_key:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key
)
```

### Erro: "relation does not exist"

Verifique se as tabelas fonte existem:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('BD_Conversoes_RD', 'BD_RDOportunidades', 'aux_kommo');
```

### View está vazia

```sql
-- Verificar se há dados nas tabelas fonte
SELECT COUNT(*) FROM "BD_Conversoes_RD" WHERE email IS NOT NULL;
SELECT COUNT(*) FROM "BD_RDOportunidades";
SELECT COUNT(*) FROM aux_kommo;
```

### Performance lenta

Se a view estiver demorando muito para carregar:

```sql
-- Verificar tamanho da view
SELECT pg_size_pretty(pg_total_relation_size('vm_inbound_performance'));

-- Analisar plano de execução
EXPLAIN ANALYZE SELECT * FROM vm_inbound_performance WHERE email = 'teste@example.com';

-- Recriar índices
REINDEX INDEX idx_vm_inbound_performance_email;
```

## Próximos Passos

Após executar a migration:

1. ✅ Execute a migration SQL
2. ✅ Verifique se a view foi criada
3. ✅ Teste alguns queries básicos
4. ✅ Configure atualização automática (opcional)
5. ✅ Integre com o frontend usando o hook `useInboundPerformance`
6. ✅ Adicione o componente `InboundFunnelChart` na página de Marketing

## Integração com o Frontend

Para usar a view no frontend React:

```typescript
import { useInboundPerformance } from '../hooks/useInboundPerformance';
import { InboundFunnelChart } from '../components/marketing/InboundFunnelChart';

function MarketingPage() {
  return (
    <div>
      <InboundFunnelChart
        startDate="2024-01-01"
        endDate="2024-12-31"
      />
    </div>
  );
}
```

## Links Úteis

- [Documentação: Materialized Views no PostgreSQL](https://www.postgresql.org/docs/current/rules-materializedviews.html)
- [Supabase: Working with SQL](https://supabase.com/docs/guides/database/postgres/sql)
- [Hook: useInboundPerformance.ts](../src/hooks/useInboundPerformance.ts)
- [Componente: InboundFunnelChart.tsx](../src/components/marketing/InboundFunnelChart.tsx)
- [Documentação completa da view](../docs/vm_inbound_performance.md)
