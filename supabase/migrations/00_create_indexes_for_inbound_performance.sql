-- Migration: Create indexes on source tables for vm_inbound_performance
-- Description: Adds indexes to improve performance of the materialized view creation and refresh
-- Run this BEFORE creating the materialized view

-- ==========================================
-- Indexes on BD_Conversoes_RD
-- ==========================================

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_email
ON "BD_Conversoes_RD"(email)
WHERE email IS NOT NULL AND email != '';

-- Index on telefone for qualified lead checks
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_telefone
ON "BD_Conversoes_RD"(telefone)
WHERE telefone IS NOT NULL AND telefone != '';

-- Index on relacao_posto for qualified lead checks
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_relacao_posto
ON "BD_Conversoes_RD"(relacao_posto)
WHERE relacao_posto IN ('Dono(a) ou Diretor(a)', 'Gerente ou Supervisor(a)', 'Outra relação');

-- Composite index for qualified leads
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_email_telefone_relacao
ON "BD_Conversoes_RD"(email, telefone, relacao_posto)
WHERE email IS NOT NULL AND telefone IS NOT NULL;

-- Index on created_at for date filtering
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_created_at
ON "BD_Conversoes_RD"(created_at);

-- Composite index for first conversion lookup
CREATE INDEX IF NOT EXISTS idx_bd_conversoes_rd_email_created_at
ON "BD_Conversoes_RD"(email, created_at)
WHERE email IS NOT NULL;

-- ==========================================
-- Indexes on BD_RDOportunidades
-- ==========================================

-- Index on email for MQL lookups
CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_email
ON "BD_RDOportunidades"(email)
WHERE email IS NOT NULL;

-- Index on id for MQL lookups
CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_id
ON "BD_RDOportunidades"(id);

-- Composite index for MQL data
CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_email_created_at
ON "BD_RDOportunidades"(email, created_at)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bd_rdoportunidades_id_created_at
ON "BD_RDOportunidades"(id, created_at);

-- ==========================================
-- Indexes on aux_kommo
-- ==========================================

-- Indexes on email fields for SQL lookups
CREATE INDEX IF NOT EXISTS idx_kommo_email_comercial
ON aux_kommo("Email comercial")
WHERE "Email comercial" IS NOT NULL AND "Email comercial" != '';

CREATE INDEX IF NOT EXISTS idx_kommo_email_pessoal
ON aux_kommo("Email pessoal")
WHERE "Email pessoal" IS NOT NULL AND "Email pessoal" != '';

CREATE INDEX IF NOT EXISTS idx_kommo_outro_email
ON aux_kommo("Outro email")
WHERE "Outro email" IS NOT NULL AND "Outro email" != '';

-- Index on RD Station ID
CREATE INDEX IF NOT EXISTS idx_kommo_rd_station_id
ON aux_kommo("RD Station_ID")
WHERE "RD Station_ID" IS NOT NULL AND "RD Station_ID" != '';

-- Index on Etapa do lead for MRR calculations
CREATE INDEX IF NOT EXISTS idx_kommo_etapa_do_lead
ON aux_kommo("Etapa do lead")
WHERE "Etapa do lead" = 'Venda ganha';

-- Composite index for venda checks
CREATE INDEX IF NOT EXISTS idx_kommo_email_comercial_etapa
ON aux_kommo("Email comercial", "Etapa do lead")
WHERE "Email comercial" IS NOT NULL AND "Etapa do lead" = 'Venda ganha';

-- Index on Data da Apresentação for agenda checks
CREATE INDEX IF NOT EXISTS idx_kommo_data_apresentacao
ON aux_kommo("Data da Apresentação:")
WHERE "Data da Apresentação:" IS NOT NULL AND "Data da Apresentação:" != '';

-- Index on Valor da Mensalidade for show checks
CREATE INDEX IF NOT EXISTS idx_kommo_valor_mensalidade
ON aux_kommo("Valor da Mensalidade")
WHERE "Valor da Mensalidade" IS NOT NULL AND "Valor da Mensalidade" != '';

-- Index on Data de Assinatura for venda checks
CREATE INDEX IF NOT EXISTS idx_kommo_data_assinatura
ON aux_kommo("Data de Assinatura")
WHERE "Data de Assinatura" IS NOT NULL AND "Data de Assinatura" != '';

-- Index on Criado em for data_sql
CREATE INDEX IF NOT EXISTS idx_kommo_criado_em
ON aux_kommo("Criado em")
WHERE "Criado em" IS NOT NULL AND "Criado em" != '';

-- ==========================================
-- Analyze tables for statistics
-- ==========================================

ANALYZE "BD_Conversoes_RD";
ANALYZE "BD_RDOportunidades";
ANALYZE aux_kommo;

-- ==========================================
-- Verify indexes were created
-- ==========================================

-- Query to check indexes on BD_Conversoes_RD
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'BD_Conversoes_RD'
ORDER BY indexname;

-- Query to check indexes on BD_RDOportunidades
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'BD_RDOportunidades'
ORDER BY indexname;

-- Query to check indexes on aux_kommo
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'aux_kommo'
ORDER BY indexname;
