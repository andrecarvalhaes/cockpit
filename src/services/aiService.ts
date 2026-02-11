import Anthropic from '@anthropic-ai/sdk';
import { AISummaryResponse } from '../types/analysisNote';
import { WarRoomAnalysisResponse } from '../types/warRoom';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Necessário para uso no browser
});

export async function summarizeAnalysisNotes(
  notes: string[],
  area: string
): Promise<AISummaryResponse> {
  if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
    throw new Error('Chave API da Anthropic não configurada. Configure VITE_ANTHROPIC_API_KEY no arquivo .env');
  }

  if (notes.length === 0) {
    throw new Error('Nenhuma nota fornecida para resumir');
  }

  const prompt = `Você é um assistente especializado em análise de métricas de marketing e comercial.

Área analisada: ${area}

Notas e observações coletadas durante a análise:
${notes.map((note, index) => `${index + 1}. ${note}`).join('\n')}

Com base nessas notas, forneça:

1. Um resumo conciso e estruturado das principais observações (2-3 parágrafos)
2. Uma lista de ações sugeridas (3-5 ações concretas e práticas)

Formato da resposta (JSON):
{
  "summary": "Resumo estruturado das observações...",
  "suggestedActions": [
    "Ação 1 específica e acionável",
    "Ação 2 específica e acionável",
    "Ação 3 específica e acionável"
  ]
}

Seja objetivo, prático e focado em insights acionáveis.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Resposta inesperada da API');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON da resposta da IA');
    }

    const result = JSON.parse(jsonMatch[0]) as AISummaryResponse;

    // Validar estrutura da resposta
    if (!result.summary || !Array.isArray(result.suggestedActions)) {
      throw new Error('Formato de resposta inválido da IA');
    }

    return result;
  } catch (error) {
    console.error('Erro ao chamar API da Anthropic:', error);

    if (error instanceof Error) {
      throw new Error(`Erro ao gerar resumo com IA: ${error.message}`);
    }

    throw new Error('Erro desconhecido ao gerar resumo com IA');
  }
}

export async function analyzeWarRoomTranscript(
  transcript: string,
  area: string,
  meetingDate?: Date
): Promise<WarRoomAnalysisResponse> {
  if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
    throw new Error('Chave API da Anthropic não configurada. Configure VITE_ANTHROPIC_API_KEY no arquivo .env');
  }

  if (!transcript.trim()) {
    throw new Error('Transcrição vazia');
  }

  const dateStr = meetingDate ? new Date(meetingDate).toLocaleDateString('pt-BR') : 'não informada';

  const prompt = `Você é um especialista em análise de reuniões de War Room focadas em métricas de marketing e comercial.

Área: ${area}
Data da reunião: ${dateStr}

Transcrição da reunião:
"""
${transcript}
"""

Por favor, analise esta transcrição e forneça:

1. **Análise Geral**: Um resumo executivo da reunião (2-3 parágrafos)
2. **Insights-chave**: Lista de 3-7 insights principais extraídos da discussão
3. **Itens de Ação**: Lista de ações identificadas com responsável (se mencionado), prazo (se mencionado) e prioridade
4. **Métricas Discutidas**: Métricas mencionadas na reunião com valores atuais, metas e observações

Formato da resposta (JSON):
{
  "analysis": "Resumo executivo da reunião...",
  "keyInsights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ],
  "actionItems": [
    {
      "description": "Descrição da ação",
      "responsible": "Nome do responsável ou null",
      "deadline": "Prazo em formato legível ou null",
      "priority": "high | medium | low"
    }
  ],
  "metricsDiscussed": [
    {
      "metricName": "Nome da métrica",
      "currentValue": 100,
      "targetValue": 150,
      "observation": "Observação sobre a métrica"
    }
  ]
}

Seja preciso, objetivo e extraia o máximo de valor da transcrição. Se alguma informação não estiver disponível na transcrição, use null ou omita o campo.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Resposta inesperada da API');
    }

    // Extrair JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON da resposta da IA');
    }

    const result = JSON.parse(jsonMatch[0]) as WarRoomAnalysisResponse;

    // Validar estrutura da resposta
    if (!result.analysis || !Array.isArray(result.keyInsights)) {
      throw new Error('Formato de resposta inválido da IA');
    }

    return result;
  } catch (error) {
    console.error('Erro ao chamar API da Anthropic:', error);

    if (error instanceof Error) {
      throw new Error(`Erro ao analisar transcrição: ${error.message}`);
    }

    throw new Error('Erro desconhecido ao analisar transcrição');
  }
}
