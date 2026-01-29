-- ========================================
-- MIGRATION: Planos de Ação com Área ou Métrica
-- Data: 2026-01-29
-- Descrição: Permite que planos de ação sejam vinculados a uma área OU a uma métrica
-- ========================================

-- 1. Tornar metric_id e metric_name opcionais (nullable)
ALTER TABLE me_action_plans
  ALTER COLUMN metric_id DROP NOT NULL,
  ALTER COLUMN metric_name DROP NOT NULL;

-- 2. Adicionar coluna area
ALTER TABLE me_action_plans
  ADD COLUMN area TEXT;

-- 3. Adicionar constraint para garantir que OU metric_id OU area seja preenchido
ALTER TABLE me_action_plans
  ADD CONSTRAINT me_action_plans_metric_or_area_check
  CHECK (
    (metric_id IS NOT NULL AND area IS NULL) OR
    (metric_id IS NULL AND area IS NOT NULL)
  );

-- 4. Remover a foreign key constraint antiga e recriá-la sem ON DELETE CASCADE
-- Primeiro, precisamos encontrar o nome da constraint
-- (Normalmente seria algo como me_action_plans_metric_id_fkey)
ALTER TABLE me_action_plans
  DROP CONSTRAINT IF EXISTS me_action_plans_metric_id_fkey;

-- Recriar a foreign key sem NOT NULL (já foi removido acima)
ALTER TABLE me_action_plans
  ADD CONSTRAINT me_action_plans_metric_id_fkey
  FOREIGN KEY (metric_id)
  REFERENCES me_metrics(id)
  ON DELETE SET NULL;

-- 5. Criar índice para a coluna area
CREATE INDEX idx_me_action_plans_area ON me_action_plans(area) WHERE area IS NOT NULL;

-- 6. Atualizar a view me_action_plans_summary
DROP VIEW IF EXISTS me_action_plans_summary;

CREATE OR REPLACE VIEW me_action_plans_summary AS
SELECT
    ap.*,
    COUNT(apc.id) as total_comments
FROM me_action_plans ap
LEFT JOIN me_action_plan_comments apc ON ap.id = apc.action_plan_id
GROUP BY ap.id;

-- 7. Comentário na coluna
COMMENT ON COLUMN me_action_plans.area IS 'Área relacionada ao plano de ação (alternativa a metric_id)';

-- ========================================
-- OBSERVAÇÕES IMPORTANTES:
-- ========================================
--
-- 1. Esta migration permite que um plano de ação seja vinculado a:
--    - Uma métrica específica (metric_id preenchido, area NULL)
--    - OU uma área (area preenchida, metric_id NULL)
--    - Mas NUNCA ambos ou nenhum (garantido pelo constraint)
--
-- 2. Para planos de ação existentes que estão vinculados a uma métrica,
--    nada será alterado automaticamente.
--
-- 3. Se você quiser migrar alguns planos de ação existentes de métrica
--    para área, você precisará executar um UPDATE manualmente. Exemplo:
--
--    UPDATE me_action_plans
--    SET area = 'Nome da Área',
--        metric_id = NULL,
--        metric_name = NULL
--    WHERE id = 'uuid-do-plano';
--
-- 4. As views foram atualizadas para refletir as novas mudanças.
--
-- ========================================
-- FIM DA MIGRATION
-- ========================================
