# ClubPetro Cockpit

Dashboard de métricas de marketing e comercial do ClubPetro.

## Características

- Dashboard com visualização de métricas em tempo real
- Sistema completo de CRUD de métricas
- Múltiplos tipos de gráficos (Linha, Área, Barras, Pizza, KPI)
- Sistema de planos de ação para recuperação de métricas
- Filtros por período e área
- Identidade visual ClubPetro (laranja #F26600)
- Responsivo e otimizado para performance

## Tecnologias

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- Recharts (gráficos)
- React Router DOM (navegação)
- React Hook Form (formulários)
- Lucide React (ícones)
- date-fns (manipulação de datas)

## Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, MainLayout
│   ├── metrics/         # Componentes de métricas
│   ├── action-plans/    # Componentes de planos de ação
│   └── shared/          # Componentes reutilizáveis
├── contexts/            # Context API (estado global)
├── hooks/               # Custom hooks
├── pages/               # Páginas da aplicação
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
└── styles/              # CSS global

## Funcionalidades

### Dashboard
- Visão geral de todas as métricas
- KPIs com valores e variações
- Filtros por período e área
- Alertas para métricas abaixo da meta

### Métricas
- Cadastro de novas métricas
- Lançamento de valores
- Histórico completo
- Edição e exclusão
- Múltiplos tipos de visualização

### Planos de Ação
- Criação de planos vinculados a métricas
- Acompanhamento de tarefas
- Status e progresso
- Filtros por status

## Design System

Segue rigorosamente a identidade visual do ClubPetro:

- Cor primária: #F26600 (laranja)
- Fonte títulos: Montserrat
- Fonte corpo: Open Sans
- Cards elevados com shadow
- Border radius: 8px
- Transições suaves

## Próximos Passos

Após aprovação do frontend, serão fornecidos:

1. Scripts SQL para criação do banco de dados
2. Documentação de API/Backend
3. Guia de integração
4. Manual do usuário

## Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.
