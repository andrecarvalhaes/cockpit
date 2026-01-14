-- ========================================
-- COCKPIT - Schema SQL para Supabase
-- Sistema de Gestão de Métricas e Análises
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. TABELA DE TIMES
-- ========================================

CREATE TABLE IF NOT EXISTS me_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_me_teams_name ON me_teams(name);

-- ========================================
-- 2. TABELA DE MÉTRICAS
-- ========================================

CREATE TABLE IF NOT EXISTS me_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES me_teams(id) ON DELETE CASCADE,
    area TEXT NOT NULL CHECK (area IN ('Marketing', 'Comercial', 'Hunter', 'Contratos', 'Redes Sociais', 'Site')),
    unit TEXT NOT NULL,
    target NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Índices para melhor performance
    CONSTRAINT me_metrics_name_key UNIQUE (name)
);

-- Índices adicionais
CREATE INDEX idx_me_metrics_team_id ON me_metrics(team_id);
CREATE INDEX idx_me_metrics_area ON me_metrics(area);
CREATE INDEX idx_me_metrics_created_at ON me_metrics(created_at DESC);

-- ========================================
-- 3. TABELA DE METAS MENSAIS
-- ========================================

CREATE TABLE IF NOT EXISTS me_monthly_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id UUID NOT NULL REFERENCES me_metrics(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- formato "YYYY-MM"
    target NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Uma métrica só pode ter uma meta por mês
    CONSTRAINT me_monthly_targets_metric_month_key UNIQUE (metric_id, month)
);

-- Índices
CREATE INDEX idx_me_monthly_targets_metric_id ON me_monthly_targets(metric_id);
CREATE INDEX idx_me_monthly_targets_month ON me_monthly_targets(month);

-- ========================================
-- 4. TABELA DE VALORES DAS MÉTRICAS
-- ========================================

CREATE TABLE IF NOT EXISTS me_metric_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id UUID NOT NULL REFERENCES me_metrics(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Uma métrica só pode ter um valor por data
    CONSTRAINT me_metric_values_metric_date_key UNIQUE (metric_id, date)
);

-- Índices
CREATE INDEX idx_me_metric_values_metric_id ON me_metric_values(metric_id);
CREATE INDEX idx_me_metric_values_date ON me_metric_values(date DESC);

-- ========================================
-- 5. TABELA DE PLANOS DE AÇÃO
-- ========================================

