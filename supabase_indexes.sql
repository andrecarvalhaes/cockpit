-- ============================================
-- ÍNDICES PARA OTIMIZAÇÃO DE PERFORMANCE
-- Tabelas: vm_ligacoes_campanha e vm_ligacoes_manuais
-- ============================================

-- Execute estes comandos no SQL Editor do Supabase
-- para acelerar as consultas da aba Hunter

-- ============================================
-- TABELA: vm_ligacoes_campanha
-- ============================================

-- Índice na coluna 'data' (usado para ordenação e filtro de período)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_data
ON vm_ligacoes_campanha(data DESC);

-- Índice na coluna 'operador' (filtro por operador)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_operador
ON vm_ligacoes_campanha(operador);

-- Índice na coluna 'campanha_nome' (filtro por campanha)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_campanha_nome
ON vm_ligacoes_campanha(campanha_nome);

-- Índice na coluna 'tabulacao' (usado nos cálculos de métricas)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_tabulacao
ON vm_ligacoes_campanha(tabulacao);

-- Índice composto: data + operador (consultas filtradas por período E operador)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_data_operador
ON vm_ligacoes_campanha(data DESC, operador);

-- Índice composto: data + campanha_nome (consultas filtradas por período E campanha)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_campanha_data_campanha
ON vm_ligacoes_campanha(data DESC, campanha_nome);


-- ============================================
-- TABELA: vm_ligacoes_manuais
-- ============================================

-- Índice na coluna 'data' (usado para ordenação e filtro de período)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_manuais_data
ON vm_ligacoes_manuais(data DESC);

-- Índice na coluna 'operador' (filtro por operador)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_manuais_operador
ON vm_ligacoes_manuais(operador);

-- Índice na coluna 'tabulacao' (usado nos cálculos de métricas)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_manuais_tabulacao
ON vm_ligacoes_manuais(tabulacao);

-- Índice composto: data + operador (consultas filtradas por período E operador)
CREATE INDEX IF NOT EXISTS idx_vm_ligacoes_manuais_data_operador
ON vm_ligacoes_manuais(data DESC, operador);


-- ============================================
-- VERIFICAR ÍNDICES CRIADOS
-- ============================================
-- Execute esta query para verificar se os índices foram criados:

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('vm_ligacoes_campanha', 'vm_ligacoes_manuais')
ORDER BY tablename, indexname;


-- ============================================
-- ANÁLISE DE PERFORMANCE (OPCIONAL)
-- ============================================
-- Após criar os índices, você pode analisar as tabelas
-- para que o PostgreSQL otimize o plano de consulta:

ANALYZE vm_ligacoes_campanha;
ANALYZE vm_ligacoes_manuais;


-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Os índices melhoram MUITO a velocidade de leitura
-- 2. Podem deixar INSERT/UPDATE um pouco mais lentos (mas vale a pena)
-- 3. Os índices compostos são especialmente úteis para queries com múltiplos filtros
-- 4. O "DESC" no índice de data otimiza a ordenação descendente (mais recentes primeiro)
