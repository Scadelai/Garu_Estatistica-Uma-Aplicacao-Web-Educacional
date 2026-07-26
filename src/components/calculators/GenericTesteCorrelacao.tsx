import { useState, useMemo } from 'react';
import { Container, Grid, Paper, Title, Text, Select, Stack } from '@mantine/core';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { DARK_CYAN, MEDIUM_CYAN } from '../../utils/colors';
import { pearsonCorrelation, spearmanCorrelation, mean, shapiroWilk } from '../../utils/statistics';
import { pt, qnorm } from '../../utils/distributions';
import { formatBR, formatPValue } from '../../utils/formatting';

interface GenericTesteCorrelacaoProps {
  dataset: any[];
  numericCols: string[];
}

export default function GenericTesteCorrelacao({ dataset, numericCols }: GenericTesteCorrelacaoProps) {
  const [method, setMethod] = useState<string>('Pearson');
  const [varX, setVarX] = useState<string>(numericCols[0] || '');
  const [varY, setVarY] = useState<string>(numericCols[1] || numericCols[0] || '');
  const [alpha, setAlpha] = useState<number>(0.05);


  const xyPairs = useMemo(() => {
    if (!varX || !varY || dataset.length === 0) return { xVals: [], yVals: [] };
    const xVals: number[] = [];
    const yVals: number[] = [];
    dataset.forEach(d => {
      const x = d[varX];
      const y = d[varY];
      if (x !== null && x !== undefined && !isNaN(Number(x)) &&
          y !== null && y !== undefined && !isNaN(Number(y))) {
        xVals.push(Number(x));
        yVals.push(Number(y));
      }
    });
    return { xVals, yVals };
  }, [dataset, varX, varY]);

  const { xVals, yVals } = xyPairs;
  const n = xVals.length;

  const r = useMemo(() => {
    if (n < 3) return 0;
    return method === 'Pearson'
      ? pearsonCorrelation(xVals, yVals)
      : spearmanCorrelation(xVals, yVals);
  }, [method, xVals, yVals, n]);

  const tStat = useMemo(() => {
    if (n < 3 || Math.abs(r) === 1) return 0;
    return (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  }, [r, n]);
  
  const df = Math.max(1, n - 2);
  const pValue = useMemo(() => {
    if (n < 3) return 1;
    return 2 * (1 - pt(Math.abs(tStat), df));
  }, [tStat, df, n]);

  const { ciLower, ciUpper } = useMemo(() => {
    if (n < 4 || Math.abs(r) === 1) return { ciLower: null, ciUpper: null };
    const z = 0.5 * Math.log((1 + r) / (1 - r));
    const se = 1 / Math.sqrt(n - 3);
    const zAlpha = qnorm(1 - alpha / 2);
    
    const zLower = z - zAlpha * se;
    const zUpper = z + zAlpha * se;
    
    const lower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
    const upper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);
    
    return { ciLower: lower, ciUpper: upper };
  }, [r, n, alpha]);

  const swX = useMemo(() => {
    if (n < 3) return null;
    return shapiroWilk(xVals);
  }, [xVals, n]);

  const swY = useMemo(() => {
    if (n < 3) return null;
    return shapiroWilk(yVals);
  }, [yVals, n]);

  const chartData = useMemo(() => {
    return xVals.map((x, i) => ({ x, y: yVals[i] }));
  }, [xVals, yVals]);

  const xMean = useMemo(() => mean(xVals), [xVals]);
  const yMean = useMemo(() => mean(yVals), [yVals]);

  if (numericCols.length < 2) {
    return (
      <Paper shadow="xs" p="md" withBorder>
        <Text c="red">São necessárias pelo menos duas variáveis numéricas para este teste.</Text>
      </Paper>
    );
  }

  return (
    <Container size="xl" px={0}>
      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              A correlação mede a força e a direção da relação linear ou monotônica entre duas
              variáveis numéricas contínuas.
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label="Método"
                  data={['Pearson', 'Spearman']}
                  value={method}
                  onChange={(val) => val && setMethod(val)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label="Nível de Sig. (α)"
                  data={[
                    { value: '0.01', label: '1%' },
                    { value: '0.05', label: '5%' },
                    { value: '0.10', label: '10%' },
                  ]}
                  value={alpha.toString()}
                  onChange={(val) => val && setAlpha(Number(val))}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label="Variável X"
                  data={numericCols.map((c) => ({ value: c, label: c }))}
                  value={varX}
                  onChange={(val) => val && setVarX(val)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label="Variável Y"
                  data={numericCols.map((c) => ({ value: c, label: c }))}
                  value={varY}
                  onChange={(val) => val && setVarY(val)}
                />
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack style={{ height: '100%' }}>
            <Paper shadow="xs" p="md" withBorder style={{ flex: 1 }}>
              <Title order={5} mb="sm">Resultados ({method})</Title>
              {n < 3 ? (
                <Text c="dimmed">Pontos insuficientes válidos para cálculo (min: 3).</Text>
              ) : (
                <>
                  <Text size="md" mb={4}>Correlação (r): <b>{formatBR(r, 3)}</b></Text>
                  {ciLower !== null && ciUpper !== null && (
                    <Text size="sm" mb={4} c="dimmed">
                      IC ({(1 - alpha) * 100}%): [{formatBR(ciLower, 3)}; {formatBR(ciUpper, 3)}]
                    </Text>
                  )}
                  <Text size="md" fw={600} mt="md" c={pValue < alpha ? DARK_CYAN : 'dimmed'}>
                    P-Valor = {formatPValue(pValue, 3)}
                  </Text>
                </>
              )}
            </Paper>

            <Paper shadow="xs" p="md" withBorder style={{ flex: 1 }}>
              <Title order={5} mb="sm">Teste de Normalidade (Shapiro-Wilk)</Title>
              {n < 3 ? (
                <Text c="dimmed">Amostra insuficiente.</Text>
              ) : (
                <>
                  <Text size="sm" fw={600} mb={2}>{varX}:</Text>
                  <Text size="sm" mb={4}>W: {formatBR(swX?.W || 0, 3)} | P: <span style={{ color: (swX?.pValue || 0) < alpha ? 'red' : DARK_CYAN }}>{formatPValue(swX?.pValue || 0, 3)}</span></Text>
                  
                  <Text size="sm" fw={600} mt="sm" mb={2}>{varY}:</Text>
                  <Text size="sm" mb={4}>W: {formatBR(swY?.W || 0, 3)} | P: <span style={{ color: (swY?.pValue || 0) < alpha ? 'red' : DARK_CYAN }}>{formatPValue(swY?.pValue || 0, 3)}</span></Text>

                  <Text size="xs" c="dimmed" mt="md" lh={1.2}>
                    (P-Valor &lt; {alpha} indica que os dados não seguem uma distribuição normal, sendo recomendado o teste de Spearman).
                  </Text>
                </>
              )}
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Gráfico de Dispersão</Title>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name={varX} type="number" domain={['auto', 'auto']} tickFormatter={(v) => formatBR(v, 1)} label={{ value: varX, position: 'insideBottom', offset: -10, style: { fontSize: 13, fill: '#333' } }} height={50} />
                <YAxis dataKey="y" name={varY} type="number" domain={['auto', 'auto']} tickFormatter={(v) => formatBR(v, 1)} label={{ value: varY, angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 13, fill: '#333' } }} width={80} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value: any, name: any) => [formatBR(Number(value), 3), name]}
                />
                <Scatter data={chartData} fill={MEDIUM_CYAN}>
                  {chartData.map((e, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        e.x > xMean && e.y > yMean
                          ? '#ff6b6b'
                          : e.x <= xMean && e.y <= yMean
                          ? '#ff6b6b'
                          : MEDIUM_CYAN
                      }
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}