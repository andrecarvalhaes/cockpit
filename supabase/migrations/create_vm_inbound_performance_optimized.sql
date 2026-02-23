-- Migration: Create vm_inbound_performance materialized view (OPTIMIZED VERSION)
-- Description: View materializada para análise de performance do funil inbound
-- Aggregates data from BD_Conversoes_RD, BD_RDOportunidades, and aux_kommo
-- This version uses JOINs and pre-aggregations for better performance

-- Drop view if exists
DROP MATERIALIZED VIEW IF EXISTS vm_inbound_performance CASCADE;

-- First, ensure indexes exist on source tables for better performance
-- Run these separately if you get timeout errors:

-- CREATE INDEX IF NOT EXISTS idx_bd_conversoes_email ON "BD_Conversoes_RD"(email);
-- CREATE INDEX IF NOT EXISTS idx_bd_conversoes_telefone ON "BD_Conversoes_RD"(telefone) WHERE telefone IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_bd_oportunidades_email ON "BD_RDOportunidades"(email);
-- CREATE INDEX IF NOT EXISTS idx_bd_oportunidades_id ON "BD_RDOportunidades"(id);
-- CREATE INDEX IF NOT EXISTS idx_kommo_email_comercial ON aux_kommo("Email comercial") WHERE "Email comercial" IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_kommo_email_pessoal ON aux_kommo("Email pessoal") WHERE "Email pessoal" IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_kommo_outro_email ON aux_kommo("Outro email") WHERE "Outro email" IS NOT NULL;
-- CREATE INDEX IF NOT EXISTS idx_kommo_rd_station_id ON aux_kommo("RD Station_ID") WHERE "RD Station_ID" IS NOT NULL;

-- Create materialized view with optimized query
CREATE MATERIALIZED VIEW vm_inbound_performance AS
WITH first_conversion AS (
    -- Get the first conversion (earliest created_at) for each unique email
    SELECT DISTINCT ON (email)
        email,
        id,
        created_at as data_criado
    FROM "BD_Conversoes_RD"
    WHERE email IS NOT NULL AND email != ''
    ORDER BY email, created_at ASC
),
qualified_leads AS (
    -- Pre-aggregate qualified status per email
    SELECT
        email,
        bool_or(
            telefone IS NOT NULL
            AND telefone != ''
            AND relacao_posto IN ('Dono(a) ou Diretor(a)', 'Gerente ou Supervisor(a)', 'Outra relação')
        ) as qualificado
    FROM "BD_Conversoes_RD"
    WHERE email IS NOT NULL
    GROUP BY email
),
mql_data AS (
    -- Pre-aggregate MQL data
    SELECT
        COALESCE(email, id::text) as lookup_key,
        MIN(created_at) as data_mql,
        true as mql
    FROM "BD_RDOportunidades"
    WHERE email IS NOT NULL OR id IS NOT NULL
    GROUP BY COALESCE(email, id::text)
),
kommo_aggregated AS (
    -- Pre-aggregate all Kommo data per email/id
    SELECT
        COALESCE(
            NULLIF("Email comercial", ''),
            NULLIF("Email pessoal", ''),
            NULLIF("Outro email", ''),
            "RD Station_ID"
        ) as lookup_key,
        MIN(
            CASE
                WHEN "Criado em" ~ '^\d{2}/\d{2}/\d{4}' THEN
                    TO_TIMESTAMP("Criado em", 'DD/MM/YYYY HH24:MI:SS')
                ELSE NULL
            END
        ) as data_sql,
        MIN(
            CASE
                WHEN "Data da Apresentação:" ~ '^\d{2}/\d{2}/\d{4}' THEN
                    TO_TIMESTAMP("Data da Apresentação:", 'DD/MM/YYYY HH24:MI:SS')
                ELSE NULL
            END
        ) as data_agenda,
        bool_or("Data da Apresentação:" IS NOT NULL AND "Data da Apresentação:" != '') as agenda,
        bool_or("Valor da Mensalidade" IS NOT NULL AND "Valor da Mensalidade" != '') as show,
        bool_or("Data de Assinatura" IS NOT NULL AND "Data de Assinatura" != '') as venda,
        SUM(
            CASE
                WHEN "Etapa do lead" = 'Venda ganha'
                    AND "Valor da Mensalidade" IS NOT NULL
                    AND "Valor da Mensalidade" != ''
                    AND REPLACE("Valor da Mensalidade", ',', '.') ~ '^[0-9]+\.?[0-9]*$'
                THEN REPLACE("Valor da Mensalidade", ',', '.')::numeric
                ELSE 0
            END
        ) as mrr
    FROM aux_kommo
    WHERE (
        "Email comercial" IS NOT NULL OR
        "Email pessoal" IS NOT NULL OR
        "Outro email" IS NOT NULL OR
        "RD Station_ID" IS NOT NULL
    )
    GROUP BY COALESCE(
        NULLIF("Email comercial", ''),
        NULLIF("Email pessoal", ''),
        NULLIF("Outro email", ''),
        "RD Station_ID"
    )
)
SELECT
    fc.email,
    fc.id,
    fc.data_criado,
    COALESCE(ql.qualificado, false) as qualificado,
    COALESCE(mql.mql, false) as mql,
    mql.data_mql,
    (ka.lookup_key IS NOT NULL) as sql,
    ka.data_sql,
    COALESCE(ka.agenda, false) as agenda,
    ka.data_agenda,
    COALESCE(ka.show, false) as show,
    COALESCE(ka.venda, false) as venda,
    COALESCE(ka.mrr, 0) as mrr
FROM first_conversion fc
LEFT JOIN qualified_leads ql ON ql.email = fc.email
LEFT JOIN mql_data mql ON mql.lookup_key = fc.email
LEFT JOIN kommo_aggregated ka ON (ka.lookup_key = fc.email OR ka.lookup_key = fc.id::text);

-- Create indexes for better query performance
CREATE INDEX idx_vm_inbound_performance_email ON vm_inbound_performance(email);
CREATE INDEX idx_vm_inbound_performance_id ON vm_inbound_performance(id);
CREATE INDEX idx_vm_inbound_performance_data_criado ON vm_inbound_performance(data_criado);
CREATE INDEX idx_vm_inbound_performance_mql ON vm_inbound_performance(mql);
CREATE INDEX idx_vm_inbound_performance_sql ON vm_inbound_performance(sql);
CREATE INDEX idx_vm_inbound_performance_venda ON vm_inbound_performance(venda);
CREATE INDEX idx_vm_inbound_performance_mrr ON vm_inbound_performance(mrr) WHERE mrr > 0;

-- Add comment to the view
COMMENT ON MATERIALIZED VIEW vm_inbound_performance IS 'View materializada para análise de performance do funil inbound, agregando dados de conversões RD, oportunidades e Kommo. Versão otimizada com pre-agregações. Atualizar com: REFRESH MATERIALIZED VIEW vm_inbound_performance;';

-- Note: To refresh the materialized view, run:
-- REFRESH MATERIALIZED VIEW vm_inbound_performance;
-- or for concurrent refresh (doesn't block reads):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY vm_inbound_performance;
