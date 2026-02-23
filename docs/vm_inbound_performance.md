# View Materializada: vm_inbound_performance

## Descrição
View materializada que consolida dados do funil inbound (marketing) agregando informações de conversões RD Station, oportunidades e dados do Kommo.

## Estrutura

A view agrupa dados por **email único**, usando o ID da primeira conversão de cada email.

### Colunas

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `email` | text | Email do lead (de BD_Conversoes_RD) |
| `id` | bigint | ID da primeira conversão deste email |
| `data_criado` | date | Data da primeira conversão deste email |
| `qualificado` | boolean | `true` se telefone está preenchido E relacao_posto contém "Dono(a) ou Diretor(a)", "Gerente ou Supervisor(a)" ou "Outra relação" |
| `mql` | boolean | Marketing Qualified Lead - `true` se existe em BD_RDOportunidades (por email ou ID) |
| `data_mql` | timestamp | Data da primeira oportunidade criada (menor created_at em BD_RDOportunidades) |
| `sql` | boolean | Sales Qualified Lead - `true` se existe em aux_kommo (por email ou RD Station_ID) |
| `data_sql` | timestamp | Data de criação no Kommo (menor "Criado em") |
| `agenda` | boolean | `true` se tem "Data da Apresentação:" preenchida no Kommo |
| `data_agenda` | timestamp | Data da primeira apresentação agendada |
| `show` | boolean | `true` se tem "Valor Mensalidade" preenchido no Kommo |
| `venda` | boolean | `true` se tem "Data de Assinatura" preenchida no Kommo |
| `mrr` | numeric | Monthly Recurring Revenue - Soma de "Valor da Mensalidade" de todos os registros com "Etapa do lead" = "Venda ganha" |

## Lógica de Negócio

### Fluxo do Funil

```
Lead (BD_Conversoes_RD)
    ↓
Qualificado (telefone + cargo válido)
    ↓
MQL (BD_RDOportunidades)
    ↓
SQL (aux_kommo)
    ↓
Agenda (Data da Apresentação)
    ↓
Show (Valor Mensalidade)
    ↓
Venda (Data de Assinatura)
    ↓
MRR (Venda ganha)
```

### Critérios de Qualificação

**Qualificado**: Lead com:
- Telefone preenchido
- Cargo/relação com posto adequado:
  - "Dono(a) ou Diretor(a)"
  - "Gerente ou Supervisor(a)"
  - "Outra relação"

**MQL (Marketing Qualified Lead)**: Lead que gerou oportunidade no RD Station

**SQL (Sales Qualified Lead)**: Lead que foi importado para o Kommo e está em processo de vendas

### Matching de Registros

A view faz matching entre as tabelas usando:
- **Email**: compara com `Email comercial`, `Email pessoal` e `Outro email` do Kommo
- **ID**: compara o ID do RD Station com `RD Station_ID` do Kommo

## Uso

### Consultas Básicas

