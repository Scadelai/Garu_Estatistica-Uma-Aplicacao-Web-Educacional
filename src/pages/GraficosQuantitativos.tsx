import { useState, useMemo } from 'react';
import { Grid, Paper, Title, Text, Select, Slider } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { COLORFUL, DARK_CYAN } from '../utils/colors';
import { quartiles, iqr, mean } from '../utils/statistics';
import { formatBR } from '../utils/formatting';
import { dadosSaudeAlimentacao, NUMERIC_COLUMNS } from '../data/dadosSaudeAlimentacao';
import { getNumericValues } from '../data';

const DISCRETE_VARS = ['Ano letivo', 'Percepção de Saúde'];

export default function GraficosQuantitativos() {
  const [selectedCol, setSelectedCol] = useState<string>('Peso');
  const [bins, setBins] = useState<number>(10);

  const values = useMemo(
    () => getNumericValues(dadosSaudeAlimentacao, selectedCol),
    [selectedCol],
  );

  const isDiscrete = DISCRETE_VARS.includes(selectedCol);

  // Discrete frequency data
  const discreteData = useMemo(() => {
    if (!isDiscrete) return [];
    const freq = new Map<number, number>();
    for (const v of values) {
      freq.set(v, (freq.get(v) || 0) + 1);
    }
    const keys = [...freq.keys()].sort((a, b) => a - b);
    const total = values.length;
    return keys.map((k) => ({ 
      value: String(k), 
      count: freq.get(k) || 0,
      relative: (freq.get(k) || 0) / total
    }));
  }, [values, isDiscrete]);

  // Histogram data for continuous vars
  const histogramData = useMemo(() => {
    if (isDiscrete || values.length === 0) return [];
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const binWidth = (maxVal - minVal) / bins;
    const data: { interval: string; count: number; from: number; to: number }[] = [];
    for (let i = 0; i < bins; i++) {
      const from = minVal + i * binWidth;
      const to = minVal + (i + 1) * binWidth;
      const count = values.filter((v) =>
        i === bins - 1 ? v >= from && v <= to : v >= from && v < to,
      ).length;
      data.push({
        interval: `${formatBR(from, 1)} - ${formatBR(to, 1)}`,
        count,
        from,
        to,
      });
    }
    return data;
  }, [values, bins, isDiscrete]);

  // Boxplot computations
  const boxplotStats = useMemo(() => {
    if (values.length === 0) return null;
    const q = quartiles(values);
    const iqrVal = iqr(values);
    const lowerFence = q.q1 - 1.5 * iqrVal;
    const upperFence = q.q3 + 1.5 * iqrVal;
    const sorted = [...values].sort((a, b) => a - b);
    const whiskerLow = sorted.find((v) => v >= lowerFence) ?? sorted[0];
    const whiskerHigh = [...sorted].reverse().find((v) => v <= upperFence) ?? sorted[sorted.length - 1];
    const outliers = values.filter((v) => v < lowerFence || v > upperFence);
    const meanVal = mean(values);
    return { q, whiskerLow, whiskerHigh, outliers, meanVal, min: sorted[0], max: sorted[sorted.length - 1] };
  }, [values]);

  // SVG boxplot rendering
  const renderBoxplot = () => {
    if (!boxplotStats) return null;
    const { q, whiskerLow, whiskerHigh, outliers, meanVal, min: dataMin, max: dataMax } = boxplotStats;
    const svgW = 600;
    const svgH = 100;
    const padL = 90;
    const padR = 40;
    const plotW = svgW - padL - padR;
    const plotMinVal = Math.min(dataMin, whiskerLow) - 1;
    const plotMaxVal = Math.max(dataMax, whiskerHigh) + 1;
    const scale = (v: any) => padL + ((v - plotMinVal) / (plotMaxVal - plotMinVal)) * plotW;

    const boxY = 25;
    const boxH = 50;

    return (
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxHeight: 120 }}>
        {/* Variable Name label */}
        <text x={padL - 10} y={boxY + boxH / 2} dy=".3em" textAnchor="end" fontSize={12} fill="#333" fontWeight="bold">
          {selectedCol}
        </text>
        {/* Whisker line */}
        <line
          x1={scale(whiskerLow)}
          y1={boxY + boxH / 2}
          x2={scale(whiskerHigh)}
          y2={boxY + boxH / 2}
          stroke="#333"
          strokeWidth={1.5}
        />
        {/* Left whisker cap */}
        <line
          x1={scale(whiskerLow)}
          y1={boxY + 10}
          x2={scale(whiskerLow)}
          y2={boxY + boxH - 10}
          stroke="#333"
          strokeWidth={1.5}
        />
        {/* Right whisker cap */}
        <line
          x1={scale(whiskerHigh)}
          y1={boxY + 10}
          x2={scale(whiskerHigh)}
          y2={boxY + boxH - 10}
          stroke="#333"
          strokeWidth={1.5}
        />
        {/* Box */}
        <rect
          x={scale(q.q1)}
          y={boxY}
          width={scale(q.q3) - scale(q.q1)}
          height={boxH}
          fill={DARK_CYAN}
          opacity={0.35}
          stroke={DARK_CYAN}
          strokeWidth={2}
        />
        {/* Median line */}
        <line
          x1={scale(q.q2)}
          y1={boxY}
          x2={scale(q.q2)}
          y2={boxY + boxH}
          stroke="#e03131"
          strokeWidth={2.5}
        />
        {/* Mean dot */}
        <circle cx={scale(meanVal)} cy={boxY + boxH / 2} r={4} fill="#e03131" />
        {/* Outliers */}
        {outliers.map((o, i) => (
          <circle key={i} cx={scale(o)} cy={boxY + boxH / 2} r={3.5} fill="orange" stroke="#333" strokeWidth={0.5} />
        ))}
        {/* Labels */}
        <text x={scale(whiskerLow)} y={boxY - 4} textAnchor="middle" fontSize={9} fill="#555">
          {formatBR(whiskerLow, 1)}
        </text>
        <text x={scale(q.q1)} y={boxY + boxH + 14} textAnchor="middle" fontSize={9} fill="#555">
          Q1={formatBR(q.q1, 2)}
        </text>
        <text x={scale(q.q2)} y={boxY - 4} textAnchor="middle" fontSize={9} fill="#e03131">
          Md={formatBR(q.q2, 2)}
        </text>
        <text x={scale(q.q3)} y={boxY + boxH + 14} textAnchor="middle" fontSize={9} fill="#555">
          Q3={formatBR(q.q3, 2)}
        </text>
        <text x={scale(whiskerHigh)} y={boxY - 4} textAnchor="middle" fontSize={9} fill="#555">
          {formatBR(whiskerHigh, 1)}
        </text>
      </svg>
    );
  };

  return (
    <PageWrapper size="xl">

      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              Selecione uma variavel quantitativa para visualizar sua distribuicao. Variaveis discretas
              sao exibidas como graficos de barras de contagem, enquanto variaveis continuas sao exibidas
              como histogramas com numero de classes ajustavel.
            </Text>
            <Select
              label="Variavel quantitativa"
              data={NUMERIC_COLUMNS.map((c) => ({ value: c, label: c }))}
              value={selectedCol}
              onChange={(val) => val && setSelectedCol(val)}
              mb="md"
              w={320}
            />
            {!isDiscrete && (
              <>
                <Text size="sm" fw={500} mb={4}>
                  Numero de classes (bins): {bins}
                </Text>
                <Slider
                  min={5}
                  max={20}
                  value={bins}
                  onChange={setBins}
                  mb="md"
                  w={320}
                  marks={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 15, label: '15' },
                    { value: 20, label: '20' },
                  ]}
                />
              </>
            )}
          </Paper>
        </Grid.Col>

        {/* Chart */}
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              {isDiscrete ? 'Grafico de Barras (Contagem)' : 'Histograma'}
            </Title>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={isDiscrete ? discreteData : histogramData}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                barCategoryGap={isDiscrete ? '10%' : 0}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={isDiscrete ? 'value' : 'interval'}
                  angle={isDiscrete ? 0 : -35}
                  textAnchor={isDiscrete ? 'middle' : 'end'}
                  interval={0}
                  tick={{ fontSize: 11, dy: isDiscrete ? 5 : 10 }}
                  tickMargin={isDiscrete ? 0 : 5}
                  height={90}
                  label={{ value: selectedCol, position: 'insideBottom', offset: -5, style: { fontSize: 14, fill: '#333' } }}
                />
                <YAxis
                  allowDecimals={false}
                  label={{ value: 'Frequência Absoluta', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 14, fill: '#333' } }}
                />
                <Tooltip formatter={(value: any) => [value, 'Frequência Absoluta']} />
                <Bar dataKey="count" name="Frequência Absoluta" fill={COLORFUL[0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>

        {/* Boxplot */}
        <Grid.Col span={isDiscrete ? 6 : 12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Boxplot - {selectedCol}
            </Title>
            <Text size="sm" mb="sm" c="dimmed">
              O boxplot mostra a mediana (linha vermelha), quartis (caixa), bigodes (whiskers) e outliers
              (pontos laranjas).
            </Text>
            {renderBoxplot()}
            {boxplotStats && (
              <Text size="xs" c="dimmed" mt="xs">
                Media: {formatBR(boxplotStats.meanVal, 2)} | Mediana: {formatBR(boxplotStats.q.q2, 2)} |
                Q1: {formatBR(boxplotStats.q.q1, 2)} | Q3: {formatBR(boxplotStats.q.q3, 2)} |
                Outliers: {boxplotStats.outliers.length}
              </Text>
            )}
          </Paper>
        </Grid.Col>

        {/* Histograma Relativo para Variáveis Discretas */}
        {isDiscrete && (
          <Grid.Col span={6}>
            <Paper shadow="xs" p="md" withBorder>
              <Title order={5} mb="sm">
                Histograma
              </Title>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={discreteData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                  barCategoryGap={0}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="value"
                    interval={0}
                    tick={{ fontSize: 11, dy: 5 }}
                    tickMargin={5}
                    height={60}
                    label={{ value: selectedCol, position: 'insideBottom', offset: -5, style: { fontSize: 14, fill: '#333' } }}
                  />
                  <YAxis
                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                    label={{ value: 'Frequência Relativa', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 14, fill: '#333' } }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${(value * 100).toFixed(1).replace('.', ',')}%`, 'Frequência Relativa']}
                  />
                  <Bar dataKey="relative" name="Frequencia Relativa" fill={COLORFUL[0]} stroke="#333" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>
        )}
      </Grid>
    </PageWrapper>
  );
}
