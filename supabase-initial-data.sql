-- Script para inserir dados iniciais no banco de dados

-- Inserir times iniciais
INSERT INTO me_teams (name, description) VALUES
('Comercial', 'Time responsável pelas atividades comerciais'),
('Marketing', 'Time responsável pelas ações de marketing'),
('Operações', 'Time responsável pelas operações')
ON CONFLICT (name) DO NOTHING;