```sql
-- Ver todos os leads com suas métricas
SELECT * FROM vm_inbound_performance;

-- Taxa de conversão de leads para MQL
SELECT
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE mql) as mqls,
    ROUND(COUNT(*) FILTER (WHERE mql) * 100.0 / COUNT(*), 2) as taxa_conversao_mql
FROM vm_inbound_performance;

-- Taxa de conversão de MQL para SQL
SELECT
    COUNT(*) FILTER (WHERE mql) as mqls,
    COUNT(*) FILTER (WHERE sql) as sqls,
    ROUND(COUNT(*) FILTER (WHERE sql) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE mql), 0), 2) as taxa_conversao_sql
FROM vm_inbound_performance;

-- Leads que viraram vendas
SELECT
    email,
    data_criado,
    data_mql,
    data_sql,
    data_agenda,
    mrr
FROM vm_inbound_performance
WHERE venda = true
ORDER BY data_criado DESC;

-- MRR total por período
SELECT
    DATE_TRUNC('month', data_criado) as mes,
    COUNT(*) FILTER (WHERE venda) as vendas,
    SUM(mrr) as mrr_total
FROM vm_inbound_performance
GROUP BY DATE_TRUNC('month', data_criado)
ORDER BY mes DESC;

-- Funil de conversão completo
SELECT
    COUNT(*) as leads,
    COUNT(*) FILTER (WHERE qualificado) as qualificados,
    COUNT(*) FILTER (WHERE mql) as mqls,
    COUNT(*) FILTER (WHERE sql) as sqls,
    COUNT(*) FILTER (WHERE agenda) as agendas,
    COUNT(*) FILTER (WHERE show) as shows,
    COUNT(*) FILTER (WHERE venda) as vendas,
    SUM(mrr) as mrr_total
FROM vm_inbound_performance;

-- Tempo médio entre etapas (em dias)
SELECT
    AVG(EXTRACT(EPOCH FROM (data_mql - data_criado))/86400)::numeric(10,2) as dias_lead_to_mql,
    AVG(EXTRACT(EPOCH FROM (data_sql - data_mql))/86400)::numeric(10,2) as dias_mql_to_sql,
    AVG(EXTRACT(EPOCH FROM (data_agenda - data_sql))/86400)::numeric(10,2) as dias_sql_to_agenda
FROM vm_inbound_performance
WHERE data_mql IS NOT NULL AND data_sql IS NOT NULL AND data_agenda IS NOT NULL;
```

### Análise por Coorte

```sql
-- Análise de coorte mensal
SELECT
    DATE_TRUNC('month', data_criado) as coorte,
    COUNT(*) as leads,
    COUNT(*) FILTER (WHERE venda) as vendas,
    ROUND(COUNT(*) FILTER (WHERE venda) * 100.0 / COUNT(*), 2) as taxa_conversao,
    SUM(mrr) as mrr_total,
    ROUND(AVG(mrr) FILTER (WHERE mrr > 0), 2) as ticket_medio
FROM vm_inbound_performance
GROUP BY DATE_TRUNC('month', data_criado)
ORDER BY coorte DESC;
```

## Manutenção

### Atualizar Dados

A view materializada precisa ser atualizada manualmente para refletir novos dados:

```sql
-- Atualização normal (bloqueia leituras)
REFRESH MATERIALIZED VIEW vm_inbound_performance;

-- Atualização concorrente (não bloqueia leituras, mas é mais lenta)
REFRESH MATERIALIZED VIEW CONCURRENTLY vm_inbound_performance;
```

### Recomendações

- **Frequência de atualização**: Diária ou semanal, dependendo da necessidade
- **Horário**: Executar em horário de baixo uso (madrugada)
- **Automação**: Considerar criar um cron job ou Edge Function para atualização automática

### Exemplo de Automação (Supabase Edge Function)

```typescript
// functions/refresh-inbound-performance/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { error } = await supabase.rpc('refresh_materialized_view', {
    view_name: 'vm_inbound_performance'
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Performance

A view possui índices nas seguintes colunas para otimização de queries:
- `email`
- `id`
- `data_criado`
- `mql`
- `sql`
- `venda`

## Limitações

1. **Dados históricos**: A view só captura o estado atual dos dados. Alterações históricas não são rastreadas.
2. **Atualização manual**: Requer refresh manual para ver novos dados.
3. **Emails duplicados**: Se um mesmo email tiver múltiplas conversões, apenas a primeira é considerada.
4. **Formato de datas**: Assume que datas no Kommo estão no formato DD/MM/YYYY HH24:MI:SS.

## Troubleshooting

### View está vazia
```sql
-- Verificar se há dados nas tabelas fonte
SELECT COUNT(*) FROM "BD_Conversoes_RD" WHERE email IS NOT NULL;
SELECT COUNT(*) FROM "BD_RDOportunidades";
SELECT COUNT(*) FROM aux_kommo;
```

### Performance lenta
```sql
-- Verificar uso dos índices
EXPLAIN ANALYZE SELECT * FROM vm_inbound_performance WHERE email = 'teste@example.com';

-- Recriar índices se necessário
REINDEX INDEX idx_vm_inbound_performance_email;
```

### Erros de formato de data
As conversões de data incluem validação de formato. Se houver datas inválidas no Kommo, elas serão ignoradas (NULL).
