import { useState, useMemo } from 'react';
import { Container, Grid, Paper, Title, Text, NumberInput, Select, Tabs } from '@mantine/core';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { dt, pt, qt } from '../../utils/distributions';
import { mean, sampleStdDev } from '../../utils/statistics';
import { formatBR, formatPValue } from '../../utils/formatting';

const REJECTION_COLOR = '#0c7bdc';
const ACCEPT_COLOR = '#bcbcbc';

interface GenericTesteTProps {
  dataset: Record<string, string | number | null>[];
  numericCols: string[];
  factorCols: string[];
}

export default function GenericTesteT({ dataset, numericCols, factorCols }: GenericTesteTProps) {
  // Tab 1: 1 Sample
  const [col1, setCol1] = useState<string>(numericCols[0] || '');
  const [mu0, setMu0] = useState<number>(0);
  const [alpha1, setAlpha1] = useState<number>(0.05);

  // Tab 2: 2 Samples (Paired)
  const [col2A, setCol2A] = useState<string>(numericCols[0] || '');
  const [col2B, setCol2B] = useState<string>(numericCols[1] || numericCols[0] || '');
  const [alpha2, setAlpha2] = useState<number>(0.05);

  // Tab 3: 2 Samples (Independent)
  const [col3Num, setCol3Num] = useState<string>(numericCols[0] || '');
  const [col3Fac, setCol3Fac] = useState<string>(factorCols[0] || '');
  const [alpha3, setAlpha3] = useState<number>(0.05);

  // --- Tab 1 Computations ---
  const tab1 = useMemo(() => {
    if (!col1 || dataset.length === 0) return null;
    const values = dataset.map((d) => Number(d[col1])).filter((v) => !isNaN(v));
    const n = values.length;
    if (n < 2) return null;

    const xbar = mean(values);
    const sd = sampleStdDev(values);
    const se = sd / Math.sqrt(n);
    const df = n - 1;

    const tObs = (xbar - mu0) / se;
    const pValue = 2 * (1 - pt(Math.abs(tObs), df));
    
    // Critical t values
    const tCritLow = qt(alpha1 / 2, df);
    const tCritHigh = qt(1 - alpha1 / 2, df);
    const rejected = tObs <= tCritLow || tObs >= tCritHigh;

    // We plot the standard T distribution for T-score
    const xMin = -5;
    const xMax = 5;
    const step = (xMax - xMin) / 300;
    const data: any[] = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = dt(x, df);
      const inReject = x <= tCritLow || x >= tCritHigh;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }

    return { n, xbar, sd, tObs, pValue, tCritLow, tCritHigh, rejected, df, data };
  }, [dataset, col1, mu0, alpha1]);

  // --- Tab 2 Computations ---
  const tab2 = useMemo(() => {
    if (!col2A || !col2B || dataset.length === 0) return null;
    const diffs: number[] = [];
    for (const row of dataset) {
      const v1 = Number(row[col2A]);
      const v2 = Number(row[col2B]);
      if (!isNaN(v1) && !isNaN(v2)) {
        diffs.push(v1 - v2);
      }
    }
    const n = diffs.length;
    if (n < 2) return null;

    const dBar = mean(diffs);
    const sdD = sampleStdDev(diffs);
    const se = sdD / Math.sqrt(n);
    const df = n - 1;

    const tObs = dBar / se;
    const pValue = 2 * (1 - pt(Math.abs(tObs), df));

    const tCritLow = qt(alpha2 / 2, df);
    const tCritHigh = qt(1 - alpha2 / 2, df);
    const rejected = tObs <= tCritLow || tObs >= tCritHigh;

    const xMin = -5;
    const xMax = 5;
    const step = (xMax - xMin) / 300;
    const data: any[] = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = dt(x, df);
      const inReject = x <= tCritLow || x >= tCritHigh;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }

    return { n, dBar, sdD, tObs, pValue, tCritLow, tCritHigh, rejected, df, data };
  }, [dataset, col2A, col2B, alpha2]);

  const tab3 = useMemo<any>(() => {
    if (!col3Num || !col3Fac || dataset.length === 0) return null;
    const g1: number[] = [];
    const g2: number[] = [];
    const groupNames: string[] = [];

    for (const row of dataset) {
      const v = Number(row[col3Num]);
      const f = String(row[col3Fac] ?? '').trim();
      if (!isNaN(v) && f !== '' && f !== 'null' && f !== 'undefined') {
        if (!groupNames.includes(f)) {
          if (groupNames.length < 2) groupNames.push(f);
          else continue;
        }
        if (f === groupNames[0]) g1.push(v);
        else if (f === groupNames[1]) g2.push(v);
      }
    }
    
    const allUniqueGroups = new Set();
    for (const row of dataset) {
      const f = String(row[col3Fac] ?? '').trim();
      if (f !== '' && f !== 'null' && f !== 'undefined' && !isNaN(Number(row[col3Num]))) allUniqueGroups.add(f);
    }

    if (allUniqueGroups.size !== 2) {
       return { error: true, msg: 'A variável qualitativa selecionada deve ter exatamente 2 categorias.' };
    }
    
    if (g1.length < 2 || g2.length < 2) {
       return { error: true, msg: 'Ambas as categorias precisam ter pelo menos 2 valores numéricos.' };
    }

    const n1 = g1.length;
    const n2 = g2.length;
    const mean1 = mean(g1);
    const mean2 = mean(g2);
    const var1 = Math.pow(sampleStdDev(g1), 2);
    const var2 = Math.pow(sampleStdDev(g2), 2);
    const df = n1 + n2 - 2;

    const sp2 = ((n1 - 1) * var1 + (n2 - 1) * var2) / df;
    const se = Math.sqrt(sp2 * (1/n1 + 1/n2));

    const tObs = (mean1 - mean2) / se;
    const pValue = 2 * (1 - pt(Math.abs(tObs), df));

    const tCritLow = qt(alpha3 / 2, df);
    const tCritHigh = qt(1 - alpha3 / 2, df);
    const rejected = tObs <= tCritLow || tObs >= tCritHigh;

    const xMin = -5;
    const xMax = 5;
    const step = (xMax - xMin) / 300;
    const data: any[] = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = dt(x, df);
      const inReject = x <= tCritLow || x >= tCritHigh;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }

    return { error: false, n1, n2, mean1, mean2, groupNames, tObs, pValue, tCritLow, tCritHigh, rejected, df, data };
  }, [dataset, col3Num, col3Fac, alpha3]);

  if (numericCols.length === 0) {
    return <Text c="dimmed">Por favor, carregue dados numéricos para executar o Teste T.</Text>;
  }

  return (
    <Container fluid px={0}>
      <Tabs defaultValue="1amostra">
        <Tabs.List grow mb="md">
          <Tabs.Tab value="1amostra">Uma Amostra</Tabs.Tab>
          <Tabs.Tab value="2amostras" disabled={numericCols.length < 2}>Amostras Pareadas</Tabs.Tab>
          <Tabs.Tab value="independente" disabled={numericCols.length === 0 || factorCols.length === 0}>Amostras Independentes</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="1amostra">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Parâmetros (Uma Amostra)</Title>
                <Select
                  label="Selecione a Variável Numérica"
                  data={numericCols}
                  value={col1}
                  onChange={(v) => v && setCol1(v)}
                  searchable
                  mb="sm"
                />
                <NumberInput
                  label="Média Hipotética (μ₀)"
                  value={mu0}
                  onChange={(v) => setMu0(Number(v))}
                  mb="sm"
                />
                <NumberInput
                  label="Nível de Significância (α)"
                  value={alpha1}
                  onChange={(v) => setAlpha1(Number(v))}
                  step={0.01}
                  min={0.01}
                  max={0.2}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              {tab1 ? (
                <Paper shadow="xs" p="md" withBorder>
                  <Title order={5} mb="md" ta="center">Resultados do Teste T</Title>
                  <Grid mb="md">
                    <Grid.Col span={6}>
                      <Text size="sm"><b>n:</b> {tab1.n}</Text>
                      <Text size="sm"><b>Média (<span style={{textDecoration: 'overline'}}>x</span>):</b> {formatBR(tab1.xbar, 3)}</Text>
                      <Text size="sm"><b>Desvio Padrão (s):</b> {formatBR(tab1.sd, 3)}</Text>
                      <Text size="sm"><b>Graus de liberdade (df):</b> {tab1.df}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm"><b>Estatística t (tObs):</b> {formatBR(tab1.tObs, 3)}</Text>
                      <Text size="sm"><b>Região Crítica:</b> (-∞, {formatBR(tab1.tCritLow, 3)}] ∪ [{formatBR(tab1.tCritHigh, 3)}, +∞)</Text>
                      <Text size="sm">
                        <b>P-valor:</b> {formatPValue(tab1.pValue, 3)}{' '}
                        {tab1.rejected ? (
                          <Text span fw={700} c="red">(Rejeita H₀)</Text>
                        ) : (
                          <Text span fw={700} c="green">(Aceita H₀)</Text>
                        )}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={tab1.data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        tickFormatter={(v) => formatBR(v, 1)}
                        label={{ value: 't', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis label={{ value: 'Densidade', angle: -90, position: 'insideLeft', offset: 10 }} width={80} />
                      <Tooltip formatter={(v: any) => formatBR(v, 3)} labelFormatter={(l: any) => `t = ${formatBR(l, 3)}`} />
                      <Area type="monotone" dataKey="accept" name="Aceitação" stroke={ACCEPT_COLOR} fill={ACCEPT_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                      <Area type="monotone" dataKey="rejection" name="Rejeição" stroke={REJECTION_COLOR} fill={REJECTION_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                      <ReferenceLine x={tab1.tObs} stroke="red" strokeWidth={2} label={{ value: 'tObs', position: 'top', fill: 'red' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              ) : (
                <Text c="dimmed">Dados insuficientes para calcular.</Text>
              )}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="2amostras">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Parâmetros (Amostras Pareadas)</Title>
                <Select
                  label="Variável Numérica A"
                  data={numericCols}
                  value={col2A}
                  onChange={(v) => v && setCol2A(v)}
                  searchable
                  mb="sm"
                />
                <Select
                  label="Variável Numérica B"
                  data={numericCols}
                  value={col2B}
                  onChange={(v) => v && setCol2B(v)}
                  searchable
                  mb="sm"
                />
                <NumberInput
                  label="Nível de Significância (α)"
                  value={alpha2}
                  onChange={(v) => setAlpha2(Number(v))}
                  step={0.01}
                  min={0.01}
                  max={0.2}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              {tab2 ? (
                <Paper shadow="xs" p="md" withBorder>
                  <Title order={5} mb="md" ta="center">Resultados (Teste T Pareado)</Title>
                  <Grid mb="md">
                    <Grid.Col span={6}>
                      <Text size="sm"><b>n (pares):</b> {tab2.n}</Text>
                      <Text size="sm"><b>Média das Diferenças (<span style={{textDecoration: 'overline'}}>d</span>):</b> {formatBR(tab2.dBar, 3)}</Text>
                      <Text size="sm"><b>Desvio Padrão Diff (s_d):</b> {formatBR(tab2.sdD, 3)}</Text>
                      <Text size="sm"><b>Graus de liberdade (df):</b> {tab2.df}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="sm"><b>Estatística t (tObs):</b> {formatBR(tab2.tObs, 3)}</Text>
                      <Text size="sm"><b>Região Crítica:</b> (-∞, {formatBR(tab2.tCritLow, 3)}] ∪ [{formatBR(tab2.tCritHigh, 3)}, +∞)</Text>
                      <Text size="sm">
                        <b>P-valor:</b> {formatPValue(tab2.pValue, 3)}{' '}
                        {tab2.rejected ? (
                          <Text span fw={700} c="red">(Rejeita H₀: μ_diff = 0)</Text>
                        ) : (
                          <Text span fw={700} c="green">(Aceita H₀: μ_diff = 0)</Text>
                        )}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={tab2.data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        tickFormatter={(v) => formatBR(v, 1)}
                        label={{ value: 't', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis label={{ value: 'Densidade', angle: -90, position: 'insideLeft', offset: 10 }} width={80} />
                      <Tooltip formatter={(v: any) => formatBR(v, 3)} labelFormatter={(l: any) => `t = ${formatBR(l, 3)}`} />
                      <Area type="monotone" dataKey="accept" name="Aceitação" stroke={ACCEPT_COLOR} fill={ACCEPT_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                      <Area type="monotone" dataKey="rejection" name="Rejeição" stroke={REJECTION_COLOR} fill={REJECTION_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                      <ReferenceLine x={tab2.tObs} stroke="red" strokeWidth={2} label={{ value: 'tObs', position: 'top', fill: 'red' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              ) : (
                <Text c="dimmed">Dados insuficientes para pares. Verifique se as duas seleções têm valores.</Text>
              )}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="independente">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Parâmetros (Independentes)</Title>
                <Select
                  label="Variável Numérica (Medida)"
                  data={numericCols}
                  value={col3Num}
                  onChange={(v) => v && setCol3Num(v)}
                  searchable
                  mb="sm"
                />
                <Select
                  label="Variável Qualitativa (Grupos)"
                  data={factorCols}
                  value={col3Fac}
                  onChange={(v) => v && setCol3Fac(v)}
                  searchable
                  mb="sm"
                />
                <NumberInput
                  label="Nível de Significância (α)"
                  value={alpha3}
                  onChange={(v) => setAlpha3(Number(v))}
                  step={0.01}
                  min={0.01}
                  max={0.2}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              {tab3 ? (
                tab3.error ? (
                  <Text c="red">{tab3.msg}</Text>
                ) : (
                  <Paper shadow="xs" p="md" withBorder>
                    <Title order={5} mb="md" ta="center">Resultados (Teste T Independente)</Title>
                    <Grid mb="md">
                      <Grid.Col span={6}>
                        <Text size="sm"><b>Grupos:</b> {tab3.groupNames[0]} ({tab3.n1}) vs {tab3.groupNames[1]} ({tab3.n2})</Text>
                        <Text size="sm"><b>Médias (<span style={{textDecoration: 'overline'}}>x</span>):</b> {formatBR(tab3.mean1, 3)} vs {formatBR(tab3.mean2, 3)}</Text>
                        <Text size="sm"><b>Graus de liberdade (df):</b> {tab3.df}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm"><b>Estatística t (tObs):</b> {formatBR(tab3.tObs, 3)}</Text>
                        <Text size="sm"><b>Região Crítica:</b> (-∞, {formatBR(tab3.tCritLow, 3)}] ∪ [{formatBR(tab3.tCritHigh, 3)}, +∞)</Text>
                        <Text size="sm">
                          <b>P-valor:</b> {formatPValue(tab3.pValue, 3)}{' '}
                          {tab3.rejected ? (
                            <Text span fw={700} c="red">(Rejeita H₀: μ1 = μ2)</Text>
                          ) : (
                            <Text span fw={700} c="green">(Aceita H₀: μ1 = μ2)</Text>
                          )}
                        </Text>
                      </Grid.Col>
                    </Grid>

                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={tab3.data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="x"
                          type="number"
                          tickFormatter={(v) => formatBR(v, 1)}
                          label={{ value: 't', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis label={{ value: 'Densidade', angle: -90, position: 'insideLeft', offset: 10 }} width={80} />
                        <Tooltip formatter={(v: any) => formatBR(Number(v), 3)} labelFormatter={(l: any) => `t = ${formatBR(Number(l), 3)}`} />
                        <Area type="monotone" dataKey="accept" name="Aceitação" stroke={ACCEPT_COLOR} fill={ACCEPT_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                        <Area type="monotone" dataKey="rejection" name="Rejeição" stroke={REJECTION_COLOR} fill={REJECTION_COLOR} fillOpacity={0.6} isAnimationActive={false} />
                        <ReferenceLine x={tab3.tObs} stroke="red" strokeWidth={2} label={{ value: 'tObs', position: 'top', fill: 'red' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                )
              ) : (
                <Text c="dimmed">Dados insuficientes. Selecione as variáveis.</Text>
              )}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
