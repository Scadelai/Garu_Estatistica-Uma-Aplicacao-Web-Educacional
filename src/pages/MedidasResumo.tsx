import { useMemo, useState } from 'react';
import { Grid, Paper, Title, Text, Slider, RangeSlider, Button, Code, Group, SegmentedControl, Divider } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  mean,
  median,
  sampleVariance,
  quartiles,
  iqr,
} from '../utils/statistics';
import FormulaBlock from '../components/FormulaBlock';
import CollapsibleSection from '../components/CollapsibleSection';
import { useSummaryStore } from '../stores/useSummaryStore';
import { formatBR } from '../utils/formatting';

const BAR_COLOR = '#4c6ef5';
const MEAN_COLOR = '#e03131';

export default function MedidasResumo() {
  const { elements, count, min, max, type, setCount, setRange, setType, generate } = useSummaryStore();
  const [bins, setBins] = useState<number>(10);

  const sorted = useMemo(() => [...elements].sort((a, b) => a - b), [elements]);
  const n = sorted.length;

  const meanVal = useMemo(() => mean(sorted), [sorted]);
  const medianVal = useMemo(() => median(sorted), [sorted]);
  const q = useMemo(() => quartiles(sorted), [sorted]);
  const iqrVal = useMemo(() => iqr(sorted), [sorted]);
  const sampVar = useMemo(() => sampleVariance(sorted), [sorted]);
  const sampSd = useMemo(() => Math.sqrt(sampVar), [sampVar]);
  const minVal = sorted[0];
  const maxVal = sorted[n - 1];
  const amplitude = maxVal - minVal;

  const freqData = useMemo(() => {
    if (type === 'continuous') return [];
    const freq = new Map<number, number>();
    for (const v of sorted) {
      freq.set(v, (freq.get(v) || 0) + 1);
    }
    const data: { value: number; count: number }[] = [];
    for (let i = min; i <= max; i++) {
      data.push({ value: i, count: freq.get(i) || 0 });
    }
    return data;
  }, [sorted, min, max, type]);

  const histogramData = useMemo(() => {
    if (type === 'discrete' || sorted.length === 0) return [];
    const binWidth = (max - min) / bins;
    const data: { interval: string; count: number; from: number; to: number; mid: number }[] = [];
    for (let i = 0; i < bins; i++) {
      const from = min + i * binWidth;
      const to = min + (i + 1) * binWidth;
      const cnt = sorted.filter((v) =>
        i === bins - 1 ? v >= from && v <= to : v >= from && v < to,
      ).length;
      data.push({
        interval: `${formatBR(from, 1)} - ${formatBR(to, 1)}`,
        count: cnt,
        from,
        to,
        mid: (from + to) / 2
      });
    }
    return data;
  }, [sorted, bins, min, max, type]);

  const sortedStrDisplay = useMemo(() => {
    if (type === 'continuous') {
      return sorted.map(v => formatBR(v, 2)).join(', ');
    }
    return sorted.join(', ');
  }, [sorted, type]);

  const meanExample = useMemo(() => {
    const sumStr = type === 'continuous' ? sorted.map(v => formatBR(v, 2)).join(' + ') : sorted.join(' + ');
    const total = sorted.reduce((s, v) => s + v, 0);
    return `Média = (${sumStr})/${n} = ${formatBR(total, 2)}/${n} = ${formatBR(meanVal, 2)}`;
  }, [sorted, n, meanVal, type]);

  const medianExample = useMemo(() => {
    const sortedStr = sortedStrDisplay;
    if (n % 2 === 1) {
      const midIdx = Math.floor(n / 2);
      return `Valores ordenados: ${sortedStr}\nPosição central: ${midIdx + 1}a observação\nMediana = ${formatBR(sorted[midIdx], type === 'continuous' ? 2 : 0)}`;
    }
    const midIdx1 = n / 2 - 1;
    const midIdx2 = n / 2;
    const val1 = sorted[midIdx1];
    const val2 = sorted[midIdx2];
    return `Valores ordenados: ${sortedStr}\nPosições centrais: ${midIdx1 + 1}a e ${midIdx2 + 1}a observações\nMediana = (${formatBR(val1, type === 'continuous' ? 2 : 0)} + ${formatBR(val2, type === 'continuous' ? 2 : 0)})/2 = ${formatBR(medianVal, 2)}`;
  }, [sortedStrDisplay, sorted, n, medianVal, type]);

  const varianceExample = useMemo(() => {
    const deviations = sorted.map((v) => `(${formatBR(v, type === 'continuous' ? 2 : 0)} - ${formatBR(meanVal, 2)})²`).join(' + ');
    return `Variância = [${deviations}] / ${n - 1} = ${formatBR(sampVar, 4)}`;
  }, [sorted, n, meanVal, sampVar, type]);

  return (
    <PageWrapper size="xl">

      <Grid gutter="lg">
        {/* Left column: Element Generator */}
        <Grid.Col span={6}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={4} mb="sm">
              Gerador de Elementos
            </Title>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              Gere um conjunto de elementos aleatórios para explorar as medidas resumo. Ajuste a
              quantidade de elementos, o intervalo de valores possíveis e o tipo de variável, e clique em &ldquo;Gerar
              Elementos&rdquo; para criar uma nova amostra.
            </Text>

            <Group mb="md" grow>
              <SegmentedControl
                color="cyan"
                radius="md"
                size="md"
                value={type}
                onChange={(v) => setType(v as 'discrete' | 'continuous')}
                data={[
                  { label: 'Discreta', value: 'discrete' },
                  { label: 'Contínua', value: 'continuous' },
                ]}
              />
            </Group>

            <Text size="sm" fw={600} mb="xs">
              Elementos gerados:
            </Text>
            <Code block mb="md" style={{ maxHeight: 120, overflowY: 'auto' }}>
              {`{${sortedStrDisplay}}`}
            </Code>

            <Text size="sm" fw={500} mb={4}>
              Quantidade de Elementos (Tamanho da Amostra): {count}
            </Text>
            <Slider
              min={4}
              max={40}
              value={count}
              onChange={(val) => setCount(val)}
              mb="md"
              marks={[
                { value: 4, label: '4' },
                { value: 20, label: '20' },
                { value: 40, label: '40' },
              ]}
            />

            <Text size="sm" fw={500} mb={4}>
              Valores entre: [{formatBR(min, 0)}, {formatBR(max, 0)}]
            </Text>
            <RangeSlider
              min={1}
              max={100}
              minRange={0}
              value={[min, max]}
              onChange={([lo, hi]) => setRange(lo, hi)}
              mb="md"
              marks={[
                { value: 1, label: '1' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
            />

            {type === 'continuous' && (
              <>
                <Text size="sm" fw={500} mb={4}>
                  Numero de classes (bins): {bins}
                </Text>
                <Slider
                  min={3}
                  max={20}
                  value={bins}
                  onChange={setBins}
                  mb="md"
                  marks={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                  ]}
                />
              </>
            )}

            <Group mb="lg">
              <Button onClick={generate}>Gerar Elementos</Button>
            </Group>

            <Title order={5} mb="sm">
              {type === 'discrete' ? 'Frequência Absoluta dos Valores' : 'Histograma'}
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={type === 'discrete' ? freqData : histogramData} 
                margin={{ top: 25, right: 10, left: 10, bottom: 20 }}
                barCategoryGap={type === 'continuous' ? 0 : '10%'}
              >
                {type === 'discrete' ? (
                  <XAxis 
                    dataKey="value" 
                    type="number" 
                    domain={[min - 1, max + 1]} 
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Valor', position: 'insideBottom', offset: -5, style: { fontSize: 13, fill: '#333' } }}
                  />
                ) : (
                  <XAxis 
                    dataKey="interval" 
                    tick={{ fontSize: 11, dy: 5 }} 
                    tickMargin={5} 
                    angle={-15} 
                    textAnchor="end" 
                    interval={0} 
                    height={50}
                    label={{ value: 'Intervalo', position: 'insideBottom', offset: -5, style: { fontSize: 13, fill: '#333' } }}
                  />
                )}
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Frequência Absoluta', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 13, fill: '#333' } }}
                />
                <Tooltip
                   formatter={(value: any) => [value, 'Frequência Absoluta']}
                   labelFormatter={(label: any) => type === 'discrete' ? `Valor: ${label}` : `Intervalo: ${label}`}
                />
                <ReferenceLine
                  x={type === 'discrete' ? meanVal : undefined}
                  stroke={MEAN_COLOR}
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={type === 'discrete' ? { value: `Média: ${formatBR(meanVal, 2)}`, position: 'top', fill: MEAN_COLOR, fontSize: 13, dy: -5 } : undefined}
                />
                <Bar 
                  dataKey="count" 
                  name="Frequência Absoluta" 
                  barSize={type === 'discrete' ? 16 : undefined}
                  stroke={type === 'continuous' ? '#fff' : 'none'}
                  fill={BAR_COLOR}
                />
              </BarChart>
            </ResponsiveContainer>
            <Text size="xs" c="dimmed" ta="center">
               {type === 'discrete' 
                 ? 'Média pontilhada em vermelho.' 
                 : 'Distribuição dos valores contínuos em classes.'}
            </Text>
          </Paper>
        </Grid.Col>

        {/* Right column: Summary Measures */}
        <Grid.Col span={6}>
          {/* SECTION 1: Medidas de Posição */}
          <Title order={4} mb="sm" c="cyan.7">Medidas de Posição</Title>
          <Grid gutter="sm">
            {/* Média */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Média</Title>
                <Text fw={700} size="lg" mb="xs">{meanVal.toFixed(2)}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    A média aritmética é a soma dos valores das observações dividido pela quantidade
                    de observações.
                  </Text>
                  <FormulaBlock formula={String.raw`\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_{i}`} />
                  <Code block mt="xs" style={{ whiteSpace: 'pre-wrap' }}>{meanExample}</Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Mediana */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Mediana</Title>
                <Text fw={700} size="lg" mb="xs">{medianVal.toFixed(2)}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    A mediana é o valor que ocupa a posição central dos dados ordenados. Se o número
                    de observações for ímpar, a mediana é o valor central. Se for par, é a média dos
                    dois valores centrais.
                  </Text>
                  {n % 2 === 1 ? (
                    <FormulaBlock formula={String.raw`\tilde{x} = x_{\frac{n+1}{2}}`} />
                  ) : (
                    <FormulaBlock formula={String.raw`\tilde{x} = \frac{x_{\frac{n}{2}} + x_{\frac{n}{2} + 1}}{2}`} />
                  )}
                  <Code block mt="xs" style={{ whiteSpace: 'pre-wrap' }}>{medianExample}</Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Quartis */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Quartis</Title>
                <Text fw={700} size="lg" mb="xs">
                  Q1={q.q1.toFixed(2)}, Q3={q.q3.toFixed(2)}
                </Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    Os quartis dividem os dados ordenados em quatro partes iguais. O primeiro quartil
                    (Q1) é o valor abaixo do qual estão 25% das observações, e o terceiro quartil (Q3) é o valor abaixo do qual
                    estão 75% das observações.
                  </Text>
                  <Code block>
                    {`Q1 = ${q.q1.toFixed(2)}\nQ3 = ${q.q3.toFixed(2)}`}
                  </Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Mínimo */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Mínimo</Title>
                <Text fw={700} size="lg" mb="xs">{minVal}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">Observação de menor valor.</Text>
                  <Code block>Mínimo = {minVal}</Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Máximo */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Máximo</Title>
                <Text fw={700} size="lg" mb="xs">{maxVal}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">Observação de maior valor.</Text>
                  <Code block>Máximo = {maxVal}</Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>
          </Grid>

          <Divider my="lg" />

          {/* SECTION 2: Medidas de Dispersão */}
          <Title order={4} mb="sm" c="cyan.7">Medidas de Dispersão</Title>
          <Grid gutter="sm">
            {/* Amplitude */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Amplitude</Title>
                <Text fw={700} size="lg" mb="xs">{amplitude}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    A amplitude é a diferença entre o maior e o menor valor observado. É a medida de
                    dispersão mais simples.
                  </Text>
                  <Code block>
                    {`Amplitude = ${maxVal} - ${minVal} = ${amplitude}`}
                  </Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Distância Interquartílica */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Dist. Interquartílica</Title>
                <Text fw={700} size="lg" mb="xs">{iqrVal.toFixed(2)}</Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    A distância interquartílica (dQ) é a diferença entre o terceiro e o primeiro
                    quartil. Ela representa a amplitude dos 50% centrais dos dados, sendo uma medida
                    de dispersão robusta a valores extremos.
                  </Text>
                  <FormulaBlock formula={String.raw`d_Q = Q_3 - Q_1`} />
                  <Code block mt="xs">
                    {`dQ = ${q.q3.toFixed(2)} - ${q.q1.toFixed(2)} = ${iqrVal.toFixed(2)}`}
                  </Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Variância (Amostral only) */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Variância</Title>
                <Text fw={700} size="lg" mb="xs">
                  {sampVar.toFixed(4)}
                </Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    A variância amostral indica o quão distantes os valores
                    estão da média, dividindo a soma dos desvios quadráticos por (n−1).
                  </Text>
                  <FormulaBlock formula={String.raw`s^2 = \frac{\sum_{i=1}^{n} (x_{i} - \bar{x})^{2}}{n-1}`} />
                  <Code block mt="xs" style={{ whiteSpace: 'pre-wrap' }}>{varianceExample}</Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>

            {/* Desvio Padrão (Amostral only) */}
            <Grid.Col span={6}>
              <Paper shadow="xs" p="sm" withBorder>
                <Title order={5} mb={4}>Desvio Padrão</Title>
                <Text fw={700} size="lg" mb="xs">
                  {sampSd.toFixed(4)}
                </Text>
                <CollapsibleSection title="Detalhes">
                  <Text size="sm" mb="xs">
                    O desvio padrão é a raiz quadrada da variância. Tem a vantagem de estar na mesma
                    unidade de medida dos dados originais, facilitando a interpretação.
                  </Text>
                  <FormulaBlock formula={String.raw`s = \sqrt{s^2} = \sqrt{Var(X)}`} />
                  <Code block mt="xs">
                    {`Desvio Padrão = sqrt(${sampVar.toFixed(4)}) = ${sampSd.toFixed(4)}`}
                  </Code>
                </CollapsibleSection>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>

      <Text size="xs" c="dimmed" mt="lg" mb="md">
        Fonte: Morettin, P. and Bussab, W. (2000). Estatística Básica (7a. ed.). Editora Saraiva.
      </Text>
    </PageWrapper>
  );
}
