# Funcionalidade de Notas de Análise com IA

## Descrição

Esta funcionalidade permite que você colete notas e observações durante a análise de métricas e, em seguida, use inteligência artificial (Claude da Anthropic) para gerar um resumo estruturado e sugestões de ações práticas.

## Como Usar

### 1. Acessar as Notas

Na página de métricas por área (ex: `/metrics/area/Marketing`), clique no botão **"Notas"** no cabeçalho da página.

### 2. Adicionar Notas

No modal que se abre:
1. Digite suas observações e insights no campo de texto
2. Clique em **"Adicionar Nota"**
3. Repita o processo para adicionar quantas notas desejar

### 3. Gerar Resumo com IA

Após adicionar suas notas:
1. Clique no botão **"Resumir com IA"** (ícone ✨)
2. Aguarde alguns segundos enquanto a IA processa suas notas
3. O resumo será exibido com:
   - **Análise**: Um resumo estruturado das principais observações
   - **Ações Sugeridas**: Lista de 3-5 ações concretas e práticas

### 4. Visualizar Resumos Anteriores

O sistema mantém um histórico dos últimos 5 resumos gerados. Você pode clicar em qualquer resumo anterior para visualizá-lo novamente.

### 5. Gerenciar Notas

- Para **excluir** uma nota, clique no ícone de lixeira ao lado dela
- Apenas o autor da nota pode excluí-la

## Configuração

### Variáveis de Ambiente

Para que a funcionalidade de IA funcione, você precisa configurar sua chave de API da Anthropic:

1. Acesse [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Crie uma nova chave de API
3. Adicione a chave no arquivo `.env`:

```env
VITE_ANTHROPIC_API_KEY=sua_chave_aqui
```

4. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Custos

A funcionalidade usa o modelo **Claude 3.5 Sonnet**, que tem os seguintes custos aproximados:
- ~$0.003 por resumo (baseado em 5-10 notas)
- Os custos são cobrados diretamente pela Anthropic na sua conta

## Estrutura do Banco de Dados

A funcionalidade cria duas novas tabelas no Supabase:

### `me_metric_analysis_notes`
Armazena as notas individuais:
- `id`: UUID da nota
- `area`: Área da métrica (Marketing, Comercial, etc.)
- `team_id`: ID do time (opcional)
- `note`: Texto da nota
- `created_by`: ID do usuário que criou
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### `me_metric_analysis_summaries`
Armazena os resumos gerados pela IA:
- `id`: UUID do resumo
- `area`: Área analisada
- `team_id`: ID do time (opcional)
- `summary`: Texto do resumo
- `suggested_actions`: Array JSON com ações sugeridas
- `notes_used_count`: Quantidade de notas usadas
- `created_by`: ID do usuário que gerou
- `created_at`: Data de criação

## Políticas de Segurança (RLS)

Ambas as tabelas têm Row Level Security habilitado:
- Todos os usuários autenticados podem **visualizar** todas as notas e resumos
- Todos os usuários autenticados podem **criar** notas e resumos
- Apenas o **autor** pode **editar** ou **deletar** suas próprias notas

## Componentes Criados

### Frontend
- `src/components/metrics/AnalysisNotesModal.tsx` - Modal principal
- `src/hooks/useAnalysisNotes.ts` - Hook para gerenciar notas
- `src/services/aiService.ts` - Integração com API da Anthropic
- `src/types/analysisNote.ts` - Definições de tipos TypeScript

### Backend (Supabase)
- Migração: `create_metric_analysis_notes` - Cria tabelas e políticas

## Solução de Problemas

### "Chave API da Anthropic não configurada"
- Verifique se você adicionou `VITE_ANTHROPIC_API_KEY` no arquivo `.env`
- Reinicie o servidor de desenvolvimento após adicionar a chave

### "Erro ao gerar resumo com IA"
- Verifique sua conexão com a internet
- Confirme que sua chave de API é válida
- Verifique se você tem créditos suficientes na sua conta Anthropic

### Notas não aparecem
- Verifique se você está autenticado
- Confirme que as políticas RLS estão ativas no Supabase
- Verifique o console do navegador para erros

## Melhorias Futuras

Possíveis melhorias que podem ser implementadas:
- [ ] Edição de notas existentes
- [ ] Categorização de notas (Problema, Oportunidade, Insight, etc.)
- [ ] Exportação de resumos em PDF
- [ ] Compartilhamento de resumos via link
- [ ] Notificações quando novos resumos são gerados
- [ ] Integração com planos de ação (criar automaticamente a partir das ações sugeridas)
