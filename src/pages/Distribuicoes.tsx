import { useState, useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { Grid, Paper, Title, Text, Select, Slider, RangeSlider, NumberInput, Table, Code } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MEDIUM_CYAN, RED_NAIL } from '../utils/colors';
import {
  dnorm, pnorm,
  dt,
  dchisq, pchisq,
  dbinom, dpois,
  dexp, pexp,
  generateCurveData,
  generateShadedCurveData,
} from '../utils/distributions';
import { formatBR, formatPercent } from '../utils/formatting';

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (active && payload && payload.length) {
    const yValue = payload[0]?.value;
    const isShaded = payload.length > 1 && payload[1]?.value !== null;
    const textColor = isShaded ? color : '#333';

    return (
      <Paper p="xs" shadow="md" withBorder>
        <Text size="sm" c={textColor} fw={500}>
          x = {formatBR(Number(label), 2)}
        </Text>
        <Text size="sm" c={textColor}>
          y = {formatBR(Number(yValue), 4)}
        </Text>
      </Paper>
    );
  }
  return null;
};

const DISTRIBUTIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Bernoulli', label: 'Bernoulli' },
  { value: 'Binomial', label: 'Binomial' },
  { value: 'Poisson', label: 'Poisson' },
  { value: 'Exponencial', label: 'Exponencial' },
  { value: 'QuiQuadrado', label: 'Qui-Quadrado' },
  { value: 'TStudent', label: 'T de Student' },
];

