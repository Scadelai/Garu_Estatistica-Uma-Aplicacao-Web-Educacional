import { useState, useMemo } from 'react';
import { Grid, Paper, Title, Text, NumberInput, Slider, Button, Tabs, Table } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
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
import { dnorm, pnorm, qnorm, dt, pt, qt, rnorm } from '../utils/distributions';
import { mean, sampleStdDev } from '../utils/statistics';
import { formatBR } from '../utils/formatting';
import { MEDIUM_CYAN } from '../utils/colors';

const REJECTION_COLOR = '#0c7bdc';
const ACCEPT_COLOR = '#bcbcbc';

export default function TesteT() {
  // --- Tab 1: Uma amostra ---
  const [mu0, setMu0] = useState(0);
  const [sigma0, setSigma0] = useState(1);
  const [xbar, setXbar] = useState(0.18);
  const [n1, setN1] = useState(10);
  const [alpha1, setAlpha1] = useState(0.05);
  const [ran1, setRan1] = useState(false);

  // --- Tab 2: Duas populacoes dependentes ---
  const [mu1, setMu1] = useState(10);
  const [sd1, setSd1] = useState(2.2);
  const [mu2, setMu2] = useState(9);
  const [sd2, setSd2] = useState(2.2);
  const [n2, setN2] = useState(20);
  const [alpha2, setAlpha2] = useState(0.05);
  const [sample1, setSample1] = useState<number[]>([]);
  const [sample2, setSample2] = useState<number[]>([]);
  const [ran2, setRan2] = useState(false);

  // ===== Tab 1 computations =====
  const tab1 = useMemo(() => {
    const se = sigma0 / Math.sqrt(n1);
    const rc1 = qnorm(alpha1 / 2, mu0, se);
    const rc2 = qnorm(1 - alpha1 / 2, mu0, se);
    
    // Calcula P-valor normal padrao usando zObs, como no R internamente
    const zObs = (xbar - mu0) / se;
    const pValue = 2 * (1 - pnorm(Math.abs(zObs), 0, 1));
    const rejected = xbar <= rc1 || xbar >= rc2;

    // Curve data usa o xMin e xMax como x verdadeiro
    const xMin = mu0 - 4 * sigma0;
    const xMax = mu0 + 4 * sigma0;
    const step = (xMax - xMin) / 300;
    const data: { x: number; y: number; rejection: number | null; accept: number | null }[] = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = dnorm(x, mu0, se);
      const inReject = x <= rc1 || x >= rc2;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }

    return { se, xObs: xbar, zObs, rc1, rc2, pValue, rejected, data };
  }, [mu0, sigma0, xbar, n1, alpha1]);

  // ===== Tab 2 computations =====
  const tab2 = useMemo(() => {
    if (!ran2 || sample1.length === 0) return null;
    const diffs = sample1.map((v, i) => v - sample2[i]);
    const dBar = mean(diffs);
    const sdD = sampleStdDev(diffs);
    const se = sdD / Math.sqrt(n2);
    const tObs = dBar / se;
    const df = n2 - 1;
    const tCrit = qt(1 - alpha2 / 2, df);
    const pValue = 2 * (1 - pt(Math.abs(tObs), df));
    const rejected = Math.abs(tObs) > tCrit;

    // Curve data for t distribution
    const xMin = -6; // Same as R version bounds
    const xMax = 6;
    const step = (xMax - xMin) / 300;
    const data: { x: number; y: number; rejection: number | null; accept: number | null }[] = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = dt(x, df);
      const inReject = x <= -tCrit || x >= tCrit;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }

    return { diffs, dBar, sdD, se, tObs, df, tCrit, pValue, rejected, data, tableData: diffs.slice(0, 10) };
  }, [ran2, sample1, sample2, n2, alpha2]);

  const handleGenerate1 = () => setRan1(true);

  const handleGenerate2 = () => {
    setSample1(rnorm(n2, mu1, sd1));
    setSample2(rnorm(n2, mu2, sd2));
    setRan2(true);
  };

  return (
    <PageWrapper size="xl">

      <Tabs defaultValue="uma">
        <Tabs.List mb="md">
          <Tabs.Tab value="uma">Uma amostra</Tabs.Tab>
          <Tabs.Tab value="dep">Duas populacoes dependentes</Tabs.Tab>
        </Tabs.List>

        {/* ============ Tab 1 ============ */}
        <Tabs.Panel value="uma">
          <Grid gutter="lg">
            <Grid.Col span={4}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Parametros</Title>
                <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
                  Teste Z para uma amostra, onde se conhece o desvio padrao populacional. Verifica se a
                  media amostral difere significativamente da media hipotetica (mu_0).
                </Text>
                <NumberInput label="Media sob H0 (mu_0)" value={mu0} onChange={(v) => setMu0(Number(v) || 0)} mb="xs" step={0.1} />
                <NumberInput label="Desvio padrao (sigma)" value={sigma0} onChange={(v) => setSigma0(Math.max(0.01, Number(v) || 1))} mb="xs" step={0.1} min={0.01} />
                <NumberInput label="Media amostral (x-barra)" value={xbar} onChange={(v) => setXbar(Number(v) || 0)} mb="xs" step={0.01} />
                <NumberInput label="Tamanho da amostra (n)" value={n1} onChange={(v) => setN1(Math.max(2, Number(v) || 10))} mb="xs" min={2} />
                <Text size="sm" fw={500} mb={4}>Nivel de significancia (alpha): {formatBR(alpha1, 2)}</Text>
                <Slider min={0.01} max={0.1} step={0.01} value={alpha1} onChange={setAlpha1} mb="md" />
                <Button onClick={handleGenerate1} fullWidth>Calcular</Button>

                {ran1 && (
                  <>
                    <Text size="sm" mt="md" fw={600}>Resultado:</Text>
                    <Text size="sm">H0: mu = {formatBR(mu0, 2)}</Text>
                    <Text size="sm">H1: mu != {formatBR(mu0, 2)}</Text>
                    <Text size="sm" mt="xs">X-barra ~ N({formatBR(mu0, 2)}, {formatBR(tab1.se, 4)})</Text>
                    <Text size="sm">alpha = {(alpha1 * 100).toFixed(0)}%</Text>
                    <Text size="sm">Z observado: {formatBR(tab1.zObs, 4)}</Text>
                    <Text size="sm">
                      Regiao critica (RC): ]-∞, {formatBR(tab1.rc1, 4)}] ∪ [{formatBR(tab1.rc2, 4)}, +∞[
                    </Text>
                    <Text size="sm">p-valor: {formatBR(tab1.pValue, 4)}</Text>
                    <Text size="sm" fw={700} c={tab1.rejected ? 'red' : 'green'} mt="xs">
                      {tab1.rejected
                        ? `X-barra ∈ RC, logo H0 é rejeitada.`
                        : `X-barra ∉ RC, logo, H0 não é rejeitada.`}
                    </Text>
                  </>
                )}
              </Paper>
            </Grid.Col>
            <Grid.Col span={8}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Distribuicao Normal da Media - Regioes de Rejeicao</Title>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={tab1.data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} domain={['dataMin', 'dataMax']}/>
                    <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
                    <Tooltip formatter={(v: any) => formatBR(v, 4)} labelFormatter={(v: any) => `x = ${formatBR(Number(v), 2)}`} />
                    <Area type="monotone" dataKey="accept" stroke="none" fill={ACCEPT_COLOR} fillOpacity={0.3} />
                    <Area type="monotone" dataKey="rejection" stroke="none" fill={REJECTION_COLOR} fillOpacity={0.5} />
                    <Area type="monotone" dataKey="y" stroke={MEDIUM_CYAN} fill="none" strokeWidth={2} />
                    {ran1 && (
                      <ReferenceLine
                        x={tab1.xObs}
                        stroke={tab1.rejected ? REJECTION_COLOR : '#ffd43b'}
                        strokeWidth={3}
                        label={{
                          value: `x=${formatBR(tab1.xObs, 2)}`,
                          position: 'top',
                          fill: tab1.rejected ? REJECTION_COLOR : '#e8590c',
                          fontSize: 12,
                        }}
                      />
                    )}
                    <ReferenceLine x={tab1.rc1} stroke="#333" strokeDasharray="5 3" strokeWidth={1} />
                    <ReferenceLine x={tab1.rc2} stroke="#333" strokeDasharray="5 3" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
                <Text size="xs" c="dimmed" ta="center" mt="xs">
                  Regiao azul: rejeicao | Regiao cinza: aceitacao | Linha vertical: Media observada
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* ============ Tab 2 ============ */}
        <Tabs.Panel value="dep">
          <Grid gutter="lg">
            <Grid.Col span={4}>
              <Paper shadow="xs" p="md" withBorder>
                <Title order={5} mb="sm">Parametros</Title>
                <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
                  Teste t pareado: compara as medias de duas populacoes dependentes (antes/depois,
                  tratamento A/B no mesmo sujeito). Gera amostras aleatorias e testa se a diferenca
                  media e significativamente diferente de zero.
                </Text>
                <NumberInput label="Media pop. 1 (mu1)" value={mu1} onChange={(v) => setMu1(Number(v) || 0)} mb="xs" step={0.5} />
                <NumberInput label="Desvio padrao pop. 1" value={sd1} onChange={(v) => setSd1(Math.max(0.01, Number(v) || 1))} mb="xs" step={0.1} min={0.01} />
                <NumberInput label="Media pop. 2 (mu2)" value={mu2} onChange={(v) => setMu2(Number(v) || 0)} mb="xs" step={0.5} />
                <NumberInput label="Desvio padrao pop. 2" value={sd2} onChange={(v) => setSd2(Math.max(0.01, Number(v) || 1))} mb="xs" step={0.1} min={0.01} />
                <Text size="sm" fw={500} mb={4}>Tamanho da amostra (n): {n2}</Text>
                <Slider min={10} max={100} value={n2} onChange={setN2} mb="sm" marks={[{ value: 10, label: '10' }, { value: 50, label: '50' }, { value: 100, label: '100' }]} />
                <Text size="sm" fw={500} mb={4}>Alpha: {formatBR(alpha2, 2)}</Text>
                <Slider min={0.01} max={0.1} step={0.01} value={alpha2} onChange={setAlpha2} mb="md" />
                <Button onClick={handleGenerate2} fullWidth>Gerar Amostras e Testar</Button>

                {tab2 && (
                  <>
                    <Text size="sm" mt="md" fw={600}>Resultado:</Text>
                    <Text size="sm">H0: mu_d = 0 (diferenca media e zero)</Text>
                    <Text size="sm">H1: mu_d != 0</Text>
                    <Text size="sm">Media das diferencas: {formatBR(tab2.dBar, 4)}</Text>
                    <Text size="sm">DP das diferencas: {formatBR(tab2.sdD, 4)}</Text>
                    <Text size="sm">t observado: {formatBR(tab2.tObs, 4)}</Text>
                    <Text size="sm">t critico (df={tab2.df}): +/- {formatBR(tab2.tCrit, 4)}</Text>
                    <Text size="sm">p-valor: {formatBR(tab2.pValue, 4)}</Text>
                    <Text size="sm" fw={700} c={tab2.rejected ? 'red' : 'green'} mt="xs">
                      {tab2.rejected
                        ? 'Rejeita H0: ha diferenca significativa entre as medias.'
                        : 'Nao rejeita H0: nao ha evidencia de diferenca.'}
                    </Text>
                  </>
                )}
              </Paper>
            </Grid.Col>
            <Grid.Col span={8}>
              {tab2 && (
                <>
                  <Paper shadow="xs" p="md" withBorder mb="md">
                    <Title order={5} mb="sm">Primeiras 10 observacoes</Title>
                    <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 12 }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>i</Table.Th>
                          <Table.Th>X1</Table.Th>
                          <Table.Th>X2</Table.Th>
                          <Table.Th>Diferenca</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {tab2.tableData.map((d, i) => (
                          <Table.Tr key={i}>
                            <Table.Td>{i + 1}</Table.Td>
                            <Table.Td>{formatBR(sample1[i], 2)}</Table.Td>
                            <Table.Td>{formatBR(sample2[i], 2)}</Table.Td>
                            <Table.Td>{formatBR(d, 2)}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                  <Paper shadow="xs" p="md" withBorder>
                    <Title order={5} mb="sm">Distribuicao T (df = {tab2.df})</Title>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={tab2.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} />
                        <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
                        <Tooltip formatter={(v: any) => formatBR(v, 4)} />
                        <Area type="monotone" dataKey="accept" stroke="none" fill={ACCEPT_COLOR} fillOpacity={0.3} />
                        <Area type="monotone" dataKey="rejection" stroke="none" fill={REJECTION_COLOR} fillOpacity={0.5} />
                        <Area type="monotone" dataKey="y" stroke={MEDIUM_CYAN} fill="none" strokeWidth={2} />
                        <ReferenceLine
                          x={tab2.tObs}
                          stroke={tab2.rejected ? REJECTION_COLOR : '#ffd43b'}
                          strokeWidth={3}
                          label={{
                            value: `t=${formatBR(tab2.tObs, 2)}`,
                            position: 'top',
                            fill: tab2.rejected ? REJECTION_COLOR : '#e8590c',
                            fontSize: 12,
                          }}
                        />
                        <ReferenceLine x={-tab2.tCrit} stroke="#333" strokeDasharray="5 3" strokeWidth={1} />
                        <ReferenceLine x={tab2.tCrit} stroke="#333" strokeDasharray="5 3" strokeWidth={1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </>
              )}
              {!tab2 && (
                <Paper shadow="xs" p="md" withBorder>
                  <Text c="dimmed" ta="center" py="xl">
                    Clique em &ldquo;Gerar Amostras e Testar&rdquo; para visualizar os resultados.
                  </Text>
                </Paper>
              )}
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </PageWrapper>
  );
}
