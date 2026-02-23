-- Migration: Create vm_inbound_performance materialized view
-- Description: View materializada para análise de performance do funil inbound
-- Aggregates data from BD_Conversoes_RD, BD_RDOportunidades, and aux_kommo

-- Drop view if exists
DROP MATERIALIZED VIEW IF EXISTS vm_inbound_performance CASCADE;

-- Create materialized view
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
)
SELECT
    fc.email,
    fc.id,
    fc.data_criado,

    -- qualificado: se telefone está preenchido E relacao_posto é válida em qualquer conversão desse email
    EXISTS(
        SELECT 1
        FROM "BD_Conversoes_RD" c
        WHERE c.email = fc.email
        AND c.telefone IS NOT NULL
        AND c.telefone != ''
        AND c.relacao_posto IN ('Dono(a) ou Diretor(a)', 'Gerente ou Supervisor(a)', 'Outra relação')
    ) as qualificado,

    -- mql: se existe em BD_RDOportunidades (por email ou id)
    EXISTS(
        SELECT 1 FROM "BD_RDOportunidades" o
        WHERE o.email = fc.email OR o.id = fc.id
    ) as mql,

    -- data_mql: menor data de created_at em BD_RDOportunidades
    (
        SELECT MIN(created_at)
        FROM "BD_RDOportunidades" o
        WHERE o.email = fc.email OR o.id = fc.id
    ) as data_mql,

    -- sql: se existe em aux_kommo (email ou RD Station_ID)
    EXISTS(
        SELECT 1 FROM aux_kommo k
        WHERE k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text
    ) as sql,

    -- data_sql: menor data de "Criado em" em aux_kommo
    (
        SELECT MIN(
            CASE
                WHEN k."Criado em" ~ '^\d{2}/\d{2}/\d{4}' THEN
                    TO_TIMESTAMP(k."Criado em", 'DD/MM/YYYY HH24:MI:SS')
                ELSE NULL
            END
        )
        FROM aux_kommo k
        WHERE k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text
    ) as data_sql,

    -- agenda: se tem "Data da Apresentação:" preenchida
    EXISTS(
        SELECT 1 FROM aux_kommo k
        WHERE (k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text)
        AND k."Data da Apresentação:" IS NOT NULL
        AND k."Data da Apresentação:" != ''
    ) as agenda,

    -- data_agenda: menor data de apresentação
    (
        SELECT MIN(
            CASE
                WHEN k."Data da Apresentação:" ~ '^\d{2}/\d{2}/\d{4}' THEN
                    TO_TIMESTAMP(k."Data da Apresentação:", 'DD/MM/YYYY HH24:MI:SS')
                ELSE NULL
            END
        )
        FROM aux_kommo k
        WHERE (k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text)
        AND k."Data da Apresentação:" IS NOT NULL
        AND k."Data da Apresentação:" != ''
    ) as data_agenda,

    -- show: se tem "Valor da Mensalidade" preenchido
    EXISTS(
        SELECT 1 FROM aux_kommo k
        WHERE (k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text)
        AND k."Valor da Mensalidade" IS NOT NULL
        AND k."Valor da Mensalidade" != ''
    ) as show,

    -- venda: se tem "Data de Assinatura" preenchida
    EXISTS(
        SELECT 1 FROM aux_kommo k
        WHERE (k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text)
        AND k."Data de Assinatura" IS NOT NULL
        AND k."Data de Assinatura" != ''
    ) as venda,

    -- mrr: soma de "Valor da Mensalidade" onde "Etapa do lead" = "Venda ganha"
    COALESCE((
        SELECT SUM(
            CASE
                -- Try to convert to numeric, handling both comma and dot as decimal separator
                WHEN REPLACE(k."Valor da Mensalidade", ',', '.') ~ '^[0-9]+\.?[0-9]*$'
                THEN REPLACE(k."Valor da Mensalidade", ',', '.')::numeric
                ELSE 0
            END
        )
        FROM aux_kommo k
        WHERE (k."Email comercial" = fc.email
           OR k."Email pessoal" = fc.email
           OR k."Outro email" = fc.email
           OR k."RD Station_ID" = fc.id::text)
        AND k."Etapa do lead" = 'Venda ganha'
        AND k."Valor da Mensalidade" IS NOT NULL
        AND k."Valor da Mensalidade" != ''
    ), 0) as mrr
FROM first_conversion fc;

-- Create indexes for better query performance
CREATE INDEX idx_vm_inbound_performance_email ON vm_inbound_performance(email);
CREATE INDEX idx_vm_inbound_performance_id ON vm_inbound_performance(id);
CREATE INDEX idx_vm_inbound_performance_data_criado ON vm_inbound_performance(data_criado);
CREATE INDEX idx_vm_inbound_performance_mql ON vm_inbound_performance(mql);
CREATE INDEX idx_vm_inbound_performance_sql ON vm_inbound_performance(sql);
CREATE INDEX idx_vm_inbound_performance_venda ON vm_inbound_performance(venda);

-- Add comment to the view
COMMENT ON MATERIALIZED VIEW vm_inbound_performance IS 'View materializada para análise de performance do funil inbound, agregando dados de conversões RD, oportunidades e Kommo. Atualizar com: REFRESH MATERIALIZED VIEW vm_inbound_performance;';

-- Note: To refresh the materialized view, run:
-- REFRESH MATERIALIZED VIEW vm_inbound_performance;
-- or for concurrent refresh (doesn't block reads):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY vm_inbound_performance;
