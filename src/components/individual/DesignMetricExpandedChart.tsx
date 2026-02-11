import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { X } from 'lucide-react';

interface DesignMetricExpandedChartProps {
  metricName: string;
  periodData: Array<{
    periodLabel: string;
    pontuacao: number;
    quantidade: number;
    percentualNoPrazo: number;
  }>;
  onClose: () => void;
  metricType: 'pontuacao' | 'quantidade' | 'percentualNoPrazo';
}

export const DesignMetricExpandedChart: React.FC<DesignMetricExpandedChartProps> = ({
  metricName,
  periodData,
  onClose,
  metricType,
}) => {
  // Preparar dados para o gráfico
  const chartData = periodData.map((pd) => ({
    period: pd.periodLabel,
    pontuacao: pd.pontuacao,
    quantidade: pd.quantidade,
    percentualNoPrazo: pd.percentualNoPrazo,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-border shadow-card">
          <p className="text-sm font-semibold text-text-primary mb-2">
            {data.period}
          </p>
          <p className="text-sm text-text-primary font-medium">
            Pontuação: {data.pontuacao.toFixed(2)}
          </p>
          <p className="text-sm text-text-primary font-medium">
            Quantidade: {data.quantidade}
          </p>
          <p className="text-sm text-text-primary font-medium">
            % no prazo: {data.percentualNoPrazo.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcular estatísticas
  const pontuacoes = chartData.map(d => d.pontuacao);
  const quantidades = chartData.map(d => d.quantidade);
  const percentuais = chartData.map(d => d.percentualNoPrazo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary bg-opacity-5 border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Evolução: {metricName}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Gráfico de evolução ao longo do período selecionado
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white transition-all duration-200 border border-border"
            >
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="period"
                stroke="#718096"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                yAxisId="left"
                stroke="#718096"
                style={{ fontSize: '12px' }}
                label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#718096"
                style={{ fontSize: '12px' }}
                label={{
                  value: metricType === 'pontuacao' ? 'Pontuação' : metricType === 'percentualNoPrazo' ? '% no prazo' : 'Pontuação',
                  angle: 90,
                  position: 'insideRight'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="quantidade"
                fill="#F26600"
                fillOpacity={0.6}
                name="Quantidade"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={metricType === 'pontuacao' ? 'pontuacao' : metricType === 'quantidade' ? 'quantidade' : 'percentualNoPrazo'}
                stroke="#F26600"
                strokeWidth={2}
                dot={{ fill: '#F26600', r: 4 }}
                activeDot={{ r: 6 }}
                name={metricName}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Stats summary */}
        <div className="border-t border-border bg-bg-secondary p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Pontuação Stats */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Pontuação</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Mínimo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.min(...pontuacoes).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Máximo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.max(...pontuacoes).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Média</p>
                  <p className="text-lg font-bold text-text-primary">
                    {(pontuacoes.reduce((sum, v) => sum + v, 0) / pontuacoes.length).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Total</p>
                  <p className="text-lg font-bold text-text-primary">
                    {pontuacoes.reduce((sum, v) => sum + v, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantidade Stats */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Quantidade</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Mínimo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.min(...quantidades)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Máximo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.max(...quantidades)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Média</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.round(quantidades.reduce((sum, v) => sum + v, 0) / quantidades.length)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Total</p>
                  <p className="text-lg font-bold text-text-primary">
                    {quantidades.reduce((sum, v) => sum + v, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* % no prazo Stats */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">% no prazo</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Mínimo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.min(...percentuais).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Máximo</p>
                  <p className="text-lg font-bold text-text-primary">
                    {Math.max(...percentuais).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Média</p>
                  <p className="text-lg font-bold text-text-primary">
                    {(percentuais.reduce((sum, v) => sum + v, 0) / percentuais.length).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">-</p>
                  <p className="text-lg font-bold text-text-primary">
                    -
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
