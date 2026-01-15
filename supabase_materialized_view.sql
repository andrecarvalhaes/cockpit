-- ============================================
-- VIEW MATERIALIZADA PARA HUNTER
-- Pré-calcula as métricas para acelerar consultas
-- ============================================

-- 1. Criar a view materializada que agrega os dados por operador/campanha/data
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hunter_metrics AS
SELECT
    'campanha' as tipo,
    operador,
    campanha_nome as campanha,
    DATE(data) as data_dia,
    COUNT(*) as total_ligacoes,
    SUM(COALESCE(duracao, 0)) as total_duracao,
    SUM(COALESCE(conversa, 0)) as total_conversa,
    SUM(CASE
        WHEN tabulacao IN ('Em tratamento', 'Está com o concorrente', 'Raio de Exclusividade', 'Reunião agendada', 'Sem interesse')
        THEN 1 ELSE 0
    END) as total_tabulacoes_positivas,
    SUM(CASE
        WHEN tabulacao IN ('Em tratamento', 'Reunião agendada', 'Ligação falhou')
        THEN 1 ELSE 0
    END) as total_cards_criados
FROM vm_ligacoes_campanha
WHERE data IS NOT NULL
GROUP BY operador, campanha_nome, DATE(data)

UNION ALL

SELECT
    'manual' as tipo,
    operador,
    'manual' as campanha,
    DATE(data) as data_dia,
    COUNT(*) as total_ligacoes,
    SUM(COALESCE(duracao, 0)) as total_duracao,
    SUM(COALESCE(conversa, 0)) as total_conversa,
    SUM(CASE
        WHEN tabulacao IN ('Em tratamento', 'Está com o concorrente', 'Raio de Exclusividade', 'Reunião agendada', 'Sem interesse')
        THEN 1 ELSE 0
    END) as total_tabulacoes_positivas,
    SUM(CASE
        WHEN tabulacao IN ('Em tratamento', 'Reunião agendada', 'Ligação falhou')
        THEN 1 ELSE 0
    END) as total_cards_criados
FROM vm_ligacoes_manuais
WHERE data IS NOT NULL
GROUP BY operador, DATE(data);

-- 2. Criar índices na view materializada
CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_data_dia
ON mv_hunter_metrics(data_dia DESC);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_operador
ON mv_hunter_metrics(operador);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_campanha
ON mv_hunter_metrics(campanha);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_tipo
ON mv_hunter_metrics(tipo);

-- Índice composto para queries com múltiplos filtros
CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_composite
ON mv_hunter_metrics(data_dia DESC, operador, campanha);

-- 3. Criar função para atualizar a view (executar manualmente ou agendar)
CREATE OR REPLACE FUNCTION refresh_hunter_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hunter_metrics;
END;
$$ LANGUAGE plpgsql;

-- 4. Dar permissão para a view
ALTER MATERIALIZED VIEW mv_hunter_metrics OWNER TO postgres;

-- 5. Atualizar a view pela primeira vez
REFRESH MATERIALIZED VIEW mv_hunter_metrics;

-- ============================================
-- COMO USAR
-- ============================================

-- Para atualizar manualmente a view (execute quando houver novos dados):
-- SELECT refresh_hunter_metrics();

-- Ou atualize diretamente:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hunter_metrics;

-- ============================================
-- QUERY DE TESTE
-- ============================================
-- Teste a view para ver se está funcionando:
SELECT
    data_dia,
    operador,
    campanha,
    SUM(total_ligacoes) as ligacoes,
    SUM(total_duracao + total_conversa) as tempo_total,
    SUM(total_conversa) as tempo_falada,
    SUM(total_tabulacoes_positivas) as tab_positivas,
    SUM(total_cards_criados) as cards_criados
FROM mv_hunter_metrics
WHERE data_dia >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY data_dia, operador, campanha
ORDER BY data_dia DESC
LIMIT 100;

-- ============================================
-- AGENDAMENTO AUTOMÁTICO (OPCIONAL)
-- ============================================
-- Para atualizar automaticamente a cada hora, crie um cron job no Supabase:
-- 1. Vá em Database > Cron Jobs
-- 2. Crie um novo job:
--    Nome: refresh_hunter_metrics_hourly
--    Schedule: 0 * * * * (a cada hora)
--    Command: SELECT refresh_hunter_metrics();
