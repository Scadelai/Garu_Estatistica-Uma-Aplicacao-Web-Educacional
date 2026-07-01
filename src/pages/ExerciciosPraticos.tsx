import { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Tabs,
  Select,
  Button,
  Checkbox,
  Group,
  Table,
  Alert,
  Stack,
} from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { COLORFUL, DARK_CYAN } from '../utils/colors';
import {
  frequencyTable,
  contingencyTable,
  expectedFrequencies,
  chiSquareStatistic,
  spearmanCorrelation,
  shapiroWilk,
  quartiles,
} from '../utils/statistics';
import { pchisq, pt } from '../utils/distributions';
import { formatBR } from '../utils/formatting';
import { dadosParalisia, DISPLAY_NAMES } from '../data/dadosParalisia';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStr(col: string): string[] {
  return dadosParalisia.map((r) => String((r as Record<string, any>)[col] ?? ''));
}

function getNum(col: string): number[] {
  return dadosParalisia
    .map((r) => (r as Record<string, any>)[col])
    .filter((v): v is number => v != null && !Number.isNaN(Number(v)))
    .map(Number);
}

function getPairedNum(colA: string, colB: string): { a: number[]; b: number[] } {
  const a: number[] = [];
  const b: number[] = [];
  for (const row of dadosParalisia) {
    const va = (row as Record<string, any>)[colA];
    const vb = (row as Record<string, any>)[colB];
    if (va != null && vb != null && !Number.isNaN(Number(va)) && !Number.isNaN(Number(vb))) {
      a.push(Number(va));
      b.push(Number(vb));
    }
  }
  return { a, b };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALL_DISPLAY = Object.keys(DISPLAY_NAMES);

const CORRECT_QUAL = [
  'Sexo',
  'Grupo',
  'Perda Auditiva',
  'Distúrbio de Comunicação',
  'Grau de Disfunção Motora Oral',
];
const CORRECT_QUANT = ['Idade', 'Tempo líquido', 'Tempo pastoso', 'Tempo sólido'];

const AXIS_OPTIONS = ['Não se aplica', ...ALL_DISPLAY].map((v) => ({
  value: v,
  label: v,
}));

const CHART_TYPES = ['Barras', 'Boxplot', 'Dispersão'].map((v) => ({
  value: v,
  label: v,
}));

const MEASURES_EX2 = [
  'Média',
  'Mediana',
  'Porcentagem',
  'Frequência absoluta',
  'Desvio-padrão',
  'Frequência relativa',
  'Quartis',
];

const MEASURES_EX3 = [
  'Média',
  'Mediana',
  'Porcentagem',
  'Frequência absoluta',
  'Desvio-padrão',
  'Frequência relativa',
];

/* ------------------------------------------------------------------ */
/*  Utility functions                                                  */
/* ------------------------------------------------------------------ */

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(b);
  return a.every((x) => s.has(x));
}

function isCorrectChart(
  eixoX: string | null,
  eixoY: string | null,
  tipo: string | null,
  varName: string,
  tipoCorrect: string,
): boolean {
  if (!eixoX || !eixoY || !tipo) return false;
  if (tipo !== tipoCorrect) return false;
  return (
    (eixoX === varName && eixoY === 'Não se aplica') ||
    (eixoY === varName && eixoX === 'Não se aplica')
  );
}

function isCorrectScatter(
  eixoX: string | null,
  eixoY: string | null,
  tipo: string | null,
  varA: string,
  varB: string,
): boolean {
  if (!eixoX || !eixoY || !tipo) return false;
  if (tipo !== 'Dispersão') return false;
  return (
    (eixoX === varA && eixoY === varB) || (eixoX === varB && eixoY === varA)
  );
}

