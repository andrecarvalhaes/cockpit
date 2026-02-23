-- Script para verificar o status da view e diagnosticar problemas

-- 1. Verificar se a view existe
SELECT
    schemaname,
    matviewname,
    hasindexes,
    ispopulated
FROM pg_matviews
WHERE matviewname = 'vm_inbound_performance';

-- 2. Se não existe, vamos verificar se há algum objeto com nome similar
SELECT
    schemaname,
    tablename as objectname,
    'table' as type
FROM pg_tables
WHERE tablename LIKE '%inbound%'
UNION ALL
SELECT
    schemaname,
    viewname as objectname,
    'view' as type
FROM pg_views
WHERE viewname LIKE '%inbound%'
UNION ALL
SELECT
    schemaname,
    matviewname as objectname,
    'materialized view' as type
FROM pg_matviews
WHERE matviewname LIKE '%inbound%';

-- 3. Verificar se as tabelas fonte existem e têm dados
SELECT 'BD_Conversoes_RD' as tabela, COUNT(*) as registros
FROM "BD_Conversoes_RD"
WHERE email IS NOT NULL;

SELECT 'BD_RDOportunidades' as tabela, COUNT(*) as registros
FROM "BD_RDOportunidades";

SELECT 'aux_kommo' as tabela, COUNT(*) as registros
FROM aux_kommo;

-- 4. Verificar se os índices foram criados
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE '%inbound%' OR indexname LIKE '%bd_conversoes%' OR indexname LIKE '%kommo%'
ORDER BY tablename, indexname;
