# Funcionalidade War Room

## Descrição

A funcionalidade **War Room** permite processar transcrições de reuniões de análise de métricas usando inteligência artificial (Claude da Anthropic). A IA extrai automaticamente insights, itens de ação, métricas discutidas e gera um resumo executivo completo.

## Como Usar

### 1. Acessar o War Room

Na página de métricas por área, clique no botão **"War Room"** 👥 no cabeçalho.

### 2. Criar Nova Transcrição

Na aba **"Nova Transcrição"**:

1. **Título**: Nome descritivo da reunião (ex: "War Room Semanal - Marketing")
2. **Data da Reunião**: Data em que a reunião aconteceu (opcional)
3. **Transcrição**: Cole o texto completo da transcrição da reunião

### 3. Analisar com IA

Clique em **"Analisar com IA"** ✨ e aguarde alguns segundos. A IA irá processar a transcrição e extrair:

#### 📄 Resumo Executivo
Um resumo conciso (2-3 parágrafos) da reunião, capturando os pontos principais discutidos.

#### 💡 Insights Principais
Lista de 3-7 insights chave extraídos da discussão, identificando padrões e oportunidades.

#### ✅ Itens de Ação
Lista completa de ações identificadas, com:
- **Descrição**: O que precisa ser feito
- **Responsável**: Quem ficou responsável (se mencionado)
- **Prazo**: Quando deve ser concluído (se mencionado)
- **Prioridade**: Alta (🔴), Média (🟡) ou Baixa (🟢)

#### 📊 Métricas Discutidas
Métricas mencionadas na reunião com:
- Nome da métrica
- Valor atual
- Meta/objetivo
- Observações sobre a métrica

### 4. Visualizar Histórico

Na aba **"Histórico"**, você pode:
- Ver todas as transcrições anteriores
- Clicar em uma transcrição para visualizar sua análise
- Excluir transcrições antigas

## Dicas para Melhores Resultados

### Qualidade da Transcrição

Quanto mais detalhada e clara a transcrição, melhor será a análise da IA:

✅ **BOM**:
```
João: "Olhando a métrica de conversão do site, estamos em 2,5%,
mas nossa meta era 4%. Precisamos investigar o que está acontecendo
no funil. Maria, você pode fazer uma análise até sexta-feira?"

Maria: "Sim, vou analisar os dados e preparar um relatório.
Acredito que pode ser um problema no checkout."
```

❌ **RUIM**:
```
conversao baixa
maria vai ver
```

### Estrutura Recomendada

Para resultados otimizados, estruture suas transcrições com:

1. **Contexto inicial**: Objetivo da reunião
2. **Discussão de métricas**: Valores, metas, comparações
3. **Identificação de problemas**: O que não está funcionando
4. **Decisões tomadas**: Ações definidas com responsáveis
5. **Próximos passos**: Prazos e follow-ups

### Ferramentas de Transcrição

Recomendamos usar ferramentas de transcrição automática:
- **Google Meet**: Transcrição automática (se habilitada)
- **Microsoft Teams**: Transcrição em tempo real
- **Otter.ai**: Transcrição e resumo de reuniões
- **Fireflies.ai**: Transcrição com análise
- **Rev.com**: Serviço de transcrição profissional

## Estrutura do Banco de Dados

### Tabela `me_war_room_transcripts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `area` | TEXT | Área das métricas (Marketing, Comercial, etc.) |
| `team_id` | UUID | ID do time (opcional) |
| `title` | TEXT | Título da reunião |
| `transcript` | TEXT | Transcrição completa |
| `meeting_date` | DATE | Data da reunião |
| `analysis` | TEXT | Resumo executivo gerado pela IA |
| `key_insights` | JSONB | Array de insights principais |
| `action_items` | JSONB | Array de itens de ação |
| `metrics_discussed` | JSONB | Array de métricas discutidas |
| `created_by` | UUID | ID do usuário criador |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## Políticas de Segurança (RLS)

- ✅ Todos os usuários autenticados podem **visualizar** todas as transcrições
- ✅ Todos os usuários autenticados podem **criar** transcrições
- ✅ Apenas o **autor** pode **editar** ou **deletar** suas transcrições

## Componentes Criados

### Frontend
- `src/components/metrics/WarRoomModal.tsx` - Modal principal com 3 abas
- `src/hooks/useWarRoom.ts` - Hook para gerenciar transcrições
- `src/services/aiService.ts` - Função `analyzeWarRoomTranscript()`
- `src/types/warRoom.ts` - Tipos TypeScript

### Backend (Supabase)
- Migração: `create_war_room_transcripts` - Cria tabela e políticas

## Custos de IA

A funcionalidade usa o modelo **Claude 3.5 Sonnet**:
- **~$0.01 - $0.02 por transcrição** (depende do tamanho)
- Transcrições longas (>5000 palavras) podem custar mais
- Cobrado diretamente na sua conta Anthropic

### Estimativa de Custos

| Tamanho da Reunião | Palavras | Custo Aproximado |
|-------------------|----------|------------------|
| Curta (15 min) | ~1.500 | $0.005 |
| Média (30 min) | ~3.000 | $0.010 |
| Longa (60 min) | ~6.000 | $0.020 |
| Muito longa (2h) | ~12.000 | $0.040 |

