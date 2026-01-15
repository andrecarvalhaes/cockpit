-- ============================================
-- ATUALIZAÇÃO DA VIEW MATERIALIZADA
-- Ligações manuais com tabulações Conectado somam como positivas
-- ============================================

-- 1. Dropar a view existente
DROP MATERIALIZED VIEW IF EXISTS mv_hunter_metrics;

-- 2. Recriar a view com a nova regra
CREATE MATERIALIZED VIEW mv_hunter_metrics AS
SELECT
    'campanha' as tipo,
    operador,
    campanha_nome as campanha,
    DATE(data) as data_dia,
    COUNT(*) as total_ligacoes,
    SUM(COALESCE(duracao, 0)) as total_duracao,
    SUM(COALESCE(conversa, 0)) as total_conversa,
    -- Tabulações positivas para campanhas
    SUM(CASE
        WHEN tabulacao IN ('Em tratamento', 'Está com o concorrente', 'Raio de Exclusividade', 'Reunião agendada', 'Sem interesse')
        THEN 1 ELSE 0
    END) as total_tabulacoes_positivas,
    -- Cards criados para campanhas
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
    -- Tabulações positivas para ligações manuais: Conectado (Revendedor, Gerente, Gatekeeper)
    SUM(CASE
        WHEN tabulacao IN ('Conectado (Revendedor)', 'Conectado (Gerente)', 'Conectado (Gatekeeper)')
        THEN 1 ELSE 0
    END) as total_tabulacoes_positivas,
    -- Ligações manuais NÃO somam em cards criados
    0 as total_cards_criados
FROM vm_ligacoes_manuais
WHERE data IS NOT NULL
GROUP BY operador, DATE(data);

-- 3. Recriar os índices
CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_data_dia
ON mv_hunter_metrics(data_dia DESC);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_operador
ON mv_hunter_metrics(operador);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_campanha
ON mv_hunter_metrics(campanha);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_tipo
ON mv_hunter_metrics(tipo);

CREATE INDEX IF NOT EXISTS idx_mv_hunter_metrics_composite
ON mv_hunter_metrics(data_dia DESC, operador, campanha);

-- 4. Atualizar a view
REFRESH MATERIALIZED VIEW mv_hunter_metrics;

-- 5. Dar permissão
ALTER MATERIALIZED VIEW mv_hunter_metrics OWNER TO postgres;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Teste para ver se está funcionando:
SELECT
    tipo,
    SUM(total_ligacoes) as ligacoes,
    SUM(total_tabulacoes_positivas) as tab_positivas,
    SUM(total_cards_criados) as cards_criados
FROM mv_hunter_metrics
WHERE data_dia >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tipo
ORDER BY tipo;

-- Resultado esperado:
-- tipo = 'campanha': terá valores em tab_positivas e cards_criados
-- tipo = 'manual': terá valores em tab_positivas (Conectado), mas 0 em cards_criados

-- Verificar tabulações específicas de ligações manuais:
SELECT
    tabulacao,
    COUNT(*) as total
FROM vm_ligacoes_manuais
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
  AND tabulacao IN ('Conectado (Revendedor)', 'Conectado (Gerente)', 'Conectado (Gatekeeper)')
GROUP BY tabulacao
ORDER BY total DESC;