interface Feedback {
  ok: boolean;
  msg: string;
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function ExerciciosPraticos() {
  /* ---------- Ex1 ---------- */
  const [ex1Qual, setEx1Qual] = useState<string[]>([]);
  const [ex1Quant, setEx1Quant] = useState<string[]>([]);
  const [ex1Fb, setEx1Fb] = useState<Feedback | null>(null);

  /* ---------- Ex2 ---------- */
  const [ex2Sel, setEx2Sel] = useState<string[]>([]);
  const [ex2Fb, setEx2Fb] = useState<Feedback | null>(null);

  /* ---------- Ex3 ---------- */
  const [ex3Sel, setEx3Sel] = useState<string[]>([]);
  const [ex3Fb, setEx3Fb] = useState<Feedback | null>(null);

  /* ---------- Ex4 ---------- */
  const [ex4X, setEx4X] = useState<string | null>(null);
  const [ex4Y, setEx4Y] = useState<string | null>(null);
  const [ex4Tipo, setEx4Tipo] = useState<string | null>(null);
  const [ex4Fb, setEx4Fb] = useState<Feedback | null>(null);
  const [ex4Show, setEx4Show] = useState(false);

  /* ---------- Ex5 ---------- */
  const [ex5X, setEx5X] = useState<string | null>(null);
  const [ex5Y, setEx5Y] = useState<string | null>(null);
  const [ex5Tipo, setEx5Tipo] = useState<string | null>(null);
  const [ex5Fb, setEx5Fb] = useState<Feedback | null>(null);
  const [ex5Show, setEx5Show] = useState(false);

  /* ---------- Ex6 ---------- */
  const [ex6X, setEx6X] = useState<string | null>(null);
  const [ex6Y, setEx6Y] = useState<string | null>(null);
  const [ex6Tipo, setEx6Tipo] = useState<string | null>(null);
  const [ex6Fb, setEx6Fb] = useState<Feedback | null>(null);
  const [ex6Show, setEx6Show] = useState(false);

  /* ---------- Ex7 ---------- */
  const [ex7Test, setEx7Test] = useState<string | null>(null);
  const [ex7TestFb, setEx7TestFb] = useState<Feedback | null>(null);
  const [ex7Assoc, setEx7Assoc] = useState<string | null>(null);
  const [ex7AssocFb, setEx7AssocFb] = useState<Feedback | null>(null);

  /* ---------- Ex8 ---------- */
  const [ex8Test, setEx8Test] = useState<string | null>(null);
  const [ex8TestFb, setEx8TestFb] = useState<Feedback | null>(null);
  const [ex8Assoc, setEx8Assoc] = useState<string | null>(null);
  const [ex8AssocFb, setEx8AssocFb] = useState<Feedback | null>(null);

  /* ---------- Ex9 ---------- */
  const [ex9X, setEx9X] = useState<string | null>(null);
  const [ex9Y, setEx9Y] = useState<string | null>(null);
  const [ex9Tipo, setEx9Tipo] = useState<string | null>(null);
  const [ex9ChartFb, setEx9ChartFb] = useState<Feedback | null>(null);
  const [ex9Show, setEx9Show] = useState(false);
  const [ex9Test, setEx9Test] = useState<string | null>(null);
  const [ex9TestFb, setEx9TestFb] = useState<Feedback | null>(null);
  const [ex9Assoc, setEx9Assoc] = useState<string | null>(null);
  const [ex9AssocFb, setEx9AssocFb] = useState<Feedback | null>(null);

  /* ============================================================== */
  /*  Computed data                                                  */
  /* ============================================================== */

  const ex4Data = useMemo(() => {
    if (!ex4Show) return [];
    return frequencyTable(getStr('dmo'));
  }, [ex4Show]);

  const ex5Data = useMemo(() => {
    if (!ex5Show) return [];
    return frequencyTable(getStr('dist_comun'));
  }, [ex5Show]);

  const ex6Box = useMemo(() => {
    if (!ex6Show) return null;
    const vals = getNum('td_liquido');
    if (vals.length === 0) return null;
    const sorted = [...vals].sort((a, b) => a - b);
    const q = quartiles(vals);
    return {
      min: sorted[0],
      q1: q.q1,
      median: q.q2,
      q3: q.q3,
      max: sorted[sorted.length - 1],
    };
  }, [ex6Show]);

  const ex7 = useMemo(() => {
    const v1 = getStr('perda_audit');
    const v2 = getStr('grupo');
    const ct = contingencyTable(v1, v2);
    const exp = expectedFrequencies(ct);
    const chi2 = chiSquareStatistic(ct.matrix, exp);
    const df = (ct.rowLabels.length - 1) * (ct.colLabels.length - 1);
    const pVal = 1 - pchisq(chi2, df);
    return { ct, exp, chi2, df, pVal };
  }, []);

  const ex8 = useMemo(() => {
    const v1 = getStr('dist_comun');
    const v2 = getStr('grupo');
    const ct = contingencyTable(v1, v2);
    const exp = expectedFrequencies(ct);
    const chi2 = chiSquareStatistic(ct.matrix, exp);
    const df = (ct.rowLabels.length - 1) * (ct.colLabels.length - 1);
    const pVal = 1 - pchisq(chi2, df);
    return { ct, exp, chi2, df, pVal };
  }, []);

  const ex9Data = useMemo(() => {
    if (!ex9Show) return null;
    const { a: xVals, b: yVals } = getPairedNum('td_liquido', 'td_solido');
    if (xVals.length < 3) return null;
    const swX = shapiroWilk(xVals);
    const swY = shapiroWilk(yVals);
    const r = spearmanCorrelation(xVals, yVals);
    const n = xVals.length;
    const tStat =
      Math.abs(r) >= 1 ? Infinity : r * Math.sqrt((n - 2) / (1 - r * r));
    const df = n - 2;
    const pVal = 2 * (1 - pt(Math.abs(tStat), df));
    const scatter = xVals.map((x, i) => ({ x, y: yVals[i] }));
    return { swX, swY, r, tStat, df, pVal, n, scatter };
  }, [ex9Show]);

  /* ============================================================== */
  /*  Render helpers                                                 */
  /* ============================================================== */

  const renderFb = (fb: Feedback | null) =>
    fb ? (
      <Alert color={fb.ok ? 'green' : 'red'} mt="sm">
        {fb.msg}
      </Alert>
    ) : null;

  const renderObservedTable = (
    ct: ReturnType<typeof contingencyTable>,
    rowVar: string,
    colVar: string,
  ) => (
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      mt="sm"
      style={{ fontSize: 12 }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            {rowVar} / {colVar}
          </Table.Th>
          {ct.colLabels.map((c) => (
            <Table.Th key={c}>{c}</Table.Th>
          ))}
          <Table.Th>Total</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {ct.rowLabels.map((r, ri) => (
          <Table.Tr key={r}>
            <Table.Td fw={600}>{r}</Table.Td>
            {ct.matrix[ri].map((v, ci) => (
              <Table.Td key={ci}>{v}</Table.Td>
            ))}
            <Table.Td fw={600}>{ct.rowTotals[ri]}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td fw={600}>Total</Table.Td>
          {ct.colTotals.map((t, ci) => (
            <Table.Td key={ci} fw={600}>
              {t}
            </Table.Td>
          ))}
          <Table.Td fw={600}>{ct.grandTotal}</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );

  const renderExpectedTable = (
    ct: ReturnType<typeof contingencyTable>,
    exp: number[][],
    rowVar: string,
    colVar: string,
  ) => (
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      mt="sm"
      style={{ fontSize: 12 }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            {rowVar} / {colVar}
          </Table.Th>
          {ct.colLabels.map((c) => (
            <Table.Th key={c}>{c}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {ct.rowLabels.map((r, ri) => (
          <Table.Tr key={r}>
            <Table.Td fw={600}>{r}</Table.Td>
            {exp[ri].map((v, ci) => (
              <Table.Td key={ci}>{formatBR(v, 2)}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );

  const renderAxisSelects = (
    xVal: string | null,
    yVal: string | null,
    tipoVal: string | null,
    setX: (v: string | null) => void,
    setY: (v: string | null) => void,
    setTipo: (v: string | null) => void,
  ) => (
    <Group mb="md">
      <Select
        label="Eixo X"
        data={AXIS_OPTIONS}
        value={xVal}
        onChange={setX}
        w={250}
      />
      <Select
        label="Eixo Y"
        data={AXIS_OPTIONS}
        value={yVal}
        onChange={setY}
        w={250}
      />
      <Select
        label="Tipo de gráfico"
        data={CHART_TYPES}
        value={tipoVal}
        onChange={setTipo}
        w={180}
      />
    </Group>
  );

  /* ============================================================== */
  /*  Boxplot renderer                                               */
  /* ============================================================== */

  const renderBoxplot = () => {
    if (!ex6Box) return null;
    const { min, q1, median, q3, max } = ex6Box;
    const range = max - min || 1;
    const PAD = 60;
    const W = 340;
    const sc = (v: any) => PAD + ((v - min) / range) * W;
    const TOP = 50;
    const BOT = 130;
    const MID = (TOP + BOT) / 2;

    return (
      <svg
        width="100%"
        height="200"
        viewBox="0 0 460 200"
        style={{ display: 'block', margin: '16px auto', maxWidth: 500 }}
      >
        <text
          x="230"
          y="22"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
        >
          Tempo líquido
        </text>

        {/* whisker left */}
        <line
          x1={sc(min)}
          y1={MID}
          x2={sc(q1)}
          y2={MID}
          stroke={DARK_CYAN}
          strokeWidth="2"
        />
        <line
          x1={sc(min)}
          y1={TOP + 15}
          x2={sc(min)}
          y2={BOT - 15}
          stroke={DARK_CYAN}
          strokeWidth="2"
        />

        {/* box */}
        <rect
          x={sc(q1)}
          y={TOP}
          width={sc(q3) - sc(q1)}
          height={BOT - TOP}
          fill={COLORFUL[0]}
          fillOpacity={0.3}
          stroke={DARK_CYAN}
          strokeWidth="2"
        />

        {/* median line */}
        <line
          x1={sc(median)}
          y1={TOP}
          x2={sc(median)}
          y2={BOT}
          stroke={DARK_CYAN}
          strokeWidth="3"
        />

        {/* whisker right */}
        <line
          x1={sc(q3)}
          y1={MID}
          x2={sc(max)}
          y2={MID}
          stroke={DARK_CYAN}
          strokeWidth="2"
        />
        <line
          x1={sc(max)}
          y1={TOP + 15}
          x2={sc(max)}
          y2={BOT - 15}
          stroke={DARK_CYAN}
          strokeWidth="2"
        />

        {/* labels */}
        <text x={sc(min)} y={BOT + 20} textAnchor="middle" fontSize="11">
          {formatBR(min, 0)}
        </text>
        <text x={sc(q1)} y={BOT + 20} textAnchor="middle" fontSize="11">
          {formatBR(q1, 1)}
        </text>
        <text x={sc(median)} y={BOT + 20} textAnchor="middle" fontSize="11">
          {formatBR(median, 1)}
        </text>
        <text x={sc(q3)} y={BOT + 20} textAnchor="middle" fontSize="11">
          {formatBR(q3, 1)}
        </text>
        <text x={sc(max)} y={BOT + 20} textAnchor="middle" fontSize="11">
          {formatBR(max, 0)}
        </text>
      </svg>
    );
  };

  /* ============================================================== */
  /*  JSX                                                            */
  /* ============================================================== */

  return (
    <PageWrapper size="xl">

      <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
        Estes exercícios utilizam o conjunto de dados de paralisia cerebral.
        Resolva cada exercício e clique em &ldquo;Verificar&rdquo; para conferir
        sua resposta.
      </Text>

      <Tabs defaultValue="ex1">
        <Tabs.List mb="md">
          {Array.from({ length: 9 }, (_, i) => (
            <Tabs.Tab key={i} value={`ex${i + 1}`}>
              Ex. {i + 1}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {/* ==================== Ex 1 ==================== */}
        <Tabs.Panel value="ex1">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 1: Classificação de Variáveis
            </Title>
            <Text size="sm" mb="md">
              Utilize as caixas de seleção para agrupar as variáveis em
              qualitativas e quantitativas.
            </Text>

            <Text size="sm" fw={600} mb="xs">
              Quais variáveis são qualitativas?
            </Text>
            <Checkbox.Group value={ex1Qual} onChange={setEx1Qual}>
              <Stack gap="xs" mb="md">
                {ALL_DISPLAY.map((n) => (
                  <Checkbox key={`q-${n}`} value={n} label={n} />
                ))}
              </Stack>
            </Checkbox.Group>

            <Text size="sm" fw={600} mb="xs">
              Quais variáveis são quantitativas?
            </Text>
            <Checkbox.Group value={ex1Quant} onChange={setEx1Quant}>
              <Stack gap="xs" mb="md">
                {ALL_DISPLAY.map((n) => (
                  <Checkbox key={`t-${n}`} value={n} label={n} />
                ))}
              </Stack>
            </Checkbox.Group>

            <Button
              onClick={() => {
                const qOk = setsEqual(ex1Qual, CORRECT_QUAL);
                const tOk = setsEqual(ex1Quant, CORRECT_QUANT);
                setEx1Fb(
                  qOk && tOk
                    ? {
                        ok: true,
                        msg: 'Correto! Você classificou todas as variáveis corretamente.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Revise sua classificação e tente novamente.',
                      },
                );
              }}
            >
              Verificar
            </Button>
            {renderFb(ex1Fb)}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 2 ==================== */}
        <Tabs.Panel value="ex2">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 2: Medidas-Resumo para Tempos de Deglutição
            </Title>
            <Text size="sm" mb="md">
              Selecione todas as medidas-resumo adequadas aos tempos de
              deglutição de alimentos (líquidos, pastosos e sólidos).
            </Text>

            <Checkbox.Group value={ex2Sel} onChange={setEx2Sel}>
              <Stack gap="xs" mb="md">
                {MEASURES_EX2.map((m) => (
                  <Checkbox key={m} value={m} label={m} />
                ))}
              </Stack>
            </Checkbox.Group>

            <Button
              onClick={() => {
                const ok = setsEqual(ex2Sel, [
                  'Média',
                  'Mediana',
                  'Desvio-padrão',
                  'Quartis',
                ]);
                setEx2Fb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Média, mediana, desvio-padrão e quartis são medidas-resumo adequadas para variáveis quantitativas.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Revise quais medidas-resumo são adequadas para variáveis quantitativas e tente novamente.',
                      },
                );
              }}
            >
              Verificar
            </Button>
            {renderFb(ex2Fb)}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 3 ==================== */}
        <Tabs.Panel value="ex3">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 3: Medidas-Resumo para Distúrbio de Comunicação
            </Title>
            <Text size="sm" mb="md">
              Selecione todas as medidas-resumo adequadas ao distúrbio de
              comunicação.
            </Text>

            <Checkbox.Group value={ex3Sel} onChange={setEx3Sel}>
              <Stack gap="xs" mb="md">
                {MEASURES_EX3.map((m) => (
                  <Checkbox key={m} value={m} label={m} />
                ))}
              </Stack>
            </Checkbox.Group>

            <Button
              onClick={() => {
                const ok = setsEqual(ex3Sel, ['Porcentagem']);
                setEx3Fb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Porcentagem é a medida-resumo adequada para o distúrbio de comunicação (variável qualitativa).',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Revise quais medidas-resumo são adequadas para variáveis qualitativas e tente novamente.',
                      },
                );
              }}
            >
              Verificar
            </Button>
            {renderFb(ex3Fb)}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 4 ==================== */}
        <Tabs.Panel value="ex4">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 4: Gráfico para DMO
            </Title>
            <Text size="sm" mb="md">
              Construa um gráfico adequado para visualizar o grau de disfunção
              motora oral (DMO).
            </Text>

            {renderAxisSelects(
              ex4X,
              ex4Y,
              ex4Tipo,
              setEx4X,
              setEx4Y,
              setEx4Tipo,
            )}

            <Button
              onClick={() => {
                const ok = isCorrectChart(
                  ex4X,
                  ex4Y,
                  ex4Tipo,
                  'Grau de Disfunção Motora Oral',
                  'Barras',
                );
                setEx4Fb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Um gráfico de barras é adequado para visualizar uma variável qualitativa.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Para visualizar o grau de disfunção motora oral (variável qualitativa), use um gráfico de barras com a variável em um eixo e "Não se aplica" no outro.',
                      },
                );
                setEx4Show(ok);
              }}
            >
              Gerar gráfico
            </Button>
            {renderFb(ex4Fb)}

            {ex4Show && ex4Data.length > 0 && (
              <ResponsiveContainer
                width="100%"
                height={320}
                style={{ marginTop: 16 }}
              >
                <BarChart
                  data={ex4Data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 11, dy: 5 }}
                    tickMargin={5}
                    height={80}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="freq" name="Frequência">
                    {ex4Data.map((_, i) => (
                      <Cell key={i} fill={COLORFUL[i % COLORFUL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 5 ==================== */}
        <Tabs.Panel value="ex5">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 5: Gráfico para Distúrbio de Comunicação
            </Title>
            <Text size="sm" mb="md">
              Construa um gráfico adequado para visualizar o distúrbio de
              comunicação.
            </Text>

            {renderAxisSelects(
              ex5X,
              ex5Y,
              ex5Tipo,
              setEx5X,
              setEx5Y,
              setEx5Tipo,
            )}

            <Button
              onClick={() => {
                const ok = isCorrectChart(
                  ex5X,
                  ex5Y,
                  ex5Tipo,
                  'Distúrbio de Comunicação',
                  'Barras',
                );
                setEx5Fb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Um gráfico de barras é adequado para visualizar uma variável qualitativa.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Para visualizar o distúrbio de comunicação (variável qualitativa), use um gráfico de barras com a variável em um eixo e "Não se aplica" no outro.',
                      },
                );
                setEx5Show(ok);
              }}
            >
              Gerar gráfico
            </Button>
            {renderFb(ex5Fb)}

            {ex5Show && ex5Data.length > 0 && (
              <ResponsiveContainer
                width="100%"
                height={320}
                style={{ marginTop: 16 }}
              >
                <BarChart
                  data={ex5Data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="freq" name="Frequência">
                    {ex5Data.map((_, i) => (
                      <Cell key={i} fill={COLORFUL[i % COLORFUL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 6 ==================== */}
        <Tabs.Panel value="ex6">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 6: Gráfico para Tempo de Deglutição de Líquidos
            </Title>
            <Text size="sm" mb="md">
              Construa um gráfico adequado para visualizar o tempo de deglutição
              de alimentos líquidos.
            </Text>

            {renderAxisSelects(
              ex6X,
              ex6Y,
              ex6Tipo,
              setEx6X,
              setEx6Y,
              setEx6Tipo,
            )}

            <Button
              onClick={() => {
                const ok = isCorrectChart(
                  ex6X,
                  ex6Y,
                  ex6Tipo,
                  'Tempo líquido',
                  'Boxplot',
                );
                setEx6Fb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Um boxplot é adequado para visualizar a distribuição de uma variável quantitativa.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Para visualizar o tempo de deglutição de líquidos (variável quantitativa), use um boxplot com a variável em um eixo e "Não se aplica" no outro.',
                      },
                );
                setEx6Show(ok);
              }}
            >
              Gerar gráfico
            </Button>
            {renderFb(ex6Fb)}

            {ex6Show && renderBoxplot()}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 7 ==================== */}
        <Tabs.Panel value="ex7">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 7: Teste Qui-Quadrado &mdash; Perda Auditiva vs Grupo
            </Title>
            <Text size="sm" mb="md">
              A tabela abaixo apresenta a distribuição de perda auditiva pelos
              grupos de crianças com paralisia cerebral e as sem acometimentos
              neurológicos.
            </Text>

            <Text size="sm" fw={600} mb="xs">
              Tabela de frequências observadas
            </Text>
            {renderObservedTable(ex7.ct, 'Perda Auditiva', 'Grupo')}

            <Text size="sm" fw={600} mt="md" mb="xs">
              Tabela de frequências esperadas
            </Text>
            {renderExpectedTable(ex7.ct, ex7.exp, 'Perda Auditiva', 'Grupo')}

            <Text size="sm" fw={600} mt="lg" mb="xs">
              (a) Escolha o teste estatístico mais apropriado:
            </Text>
            <Select
              data={[
                { value: 'Qui-Quadrado', label: 'Qui-Quadrado' },
                {
                  value: 'Qui-Quadrado via simulação de Monte Carlo',
                  label: 'Qui-Quadrado via simulação de Monte Carlo',
                },
              ]}
              value={ex7Test}
              onChange={setEx7Test}
              w={360}
              mb="sm"
            />
            <Button
              onClick={() => {
                const ok =
                  ex7Test === 'Qui-Quadrado via simulação de Monte Carlo';
                setEx7TestFb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Como existem frequências esperadas menores que 5, o teste Qui-Quadrado via simulação de Monte Carlo é mais apropriado.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Observe as frequências esperadas na tabela. Quando existem valores esperados menores que 5, o Qui-Quadrado via simulação de Monte Carlo é mais apropriado.',
                      },
                );
                if (!ok) {
                  setEx7AssocFb(null);
                }
              }}
            >
              Verificar
            </Button>
            {renderFb(ex7TestFb)}

            {ex7TestFb?.ok && (
              <>
                <Text size="sm" mt="md">
                  <strong>Estatística X²:</strong> {formatBR(ex7.chi2, 4)} |{' '}
                  <strong>gl:</strong> {ex7.df} | <strong>p-valor:</strong>{' '}
                  {formatBR(ex7.pVal, 4)}
                </Text>

                <Text size="sm" fw={600} mt="lg" mb="xs">
                  (b) As variáveis estão associadas ao nível de 5%?
                </Text>
                <Select
                  data={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                  ]}
                  value={ex7Assoc}
                  onChange={setEx7Assoc}
                  w={200}
                  mb="sm"
                />
                <Button
                  onClick={() => {
                    const ok = ex7Assoc === 'Não';
                    setEx7AssocFb(
                      ok
                        ? {
                            ok: true,
                            msg: 'Correto! O p-valor é maior que 0,05, portanto não há evidência de associação entre as variáveis ao nível de 5%.',
                          }
                        : {
                            ok: false,
                            msg: 'Incorreto. Compare o p-valor com o nível de significância de 5% (0,05).',
                          },
                    );
                  }}
                >
                  Verificar
                </Button>
                {renderFb(ex7AssocFb)}
              </>
            )}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 8 ==================== */}
        <Tabs.Panel value="ex8">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 8: Teste Qui-Quadrado &mdash; Distúrbio de Comunicação
              vs Grupo
            </Title>
            <Text size="sm" mb="md">
              A tabela abaixo apresenta a distribuição de distúrbio de
              comunicação pelos grupos de crianças com paralisia cerebral e as
              sem acometimentos neurológicos.
            </Text>

            <Text size="sm" fw={600} mb="xs">
              Tabela de frequências observadas
            </Text>
            {renderObservedTable(
              ex8.ct,
              'Distúrbio de Comunicação',
              'Grupo',
            )}

            <Text size="sm" fw={600} mt="md" mb="xs">
              Tabela de frequências esperadas
            </Text>
            {renderExpectedTable(
              ex8.ct,
              ex8.exp,
              'Distúrbio de Comunicação',
              'Grupo',
            )}

            <Text size="sm" fw={600} mt="lg" mb="xs">
              (a) Escolha o teste estatístico mais apropriado:
            </Text>
            <Select
              data={[
                { value: 'Qui-Quadrado', label: 'Qui-Quadrado' },
                {
                  value: 'Qui-Quadrado via simulação de Monte Carlo',
                  label: 'Qui-Quadrado via simulação de Monte Carlo',
                },
              ]}
              value={ex8Test}
              onChange={setEx8Test}
              w={360}
              mb="sm"
            />
            <Button
              onClick={() => {
                const ok =
                  ex8Test === 'Qui-Quadrado via simulação de Monte Carlo';
                setEx8TestFb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Como existem frequências esperadas menores que 5, o teste Qui-Quadrado via simulação de Monte Carlo é mais apropriado.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Observe as frequências esperadas na tabela. Quando existem valores esperados menores que 5, o Qui-Quadrado via simulação de Monte Carlo é mais apropriado.',
                      },
                );
                if (!ok) {
                  setEx8AssocFb(null);
                }
              }}
            >
              Verificar
            </Button>
            {renderFb(ex8TestFb)}

            {ex8TestFb?.ok && (
              <>
                <Text size="sm" mt="md">
                  <strong>Estatística X²:</strong> {formatBR(ex8.chi2, 4)} |{' '}
                  <strong>gl:</strong> {ex8.df} | <strong>p-valor:</strong>{' '}
                  {formatBR(ex8.pVal, 4)}
                </Text>

                <Text size="sm" fw={600} mt="lg" mb="xs">
                  (b) As variáveis estão associadas ao nível de 5%?
                </Text>
                <Select
                  data={[
                    { value: 'Sim', label: 'Sim' },
                    { value: 'Não', label: 'Não' },
                  ]}
                  value={ex8Assoc}
                  onChange={setEx8Assoc}
                  w={200}
                  mb="sm"
                />
                <Button
                  onClick={() => {
                    const ok = ex8Assoc === 'Não';
                    setEx8AssocFb(
                      ok
                        ? {
                            ok: true,
                            msg: 'Correto! O p-valor é maior que 0,05, portanto não há evidência de associação entre as variáveis ao nível de 5%.',
                          }
                        : {
                            ok: false,
                            msg: 'Incorreto. Compare o p-valor com o nível de significância de 5% (0,05).',
                          },
                    );
                  }}
                >
                  Verificar
                </Button>
                {renderFb(ex8AssocFb)}
              </>
            )}
          </Paper>
        </Tabs.Panel>

        {/* ==================== Ex 9 ==================== */}
        <Tabs.Panel value="ex9">
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Exercício 9: Correlação &mdash; Tempo Líquido vs Tempo Sólido
            </Title>
            <Text size="sm" mb="md">
              Construa um gráfico para visualizar a relação do tempo de
              deglutição de alimentos líquidos com o tempo de deglutição de
              alimentos sólidos.
            </Text>

            {renderAxisSelects(
              ex9X,
              ex9Y,
              ex9Tipo,
              setEx9X,
              setEx9Y,
              setEx9Tipo,
            )}

            <Button
              onClick={() => {
                const ok = isCorrectScatter(
                  ex9X,
                  ex9Y,
                  ex9Tipo,
                  'Tempo líquido',
                  'Tempo sólido',
                );
                setEx9ChartFb(
                  ok
                    ? {
                        ok: true,
                        msg: 'Correto! Um gráfico de dispersão é adequado para visualizar a relação entre duas variáveis quantitativas.',
                      }
                    : {
                        ok: false,
                        msg: 'Incorreto. Para visualizar a relação entre o tempo de deglutição de líquidos e sólidos, use um gráfico de dispersão com ambas as variáveis nos eixos.',
                      },
                );
                setEx9Show(ok);
                if (!ok) {
                  setEx9TestFb(null);
                  setEx9AssocFb(null);
                }
              }}
            >
              Gerar gráfico
            </Button>
            {renderFb(ex9ChartFb)}

            {ex9Show && ex9Data && (
              <>
                {/* Scatter plot */}
                <ResponsiveContainer
                  width="100%"
                  height={350}
                  style={{ marginTop: 16 }}
                >
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      name="Tempo líquido"
                      label={{
                        value: 'Tempo líquido',
                        position: 'insideBottom',
                        offset: -5,
                        style: { fontSize: 12 },
                      }}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      name="Tempo sólido"
                      label={{
                        value: 'Tempo sólido',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 12 },
                      }}
                    />
                    <Tooltip
                      formatter={(v: any) => formatBR(v, 1)}
                    />
                    <Scatter
                      name="Dados"
                      data={ex9Data.scatter}
                      fill={DARK_CYAN}
                    >
                      {ex9Data.scatter.map((_, i) => (
                        <Cell key={i} fill={DARK_CYAN} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Shapiro-Wilk normality tests */}
                <Text size="sm" fw={600} mt="md" mb="xs">
                  Teste de normalidade (Shapiro-Wilk)
                </Text>
                <Text size="sm">
                  Tempo líquido: W = {formatBR(ex9Data.swX.W, 4)}, p-valor ={' '}
                  {ex9Data.swX.pValue < 0.0001
                    ? '< 0,0001'
                    : formatBR(ex9Data.swX.pValue, 4)}
                </Text>
                <Text size="sm" mb="md">
                  Tempo sólido: W = {formatBR(ex9Data.swY.W, 4)}, p-valor ={' '}
                  {ex9Data.swY.pValue < 0.0001
                    ? '< 0,0001'
                    : formatBR(ex9Data.swY.pValue, 4)}
                </Text>

                {/* Part (a) */}
                <Text size="sm" fw={600} mt="lg" mb="xs">
                  (a) Qual teste é mais apropriado?
                </Text>
                <Select
                  data={[
                    {
                      value: 'Teste de Correlação de Spearman',
                      label: 'Teste de Correlação de Spearman',
                    },
                    { value: 'Qui-Quadrado', label: 'Qui-Quadrado' },
                    { value: 't de Student', label: 't de Student' },
                  ]}
                  value={ex9Test}
                  onChange={setEx9Test}
                  w={320}
                  mb="sm"
                />
                <Button
                  onClick={() => {
                    const ok =
                      ex9Test === 'Teste de Correlação de Spearman';
                    setEx9TestFb(
                      ok
                        ? {
                            ok: true,
                            msg: 'Correto! Como os dados não seguem distribuição normal (Shapiro-Wilk), o teste de correlação de Spearman é o mais apropriado.',
                          }
                        : {
                            ok: false,
                            msg: 'Incorreto. Observe os resultados do teste de normalidade (Shapiro-Wilk) e escolha o teste de correlação adequado para dados não normais.',
                          },
                    );
                    if (!ok) {
                      setEx9AssocFb(null);
                    }
                  }}
                >
                  Verificar
                </Button>
                {renderFb(ex9TestFb)}

                {ex9TestFb?.ok && (
                  <>
                    <Text size="sm" mt="md">
                      <strong>Correlação de Spearman:</strong> r ={' '}
                      {formatBR(ex9Data.r, 4)} | <strong>p-valor:</strong>{' '}
                      {ex9Data.pVal < 0.0001
                        ? '< 0,0001'
                        : formatBR(ex9Data.pVal, 4)}
                    </Text>

                    {/* Part (b) */}
                    <Text size="sm" fw={600} mt="lg" mb="xs">
                      (b) As variáveis estão relacionadas ao nível de 5%?
                    </Text>
                    <Select
                      data={[
                        { value: 'Sim', label: 'Sim' },
                        { value: 'Não', label: 'Não' },
                      ]}
                      value={ex9Assoc}
                      onChange={setEx9Assoc}
                      w={200}
                      mb="sm"
                    />
                    <Button
                      onClick={() => {
                        const ok = ex9Assoc === 'Sim';
                        setEx9AssocFb(
                          ok
                            ? {
                                ok: true,
                                msg: 'Correto! O p-valor é menor que 0,05, indicando que as variáveis estão significativamente relacionadas.',
                              }
                            : {
                                ok: false,
                                msg: 'Incorreto. Compare o p-valor com o nível de significância de 5% (0,05).',
                              },
                        );
                      }}
                    >
                      Verificar
                    </Button>
                    {renderFb(ex9AssocFb)}
                  </>
                )}
              </>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </PageWrapper>
  );
}