CREATE TABLE IF NOT EXISTS me_action_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metric_id UUID NOT NULL REFERENCES me_metrics(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    responsible TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_me_action_plans_metric_id ON me_action_plans(metric_id);
CREATE INDEX idx_me_action_plans_completed ON me_action_plans(completed);
CREATE INDEX idx_me_action_plans_created_at ON me_action_plans(created_at DESC);

-- ========================================
-- 6. TABELA DE COMENTÁRIOS DOS PLANOS DE AÇÃO
-- ========================================

CREATE TABLE IF NOT EXISTS me_action_plan_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_plan_id UUID NOT NULL REFERENCES me_action_plans(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_me_action_plan_comments_plan_id ON me_action_plan_comments(action_plan_id);
CREATE INDEX idx_me_action_plan_comments_created_at ON me_action_plan_comments(created_at DESC);

-- ========================================
-- 7. TABELA DE ANÁLISES DE CAUSA RAIZ
-- ========================================

CREATE TABLE IF NOT EXISTS me_root_cause_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id UUID NOT NULL REFERENCES me_metrics(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    problem TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('5whys', 'ishikawa', 'both')),
    root_cause TEXT,
    author TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Em Andamento' CHECK (status IN ('Em Andamento', 'Concluída')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_me_root_cause_analyses_metric_id ON me_root_cause_analyses(metric_id);
CREATE INDEX idx_me_root_cause_analyses_status ON me_root_cause_analyses(status);
CREATE INDEX idx_me_root_cause_analyses_created_at ON me_root_cause_analyses(created_at DESC);

-- ========================================
-- 8. TABELA DOS 5 PORQUÊS
-- ========================================

CREATE TABLE IF NOT EXISTS me_five_whys_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES me_root_cause_analyses(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Uma análise só pode ter um nível de cada vez
    CONSTRAINT five_whys_analysis_level_key UNIQUE (analysis_id, level)
);

-- Índices
CREATE INDEX idx_five_whys_analysis_id ON me_five_whys_levels(analysis_id);
CREATE INDEX idx_five_whys_level ON me_five_whys_levels(level);

-- ========================================
-- 9. TABELA DE CAUSAS DO DIAGRAMA DE ISHIKAWA
-- ========================================

CREATE TABLE IF NOT EXISTS me_ishikawa_causes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES me_root_cause_analyses(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Método', 'Material', 'Máquina', 'Mão de obra', 'Medição', 'Meio Ambiente')),
    cause TEXT NOT NULL,
    subcauses TEXT[], -- Array de subcausas
    is_root_cause BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_me_ishikawa_causes_analysis_id ON me_ishikawa_causes(analysis_id);
CREATE INDEX idx_me_ishikawa_causes_category ON me_ishikawa_causes(category);
CREATE INDEX idx_me_ishikawa_causes_is_root ON me_ishikawa_causes(is_root_cause);

-- ========================================
-- 10. TABELA DE VINCULAÇÃO ANÁLISE <-> PLANO DE AÇÃO
-- ========================================

CREATE TABLE IF NOT EXISTS me_analysis_action_plan_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES me_root_cause_analyses(id) ON DELETE CASCADE,
    action_plan_id UUID NOT NULL REFERENCES me_action_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Um plano de ação não pode ser vinculado mais de uma vez à mesma análise
    CONSTRAINT analysis_action_plan_unique UNIQUE (analysis_id, action_plan_id)
);

-- Índices
CREATE INDEX idx_links_analysis_id ON me_analysis_action_plan_links(analysis_id);
CREATE INDEX idx_links_action_plan_id ON me_analysis_action_plan_links(action_plan_id);

-- ========================================
-- 11. FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_me_teams_updated_at
    BEFORE UPDATE ON me_teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_me_metrics_updated_at
    BEFORE UPDATE ON me_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_me_action_plans_updated_at
    BEFORE UPDATE ON me_action_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_me_root_cause_analyses_updated_at
    BEFORE UPDATE ON me_root_cause_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE me_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_monthly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_metric_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_action_plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_root_cause_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_five_whys_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_ishikawa_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE me_analysis_action_plan_links ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir tudo para usuários autenticados
-- (Você pode ajustar conforme suas necessidades de segurança)

-- Teams
CREATE POLICY "Permitir leitura de times" ON me_teams FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de times" ON me_teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de times" ON me_teams FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de times" ON me_teams FOR DELETE USING (true);

-- Metrics
CREATE POLICY "Permitir leitura de métricas" ON me_metrics FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de métricas" ON me_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de métricas" ON me_metrics FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de métricas" ON me_metrics FOR DELETE USING (true);

-- Monthly Targets
CREATE POLICY "Permitir leitura de metas mensais" ON me_monthly_targets FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de metas mensais" ON me_monthly_targets FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de metas mensais" ON me_monthly_targets FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de metas mensais" ON me_monthly_targets FOR DELETE USING (true);

-- Metric Values
CREATE POLICY "Permitir leitura de valores" ON me_metric_values FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de valores" ON me_metric_values FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de valores" ON me_metric_values FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de valores" ON me_metric_values FOR DELETE USING (true);

-- Action Plans
CREATE POLICY "Permitir leitura de planos de ação" ON me_action_plans FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de planos de ação" ON me_action_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de planos de ação" ON me_action_plans FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de planos de ação" ON me_action_plans FOR DELETE USING (true);

-- Action Plan Comments
CREATE POLICY "Permitir leitura de comentários" ON me_action_plan_comments FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de comentários" ON me_action_plan_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de comentários" ON me_action_plan_comments FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de comentários" ON me_action_plan_comments FOR DELETE USING (true);

-- Root Cause Analyses
CREATE POLICY "Permitir leitura de análises" ON me_root_cause_analyses FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de análises" ON me_root_cause_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de análises" ON me_root_cause_analyses FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de análises" ON me_root_cause_analyses FOR DELETE USING (true);

-- Five Whys Levels
CREATE POLICY "Permitir leitura de 5 porquês" ON me_five_whys_levels FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de 5 porquês" ON me_five_whys_levels FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de 5 porquês" ON me_five_whys_levels FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de 5 porquês" ON me_five_whys_levels FOR DELETE USING (true);

-- Ishikawa Causes
CREATE POLICY "Permitir leitura de causas Ishikawa" ON me_ishikawa_causes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de causas Ishikawa" ON me_ishikawa_causes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de causas Ishikawa" ON me_ishikawa_causes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de causas Ishikawa" ON me_ishikawa_causes FOR DELETE USING (true);

-- Analysis Action Plan Links
CREATE POLICY "Permitir leitura de vínculos" ON me_analysis_action_plan_links FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de vínculos" ON me_analysis_action_plan_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de vínculos" ON me_analysis_action_plan_links FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de vínculos" ON me_analysis_action_plan_links FOR DELETE USING (true);

-- ========================================
-- 13. VIEWS ÚTEIS
-- ========================================

-- View para obter métricas com contagem de valores
CREATE OR REPLACE VIEW me_metrics_summary AS
SELECT
    m.*,
    COUNT(DISTINCT mv.id) as total_values,
    COUNT(DISTINCT ap.id) as total_action_plans,
    COUNT(DISTINCT rca.id) as total_analyses,
    MAX(mv.date) as last_value_date
FROM me_metrics m
LEFT JOIN me_metric_values mv ON m.id = mv.metric_id
LEFT JOIN me_action_plans ap ON m.id = ap.metric_id
LEFT JOIN me_root_cause_analyses rca ON m.id = rca.metric_id
GROUP BY m.id;

-- View para obter planos de ação com contagem de comentários
CREATE OR REPLACE VIEW me_action_plans_summary AS
SELECT
    ap.*,
    COUNT(apc.id) as total_comments
FROM me_action_plans ap
LEFT JOIN me_action_plan_comments apc ON ap.id = apc.action_plan_id
GROUP BY ap.id;

-- View para obter análises completas
CREATE OR REPLACE VIEW me_root_cause_analyses_complete AS
SELECT
    rca.*,
    COUNT(DISTINCT fwl.id) as total_five_whys,
    COUNT(DISTINCT ic.id) as total_ishikawa_causes,
    COUNT(DISTINCT aapl.action_plan_id) as total_linked_action_plans
FROM me_root_cause_analyses rca
LEFT JOIN me_five_whys_levels fwl ON rca.id = fwl.analysis_id
LEFT JOIN me_ishikawa_causes ic ON rca.id = ic.analysis_id
LEFT JOIN me_analysis_action_plan_links aapl ON rca.id = aapl.analysis_id
GROUP BY rca.id;

-- ========================================
-- 14. COMENTÁRIOS NAS TABELAS
-- ========================================

COMMENT ON TABLE me_teams IS 'Times do sistema para organizar métricas';
COMMENT ON TABLE me_metrics IS 'Tabela principal de métricas do sistema';
COMMENT ON TABLE me_monthly_targets IS 'Metas mensais específicas para cada métrica';
COMMENT ON TABLE me_metric_values IS 'Valores registrados das métricas ao longo do tempo';
COMMENT ON TABLE me_action_plans IS 'Planos de ação vinculados às métricas';
COMMENT ON TABLE me_action_plan_comments IS 'Comentários nos planos de ação';
COMMENT ON TABLE me_root_cause_analyses IS 'Análises de causa raiz (5 Porquês e/ou Ishikawa)';
COMMENT ON TABLE me_five_whys_levels IS 'Níveis do método dos 5 Porquês';
COMMENT ON TABLE me_ishikawa_causes IS 'Causas do Diagrama de Ishikawa (6M)';
COMMENT ON TABLE me_analysis_action_plan_links IS 'Vinculação entre análises e planos de ação';

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Para executar este script no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute o script
--
-- Nota: As políticas RLS estão configuradas para permitir acesso total.
-- Ajuste conforme necessário para sua aplicação em produção.