export default function Distribuicoes() {
  const [dist, setDist] = useState('Normal');

  // Normal params
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [normalRange, setNormalRange] = useState<[number, number]>([-1, 1]);

  // Bernoulli params
  const [bernP, setBernP] = useState(0.5);

  // Binomial params
  const [binP, setBinP] = useState(0.5);
  const [binN, setBinN] = useState(10);

  // Poisson params
  const [poisLambda, setPoisLambda] = useState(5);
  const [poisRange, setPoisRange] = useState<[number, number]>([3, 7]);

  // Exponencial params
  const [expRate, setExpRate] = useState(1);
  const [expRange, setExpRange] = useState<[number, number]>([0, 2]);

  // Chi-square params
  const [chiDf, setChiDf] = useState(5);
  const [chiRange, setChiRange] = useState<[number, number]>([2, 8]);

  // T de Student params
  const [tDf, setTDf] = useState(5);

  const [debouncedMu] = useDebouncedValue(mu, 15);
  const [debouncedSigma] = useDebouncedValue(sigma, 15);
  const [debouncedNormalRange] = useDebouncedValue(normalRange, 15);

  const [debouncedBernP] = useDebouncedValue(bernP, 15);

  const [debouncedBinP] = useDebouncedValue(binP, 15);
  const [debouncedBinN] = useDebouncedValue(binN, 15);

  const [debouncedPoisLambda] = useDebouncedValue(poisLambda, 15);
  const [debouncedPoisRange] = useDebouncedValue(poisRange, 15);

  const [debouncedExpRate] = useDebouncedValue(expRate, 15);
  const [debouncedExpRange] = useDebouncedValue(expRange, 15);

  const [debouncedChiDf] = useDebouncedValue(chiDf, 15);
  const [debouncedChiRange] = useDebouncedValue(chiRange, 15);

  const [debouncedTDf] = useDebouncedValue(tDf, 15);

  // ===================== NORMAL =====================
  const normalData = useMemo(() => {
    const xMin = debouncedMu - 4 * debouncedSigma;
    const xMax = debouncedMu + 4 * debouncedSigma;
    return generateShadedCurveData(
      (x) => dnorm(x, debouncedMu, debouncedSigma),
      xMin, xMax,
      debouncedNormalRange[0], debouncedNormalRange[1],
    );
  }, [debouncedMu, debouncedSigma, debouncedNormalRange]);

  const normalProb = useMemo(
    () => pnorm(debouncedNormalRange[1], debouncedMu, debouncedSigma) - pnorm(debouncedNormalRange[0], debouncedMu, debouncedSigma),
    [debouncedMu, debouncedSigma, debouncedNormalRange],
  );

  const normalZLow = useMemo(() => (debouncedNormalRange[0] - debouncedMu) / debouncedSigma, [debouncedNormalRange, debouncedMu, debouncedSigma]);
  const normalZHigh = useMemo(() => (debouncedNormalRange[1] - debouncedMu) / debouncedSigma, [debouncedNormalRange, debouncedMu, debouncedSigma]);

  // ===================== BERNOULLI =====================
  const bernData = useMemo(
    () => [
      { name: '0 (Fracasso)', prob: 1 - debouncedBernP },
      { name: '1 (Sucesso)', prob: debouncedBernP },
    ],
    [debouncedBernP],
  );

  // ===================== BINOMIAL =====================
  const binData = useMemo(() => {
    const data: { k: string; prob: number }[] = [];
    for (let k = 0; k <= debouncedBinN; k++) {
      data.push({ k: String(k), prob: dbinom(k, debouncedBinN, debouncedBinP) });
    }
    return data;
  }, [debouncedBinN, debouncedBinP]);

  // ===================== POISSON =====================
  const poisData = useMemo(() => {
    const maxK = Math.max(20, Math.ceil(debouncedPoisLambda * 3));
    const data: { k: string; prob: number; inRange: number }[] = [];
    for (let k = 0; k <= maxK; k++) {
      const p = dpois(k, debouncedPoisLambda);
      data.push({
        k: String(k),
        prob: p,
        inRange: k >= debouncedPoisRange[0] && k <= debouncedPoisRange[1] ? p : 0,
      });
    }
    return data;
  }, [debouncedPoisLambda, debouncedPoisRange]);

  const poisProb = useMemo(() => {
    let s = 0;
    for (let k = debouncedPoisRange[0]; k <= debouncedPoisRange[1]; k++) s += dpois(k, debouncedPoisLambda);
    return s;
  }, [debouncedPoisLambda, debouncedPoisRange]);

  // ===================== EXPONENCIAL =====================
  const expData = useMemo(() => {
    const xMax = Math.max(6, 5 / debouncedExpRate);
    return generateShadedCurveData(
      (x) => dexp(x, debouncedExpRate),
      0, xMax,
      debouncedExpRange[0], debouncedExpRange[1],
    );
  }, [debouncedExpRate, debouncedExpRange]);

  const expProb = useMemo(
    () => pexp(debouncedExpRange[1], debouncedExpRate) - pexp(debouncedExpRange[0], debouncedExpRate),
    [debouncedExpRate, debouncedExpRange],
  );

  // ===================== QUI-QUADRADO =====================
  const chiData = useMemo(() => {
    const xMax = Math.max(debouncedChiDf * 3, 20);
    return generateShadedCurveData(
      (x) => dchisq(x, debouncedChiDf),
      0.01, xMax,
      debouncedChiRange[0], debouncedChiRange[1],
    );
  }, [debouncedChiDf, debouncedChiRange]);

  const chiProb = useMemo(
    () => pchisq(debouncedChiRange[1], debouncedChiDf) - pchisq(debouncedChiRange[0], debouncedChiDf),
    [debouncedChiDf, debouncedChiRange],
  );

  // ===================== T DE STUDENT =====================
  const tData = useMemo(() => {
    const curveT = generateCurveData((x) => dt(x, debouncedTDf), -4, 4, 300);
    const curveN = generateCurveData((x) => dnorm(x, 0, 1), -4, 4, 300);
    return curveT.map((point, i) => ({
      x: point.x,
      t: point.y,
      normal: curveN[i]?.y ?? 0,
    }));
  }, [debouncedTDf]);

  // ===================== RENDER =====================
  const renderNormal = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao Normal</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao normal (ou gaussiana) e a mais importante distribuicao continua. E definida
            por dois parametros: media (mu) e desvio padrao (sigma). A curva e simetrica em torno da media.
          </Text>
          <NumberInput label="Media (mu)" value={mu} onChange={(v) => setMu(Number(v) || 0)} mb="sm" step={0.5} />
          <NumberInput label="Desvio Padrao (sigma)" value={sigma} onChange={(v) => setSigma(Math.max(0.1, Number(v) || 1))} mb="sm" step={0.1} min={0.1} />
          <Text size="sm" fw={500} mb={4}>
            Intervalo sombreado: [{formatBR(normalRange[0], 2)}, {formatBR(normalRange[1], 2)}]
          </Text>
          <RangeSlider
            min={debouncedMu - 4 * debouncedSigma}
            max={debouncedMu + 4 * debouncedSigma}
            step={0.01}
            minRange={0}
            value={normalRange}
            onChange={(val) => setNormalRange(val as [number, number])}
            mb="md"
            precision={2}
          />
          <Text size="sm" mt="sm">
            <strong>P({formatBR(normalRange[0], 2)} &le; X &le; {formatBR(normalRange[1], 2)}) = {formatBR(normalProb, 4)}</strong>
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Z inferior: {formatBR(normalZLow, 2)} | Z superior: {formatBR(normalZHigh, 2)}
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={normalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip content={<CustomTooltip color={MEDIUM_CYAN} />} />
              <Area type="monotone" dataKey="y" stroke={MEDIUM_CYAN} fill="none" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="shaded" stroke="none" fill={MEDIUM_CYAN} fillOpacity={0.4} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Transformacao Z (passo a passo)</Title>
          <Code block style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
{`P(${formatBR(normalRange[0], 2)} <= X <= ${formatBR(normalRange[1], 2)}) =
P((${formatBR(normalRange[0], 2)} - ${formatBR(mu, 2)}) / ${formatBR(sigma, 2)} <= Z <= (${formatBR(normalRange[1], 2)} - ${formatBR(mu, 2)}) / ${formatBR(sigma, 2)}) =
P(${formatBR(normalZLow, 2)} <= Z <= ${formatBR(normalZHigh, 2)})

P(Z >= ${formatBR(normalZLow, 2)}) = 1 - P(Z <= ${formatBR(normalZLow, 2)}) = 1 - ${formatBR(pnorm(normalZLow, 0, 1), 4)} = ${formatBR(1 - pnorm(normalZLow, 0, 1), 4)}
P(Z <= ${formatBR(normalZHigh, 2)}) = ${formatBR(pnorm(normalZHigh, 0, 1), 4)}

P(${formatBR(normalZLow, 2)} <= Z <= ${formatBR(normalZHigh, 2)}) = ${formatBR(normalProb, 4)} = ${formatPercent(normalProb, 2)}`}
          </Code>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderBernoulli = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao de Bernoulli</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao de Bernoulli modela um experimento com dois resultados possiveis: sucesso
            (com probabilidade p) e fracasso (com probabilidade 1 - p). E a base da distribuicao binomial.
          </Text>
          <Text size="sm" fw={500} mb={4}>Probabilidade de sucesso (p): {formatBR(bernP, 2)}</Text>
          <Slider min={0.01} max={0.99} step={0.01} value={bernP} onChange={setBernP} mb="md" />
          <Table striped highlightOnHover withTableBorder withColumnBorders mt="md">
            <Table.Thead>
              <Table.Tr><Table.Th>X</Table.Th><Table.Th>P(X)</Table.Th><Table.Th>Explicacao</Table.Th></Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr><Table.Td>0 (Fracasso)</Table.Td><Table.Td>{formatBR(1 - bernP, 4)}</Table.Td><Table.Td>Probabilidade de que seja 0 (fracasso)</Table.Td></Table.Tr>
              <Table.Tr><Table.Td>1 (Sucesso)</Table.Td><Table.Td>{formatBR(bernP, 4)}</Table.Td><Table.Td>Probabilidade de que seja 1 (sucesso)</Table.Td></Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={bernData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} tickFormatter={(v: any) => formatBR(v, 2)} />
              <Tooltip formatter={(v: any) => formatBR(v, 4)} />
              <Bar dataKey="prob" name="P(X)" fill={MEDIUM_CYAN} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderBinomial = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao Binomial</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao binomial modela o numero de sucessos em n tentativas independentes de
            Bernoulli, cada uma com probabilidade de sucesso p.
          </Text>
          <Text size="sm" fw={500} mb={4}>Probabilidade de sucesso (p): {formatBR(binP, 2)}</Text>
          <Slider min={0.01} max={0.99} step={0.01} value={binP} onChange={setBinP} mb="md" />
          <Text size="sm" fw={500} mb={4}>Numero de tentativas (n): {binN}</Text>
          <Slider min={1} max={30} value={binN} onChange={setBinN} mb="md" marks={[{ value: 1, label: '1' }, { value: 15, label: '15' }, { value: 30, label: '30' }]} />
          <Text size="sm" mt="sm">Media: {formatBR(binN * binP, 2)} | Variancia: {formatBR(binN * binP * (1 - binP), 4)}</Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={binData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="k" />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip formatter={(v: any) => formatBR(v, 4)} labelFormatter={(l: any) => `k = ${l}`} />
              <Bar dataKey="prob" name="P(X = k)" fill={MEDIUM_CYAN} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
            <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 11 }}>
              <Table.Thead>
                <Table.Tr><Table.Th>k</Table.Th><Table.Th>P(X = k)</Table.Th><Table.Th>Explicacao</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {binData.filter((row) => binN <= 25 || formatBR(row.prob, 4) !== '0,0000').map((row) => (
                  <Table.Tr key={row.k}><Table.Td>{row.k}</Table.Td><Table.Td>{formatBR(row.prob, 4)}</Table.Td><Table.Td>Probabilidade de ter {row.k} sucesso(s) em {binN} tentativas.</Table.Td></Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderPoisson = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao de Poisson</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao de Poisson modela o numero de eventos que ocorrem em um intervalo fixo de
            tempo ou espaco, dado que os eventos ocorrem com uma taxa media constante (lambda).
          </Text>
          <Text size="sm" fw={500} mb={4}>Media (lambda): {poisLambda}</Text>
          <Slider min={1} max={20} value={poisLambda} onChange={setPoisLambda} mb="md" marks={[{ value: 1, label: '1' }, { value: 10, label: '10' }, { value: 20, label: '20' }]} />
          <Text size="sm" fw={500} mb={4}>
            Intervalo: [{poisRange[0]}, {poisRange[1]}]
          </Text>
          <RangeSlider min={0} max={Math.max(20, Math.ceil(debouncedPoisLambda * 3))} step={1} minRange={0} value={poisRange} onChange={(val) => setPoisRange(val as [number, number])} mb="md" />
          <Text size="sm" mt="sm">
            <strong>P({poisRange[0]} &le; X &le; {poisRange[1]}) = {formatBR(poisProb, 4)}</strong>
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={poisData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="k" />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip formatter={(v: any) => formatBR(v, 4)} labelFormatter={(l: any) => `k = ${l}`} />
              <Bar dataKey="prob" name="P(X = k)" fill="#ccc" isAnimationActive={false} />
              <Bar dataKey="inRange" name="No intervalo" fill={MEDIUM_CYAN} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
            <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 11 }}>
              <Table.Thead>
                <Table.Tr><Table.Th>k</Table.Th><Table.Th>P(X = k)</Table.Th><Table.Th>Explicacao</Table.Th></Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {poisData.filter((r) => r.prob > 0.0001).map((row) => (
                  <Table.Tr key={row.k}><Table.Td>{row.k}</Table.Td><Table.Td>{formatBR(row.prob, 4)}</Table.Td><Table.Td>Probabilidade de ter {row.k} acontecimento(s) no intervalo de tempo.</Table.Td></Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderExponencial = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao Exponencial</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao exponencial modela o tempo entre eventos em um processo de Poisson. E
            parametrizada pela taxa (lambda = 1/beta), onde beta e a media da distribuicao.
          </Text>
          <Text size="sm" fw={500} mb={4}>Taxa (1/beta): {formatBR(expRate, 2)}</Text>
          <Slider min={0.1} max={5} step={0.1} value={expRate} onChange={setExpRate} mb="md" />
          <Text size="sm" fw={500} mb={4}>
            Intervalo: [{formatBR(expRange[0], 2)}, {formatBR(expRange[1], 2)}]
          </Text>
          <RangeSlider
            min={0}
            max={Math.max(6, 5 / debouncedExpRate)}
            step={0.01}
            minRange={0}
            value={expRange}
            onChange={(val) => setExpRange(val as [number, number])}
            mb="md"
          />
          <Text size="sm" mt="sm">
            <strong>P({formatBR(expRange[0], 2)} &le; X &le; {formatBR(expRange[1], 2)}) = {formatBR(expProb, 4)}</strong>
          </Text>
          <Text size="xs" c="dimmed" mt="xs">Media: {formatBR(1 / expRate, 2)} | Variancia: {formatBR(1 / (expRate * expRate), 4)}</Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={expData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip content={<CustomTooltip color={MEDIUM_CYAN} />} />
              <Area type="monotone" dataKey="y" stroke={MEDIUM_CYAN} fill="none" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="shaded" stroke="none" fill={MEDIUM_CYAN} fillOpacity={0.4} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderChiSquare = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao Qui-Quadrado</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao qui-quadrado e usada em testes de aderencia e independencia. E parametrizada
            pelos graus de liberdade (df). Sua media e igual a df e sua variancia e 2*df.
          </Text>
          <Text size="sm" fw={500} mb={4}>Graus de liberdade (df): {chiDf}</Text>
          <Slider min={1} max={30} value={chiDf} onChange={setChiDf} mb="md" marks={[{ value: 1, label: '1' }, { value: 15, label: '15' }, { value: 30, label: '30' }]} />
          <Text size="sm" fw={500} mb={4}>
            Intervalo: [{formatBR(chiRange[0], 2)}, {formatBR(chiRange[1], 2)}]
          </Text>
          <RangeSlider
            min={0}
            max={Math.max(debouncedChiDf * 3, 20)}
            step={0.1}
            minRange={0}
            value={chiRange}
            onChange={(val) => setChiRange(val as [number, number])}
            mb="md"
          />
          <Text size="sm" mt="sm">
            <strong>P({formatBR(chiRange[0], 2)} &le; X &le; {formatBR(chiRange[1], 2)}) = {formatBR(chiProb, 4)}</strong>
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chiData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip content={<CustomTooltip color={RED_NAIL} />} />
              <Area type="monotone" dataKey="y" stroke={RED_NAIL} fill="none" strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="shaded" stroke="none" fill={RED_NAIL} fillOpacity={0.35} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderTStudent = () => (
    <Grid gutter="lg">
      <Grid.Col span={4}>
        <Paper shadow="xs" p="md" withBorder>
          <Title order={5} mb="sm">Distribuicao T de Student</Title>
          <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
            A distribuicao t de Student e semelhante a distribuicao normal, mas com caudas mais pesadas.
            Ela e utilizada quando a variancia populacional e desconhecida e o tamanho da amostra e
            pequeno. Conforme os graus de liberdade aumentam, a distribuicao t se aproxima da normal padrao.
          </Text>
          <Text size="sm" fw={500} mb={4}>Graus de liberdade (df): {tDf}</Text>
          <Slider min={1} max={30} value={tDf} onChange={setTDf} mb="md" marks={[{ value: 1, label: '1' }, { value: 15, label: '15' }, { value: 30, label: '30' }]} />
          <Text size="sm" mt="sm" c="dimmed">
            A curva preta e a T de Student e a curva ciano e a Normal padrao (para comparacao).
            Observe como as caudas da t sao mais pesadas (maiores) para poucos graus de liberdade.
          </Text>
        </Paper>
      </Grid.Col>
      <Grid.Col span={8}>
        <Paper shadow="xs" p="md" withBorder>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={tData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} />
              <YAxis tickFormatter={(v: any) => formatBR(v, 3)} />
              <Tooltip formatter={(v: any) => formatBR(v, 4)} labelFormatter={(v: any) => `x = ${formatBR(Number(v), 2)}`} />
              <Legend />
              <Line type="monotone" dataKey="t" name={`T (df=${tDf})`} stroke="#333" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="normal" name="Normal(0,1)" stroke={MEDIUM_CYAN} strokeWidth={2} dot={false} strokeDasharray="5 3" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );

  const renderContent = () => {
    switch (dist) {
      case 'Normal': return renderNormal();
      case 'Bernoulli': return renderBernoulli();
      case 'Binomial': return renderBinomial();
      case 'Poisson': return renderPoisson();
      case 'Exponencial': return renderExponencial();
      case 'QuiQuadrado': return renderChiSquare();
      case 'TStudent': return renderTStudent();
      default: return null;
    }
  };

  return (
    <PageWrapper size="xl">

      <Paper shadow="xs" p="md" withBorder mb="lg">
        <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
          Explore as principais distribuicoes de probabilidade utilizadas em estatistica. Selecione uma
          distribuicao e ajuste seus parametros para visualizar como a forma da distribuicao se altera.
        </Text>
        <Select
          label="Distribuicao"
          data={DISTRIBUTIONS}
          value={dist}
          onChange={(val) => val && setDist(val)}
          w={280}
        />
      </Paper>

      {renderContent()}
    </PageWrapper>
  );
}
