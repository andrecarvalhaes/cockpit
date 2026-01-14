-- ========================================
-- MIGRATION: Remover constraint de área
-- ========================================
-- Este script remove o constraint que limita as áreas permitidas,
-- permitindo que qualquer área seja cadastrada dinamicamente

-- Remover o constraint de verificação da coluna area
ALTER TABLE me_metrics
DROP CONSTRAINT IF EXISTS me_metrics_area_check;

-- Agora qualquer valor pode ser inserido na coluna area
-- A validação será feita apenas no front-end

COMMENT ON COLUMN me_metrics.area IS 'Área da métrica - valores dinâmicos definidos pelo usuário';
