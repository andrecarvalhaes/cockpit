-- ========================================
-- MIGRATION: Adicionar ordem e link às métricas
-- ========================================
-- Este script adiciona dois campos à tabela me_metrics:
-- 1. display_order: para controlar a ordem de exibição
-- 2. data_source_link: link para a fonte dos dados

-- Adicionar coluna de ordem de exibição
ALTER TABLE me_metrics
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Adicionar coluna de link da fonte de dados
ALTER TABLE me_metrics
ADD COLUMN IF NOT EXISTS data_source_link TEXT;

-- Criar índice para melhorar performance na ordenação
CREATE INDEX IF NOT EXISTS idx_me_metrics_display_order ON me_metrics(display_order);

-- Comentários nas colunas
COMMENT ON COLUMN me_metrics.display_order IS 'Ordem de exibição da métrica (menor valor aparece primeiro)';
COMMENT ON COLUMN me_metrics.data_source_link IS 'Link para a fonte de dados da métrica';

-- Atualizar as métricas existentes com uma ordem baseada na data de criação
-- (as mais antigas ficam primeiro)
UPDATE me_metrics
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM me_metrics
) AS subquery
WHERE me_metrics.id = subquery.id
AND me_metrics.display_order = 0;
