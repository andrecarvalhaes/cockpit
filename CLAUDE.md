# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClubPetro Cockpit is a marketing and commercial metrics dashboard built with React, TypeScript, and Supabase. It provides real-time metric visualization, action plan management, and root cause analysis tools.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Deploy to Firebase Hosting (after building)
firebase deploy
```

## Environment Configuration

Create a `.env` file with required Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

### State Management

The application uses React Context API for global state. All contexts are composed in [src/contexts/AppProviders.tsx](src/contexts/AppProviders.tsx) with a specific nesting order:

```
AuthProvider
└── TeamsProvider
    └── AreasProvider
        └── MetricsProvider
            └── ActionPlansProvider
```

Available contexts:
- **AuthContext**: User authentication state and Supabase session
- **TeamsProvider**: Team data management
- **AreasContext**: Business area filtering (Marketing, Comercial, Hunter, etc.)
- **MetricsContext**: Metrics CRUD operations and real-time data
- **ActionPlansContext**: Action plan management
- **RootCauseContext**: Root cause analysis (5 Whys and Ishikawa diagrams)

### Routing Structure

Routes are defined in [src/App.tsx](src/App.tsx). All routes except `/login` are protected by `ProtectedRoute` and wrapped in `MainLayout`:

- `/` - Dashboard with metric overview
- `/metrics` - Metrics list and management
- `/metrics/:id` - Metric details with history
- `/metrics/team/:teamId` - Team-specific metrics
- `/metrics/team/:teamId/area/:area` - Team + area filtered metrics
- `/metrics/area/:area` - Area-specific metrics
- `/action-plans` - Action plan management
- `/individual` - Individual performance tracking (Hunter data)

### Component Organization

Components are organized by feature domain:

- **layout/**: [MainLayout](src/components/layout/MainLayout.tsx), [Sidebar](src/components/layout/Sidebar.tsx), [Header](src/components/layout/Header.tsx)
- **metrics/**: Metric forms, charts, filters, value inputs
- **action-plans/**: Action plan CRUD components
- **root-cause/**: 5 Whys and Ishikawa diagram components
- **individual/**: Hunter performance tables with drill-down capabilities
- **shared/**: Reusable UI components (Button, Modal, Input, Select, DatePicker, etc.)
- **auth/**: [ProtectedRoute](src/components/auth/ProtectedRoute.tsx) wrapper

### Data Layer

**Supabase Client**: Initialized in [src/lib/supabase.ts](src/lib/supabase.ts)

**Database Tables** (referenced in contexts):
- `me_metrics` - Metric definitions
- `me_monthly_targets` - Monthly metric targets
- `me_metric_values` - Actual metric values
- `me_teams` - Team information
- `me_action_plans` - Action plans
- `me_root_cause_analyses` - Root cause analysis records

**Custom Hooks**: Business logic is extracted into hooks:
- `useMetrics` - Metric operations
- `useActionPlans` - Action plan operations
- `useAreas` - Area filtering
- `useTeams` - Team data
- `useRootCause` - Root cause analysis
- `useLigacoes`, `useLigacoesAgregadas`, `useOperadorTimeBreakdown` - Hunter/Individual data

### TypeScript Types

Core type definitions in [src/types/](src/types/):

- [metric.ts](src/types/metric.ts) - `Metric`, `MetricValue`, `MonthlyTarget`, metric areas
- [actionPlan.ts](src/types/actionPlan.ts) - `ActionPlan`, `ActionPlanComment`
- [rootCauseAnalysis.ts](src/types/rootCauseAnalysis.ts) - `RootCauseAnalysis`, `FiveWhysLevel`, `IshikawaCause`
- [team.ts](src/types/team.ts) - Team structure

## Design System

The application strictly follows ClubPetro's visual identity:

- **Primary Color**: `#F26600` (orange) - defined throughout Tailwind classes
- **Typography**: Montserrat (headings), Open Sans (body)
- **Styling**: Tailwind CSS with custom configuration
- **Components**: Elevated cards with shadows, 8px border radius, smooth transitions

When modifying UI components, maintain consistency with the existing ClubPetro branding.

## Key Domain Concepts

**Metric Areas**: Marketing, Comercial, Hunter, Contratos, Redes Sociais, Site

**Monthly Targets**: Metrics support both a general target and month-specific targets stored as `MonthlyTarget[]` in format `"YYYY-MM"`

**Action Plans**: Can be linked to metrics for recovery actions when metrics fall below targets

**Root Cause Analysis**: Supports two methodologies:
- **5 Whys**: Iterative questioning (up to 5 levels)
- **Ishikawa (Fishbone)**: 6M categories (Método, Material, Máquina, Mão de obra, Medição, Meio Ambiente)

**Individual Performance**: Hunter-specific tables with operator-level tracking, time breakdowns, and drill-down expansion views

## Common Patterns

### Adding a New Context

1. Create context in `src/contexts/YourContext.tsx`
2. Export provider component and custom hook
3. Add provider to [AppProviders.tsx](src/contexts/AppProviders.tsx) in appropriate nesting order
4. Use the custom hook in components: `const { ... } = useYourContext()`

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in [App.tsx](src/App.tsx)
3. Add navigation link in [Sidebar.tsx](src/components/layout/Sidebar.tsx)
4. Ensure page is wrapped in `ProtectedRoute` if authentication is required

### Working with Supabase

- Always use the initialized `supabase` client from `src/lib/supabase.ts`
- Handle errors from Supabase operations
- Use `.select()` with joins to fetch related data in one query
- Transform snake_case database columns to camelCase in application code

### Form Handling

Forms use `react-hook-form` with `zod` for validation. See [MetricForm.tsx](src/components/metrics/MetricForm.tsx) or [ActionPlanForm.tsx](src/components/action-plans/ActionPlanForm.tsx) for examples.