## Solução de Problemas

### "Chave API da Anthropic não configurada"
- Adicione `VITE_ANTHROPIC_API_KEY` no arquivo `.env`
- Reinicie o servidor de desenvolvimento

### "Erro ao analisar transcrição"
- Verifique sua conexão com internet
- Confirme que sua chave API é válida
- Verifique se tem créditos suficientes na Anthropic

### Transcrição muito longa
- A IA suporta até ~100.000 caracteres
- Se sua transcrição for maior, divida em partes menores
- Foque nas partes mais relevantes da reunião

### IA não identificou todas as ações
- Certifique-se que as ações foram claramente mencionadas
- Use linguagem direta: "João vai fazer X até sexta"
- Edite a transcrição para ser mais explícita se necessário

## Diferenças entre War Room e Notas de Análise

| Recurso | War Room | Notas de Análise |
|---------|----------|------------------|
| **Entrada** | Transcrição completa | Notas individuais |
| **Formato** | Texto longo estruturado | Múltiplas notas curtas |
| **Análise** | Extrai ações, métricas, insights | Resume observações |
| **Uso** | Reuniões gravadas/transcritas | Anotações durante análise |
| **Output** | 4 seções estruturadas | Resumo + ações sugeridas |

**Use War Room quando**: Você tem uma reunião gravada e quer extrair todos os detalhes

**Use Notas quando**: Você está analisando métricas e fazendo anotações ao longo do tempo

## Melhorias Futuras

Possíveis melhorias:
- [ ] Upload de arquivo de áudio para transcrição automática
- [ ] Integração com calendário para agendar War Rooms
- [ ] Exportar análise em PDF
- [ ] Criar planos de ação automaticamente a partir dos itens
- [ ] Comparar métricas discutidas com valores reais do sistema
- [ ] Notificações de follow-up para itens de ação
- [ ] Dashboard de progresso dos itens de ação
- [ ] Integração com Slack/Teams para compartilhar resumos

## Exemplo de Uso Completo

### Entrada (Transcrição):

```
War Room Semanal - Marketing Digital
Data: 05/02/2026

João (CMO): "Bom dia a todos. Vamos revisar as métricas da semana.
Maria, como estão nossos números de conversão?"

Maria (Analista): "Temos 2.347 visitas no site esta semana, uma alta
de 15% comparado à semana passada. A taxa de conversão está em 2,5%,
mas nossa meta era 4%. Identificamos que o problema está no checkout,
onde 60% dos usuários abandonam o carrinho."

João: "Isso é crítico. Pedro, você consegue fazer uma análise detalhada
do funil de conversão até quinta-feira?"

Pedro (Dev): "Sim, vou implementar tracking adicional e preparar um
relatório. Também vou revisar a performance da página de checkout."

Maria: "Além disso, o custo por lead aumentou de R$ 45 para R$ 58.
Precisamos revisar nossa estratégia de ads."

João: "Perfeito. Maria, prioridade alta para otimizar as campanhas.
Vamos nos reunir novamente na sexta para revisar o progresso."
```

### Saída (Análise da IA):

**📄 Resumo Executivo**
```
A reunião focou na análise de métricas de marketing digital, identificando
uma performance mista: crescimento positivo de 15% em visitas, mas taxa de
conversão abaixo da meta (2,5% vs 4%) e aumento no custo por lead (R$ 45
para R$ 58). O principal problema identificado foi a alta taxa de abandono
no checkout (60%), indicando necessidade urgente de otimização técnica e
revisão da estratégia de anúncios.
```

**💡 Insights Principais**
- Crescimento saudável de tráfego (+15%) indica que atração está funcionando
- Taxa de abandono de 60% no checkout é crítica e representa perda significativa de receita
- Aumento de 29% no CPL sugere que eficiência das campanhas precisa ser revisada
- Problema parece ser de conversão, não de atração

**✅ Itens de Ação**
1. 🔴 **Alta**: Análise detalhada do funil de conversão
   - Responsável: Pedro
   - Prazo: Quinta-feira

2. 🔴 **Alta**: Implementar tracking adicional no checkout
   - Responsável: Pedro
   - Prazo: Quinta-feira

3. 🔴 **Alta**: Otimizar campanhas de ads para reduzir CPL
   - Responsável: Maria
   - Prazo: Sexta-feira

4. 🟡 **Média**: Reunião de follow-up
   - Responsável: João
   - Prazo: Sexta-feira

**📊 Métricas Discutidas**
1. **Visitas no Site**
   - Atual: 2.347
   - Variação: +15% vs semana anterior

2. **Taxa de Conversão**
   - Atual: 2,5%
   - Meta: 4,0%
   - Observação: 60% de abandono no checkout

3. **Custo por Lead**
   - Atual: R$ 58
   - Anterior: R$ 45
   - Observação: Aumento de 29% requer atenção
```

---

**Documentação completa**: Ver também [NOTAS_ANALISE_README.md](NOTAS_ANALISE_README.md) para a funcionalidade de Notas de Análise.
