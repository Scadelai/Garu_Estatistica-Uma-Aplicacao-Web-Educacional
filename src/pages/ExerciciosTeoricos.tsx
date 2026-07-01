import { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Grid,
  Stack,
  Table,
} from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { exercIdosos } from '../data/exercIdosos';
import { exercImc } from '../data/exercImc';
import { COLORFUL } from '../utils/colors';

/* ------------------------------------------------------------------ */
/*  Chart data                                                         */
/* ------------------------------------------------------------------ */

const barData = [
  { name: 'Universidade', value: 120 },
  { name: 'Fac. Comunitária', value: 90 },
  { name: 'Exército', value: 15 },
  { name: 'Emprego', value: 85 },
  { name: 'Ano Sabático', value: 20 },
];

const pieData = [
  { name: 'Negócios', value: 25 },
  { name: 'Educação', value: 23 },
  { name: 'Engenharia', value: 14 },
  { name: 'Ciências da Saúde', value: 16 },
  { name: 'Artes', value: 22 },
];

/* ------------------------------------------------------------------ */
/*  Prepare exercIdosos line chart data                                */
/* ------------------------------------------------------------------ */

function buildIdososLineData() {
  const map = new Map<number, { mes: number; label: string; Masculina?: number; Feminina?: number }>();
  for (const row of exercIdosos) {
    if (!map.has(row.mes)) {
      map.set(row.mes, { mes: row.mes, label: row.label });
    }
    const entry = map.get(row.mes)!;
    if (row.sexo === 'Masculina') entry.Masculina = row.perc;
    else entry.Feminina = row.perc;
  }
  return Array.from(map.values()).sort((a, b) => a.mes - b.mes);
}

/* ------------------------------------------------------------------ */
/*  Prepare exercImc scatter data                                      */
/* ------------------------------------------------------------------ */

function buildImcScatterData() {
  const meninas = exercImc
    .filter((r) => r.sexo === 'Meninas')
    .map((r) => ({ x: r.perc_gordura, y: r.imc }));
  const meninos = exercImc
    .filter((r) => r.sexo === 'Meninos')
    .map((r) => ({ x: r.perc_gordura, y: r.imc }));
  return { meninas, meninos };
}

/* ------------------------------------------------------------------ */
/*  Chart components (rendered inside questions)                       */
/* ------------------------------------------------------------------ */

function BarChartPosGraduacao() {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text fw={600} ta="center" size="sm" mb={4}>
        Planos de pós-graduação dos formandos do Ensino Médio
      </Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" name="Alunos">
            {barData.map((_, i) => (
              <Cell key={i} fill={COLORFUL[i % COLORFUL.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Text size="xs" c="dimmed" ta="center">
        Nota: Um ano sabático significa que o aluno ficará de folga por um ano antes de decidir o que fazer.
      </Text>
    </div>
  );
}

function PieChartMatriculas() {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text fw={600} ta="center" size="sm" mb={4}>
        Percentual de matrículas por curso
      </Text>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORFUL[i % COLORFUL.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => `${v}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChartIdosos() {
  const data = useMemo(buildIdososLineData, []);
  return (
    <div style={{ marginBottom: 16 }}>
      <Text fw={600} ta="center" size="sm" mb={4}>
        Proporção de internações por doenças respiratórias na população idosa, segundo sexo, SP, 1995 a 2002
      </Text>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Masculina" stroke={COLORFUL[0]} dot={false} />
          <Line type="monotone" dataKey="Feminina" stroke={COLORFUL[6]} dot={false} />
          <ReferenceLine x={40} stroke="red" strokeDasharray="4 4">
            <Label value="Intervenção" position="top" fill="red" fontSize={12} />
          </ReferenceLine>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScatterChartImc() {
  const { meninas, meninos } = useMemo(buildImcScatterData, []);
  return (
    <div style={{ marginBottom: 16 }}>
      <Text fw={600} ta="center" size="sm" mb={4}>
        Distribuição do IMC por Percentual de Gordura Corporal
      </Text>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            name="% Gordura"
            type="number"
            tick={{ fontSize: 10 }}
            label={{ value: '% Gordura Corporal', position: 'insideBottom', offset: -10, fontSize: 12 }}
          />
          <YAxis
            dataKey="y"
            name="IMC"
            type="number"
            tick={{ fontSize: 10 }}
            label={{ value: 'IMC', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Meninas" data={meninas} fill={COLORFUL[6]} />
          <Scatter name="Meninos" data={meninos} fill={COLORFUL[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function TabelaHospital() {
  return (
    <Table withTableBorder withColumnBorders mb="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Variável</Table.Th>
          <Table.Th>Média</Table.Th>
          <Table.Th>Desvio padrão</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Salário (R$)</Table.Td>
          <Table.Td>1.950,00</Table.Td>
          <Table.Td>350,00</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Carga horária semanal (horas)</Table.Td>
          <Table.Td>35</Table.Td>
          <Table.Td>15</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/*  Question definitions                                               */
/* ------------------------------------------------------------------ */

interface Question {
  id: number;
  main: string;
  complement?: string;
  options: string[];
  correctIndex: number;
  chart?: () => React.ReactNode;
}

const questions: Question[] = [
  /* Q1 */
  {
    id: 1,
    main: 'Qual das seguintes medidas é afetada por um valor discrepante no conjunto de dados?',
    options: ['Média', 'Mediana', 'Moda', 'Primeiro quartil'],
    correctIndex: 0,
  },
  /* Q2 */
  {
    id: 2,
    main: 'Qual dos seguintes conjuntos de dados tem uma média de 15 e um desvio padrão de 0?',
    options: [
      '0, 15, 30',
      '15, 15, 15',
      '0, 0, 0',
      'Não existe um conjunto de dados com desvio padrão de 0',
    ],
    correctIndex: 1,
  },
  /* Q3 */
  {
    id: 3,
    main: 'Qual das seguintes afirmações é verdadeira?',
    options: [
      '50% dos valores está entre o 2º e o 3º quartis',
      '25% está entre a mediana e o valor máximo',
      '25% está entre a mediana e o valor mínimo',
      '50% dos valores de um conjunto de dados está entre a mediana e o valor máximo',
    ],
    correctIndex: 3,
  },
  /* Q4 */
  {
    id: 4,
    main: 'Suponha que o conjunto de dados contém os pesos, em quilos, de uma amostra aleatória de 100 recém-nascidos. Qual das medidas-resumo a seguir para a variável peso não é dada em quilos?',
    options: [
      'A média dos pesos',
      'O desvio padrão dos pesos',
      'A variância dos pesos',
      'A amplitude dos pesos',
    ],
    correctIndex: 2,
  },
  /* Q5 */
  {
    id: 5,
    main: 'O gráfico a seguir apresenta os planos de pós-graduação dos formandos de Ensino Médio.',
    complement: 'Qual é o plano de pós-graduação mais comum para esses formandos?',
    options: ['Emprego', 'Faculdade Comunitária', 'Universidade', 'Exército'],
    correctIndex: 2,
    chart: BarChartPosGraduacao,
  },
  /* Q6 */
  {
    id: 6,
    main: 'O gráfico a seguir apresenta os planos de pós-graduação dos formandos de Ensino Médio.',
    complement: 'Qual é o plano de pós-graduação menos comum?',
    options: ['Emprego', 'Faculdade Comunitária', 'Universidade', 'Exército'],
    correctIndex: 3,
    chart: BarChartPosGraduacao,
  },
  /* Q7 */
  {
    id: 7,
    main: 'O gráfico a seguir apresenta os planos de pós-graduação dos formandos de Ensino Médio.',
    complement: 'Quantos alunos planejam tirar um ano sabático ou ir para a universidade?',
    options: ['20', '120', '100', '140'],
    correctIndex: 3,
    chart: BarChartPosGraduacao,
  },
  /* Q8 */
  {
    id: 8,
    main: 'O gráfico a seguir apresenta os planos de pós-graduação dos formandos de Ensino Médio.',
    complement: 'Qual porcentagem da turma está planejando frequentar a faculdade comunitária?',
    options: ['90/330', '90/240', '240/330', '120/330'],
    correctIndex: 0,
    chart: BarChartPosGraduacao,
  },
  /* Q9 */
  {
    id: 9,
    main: 'O seguinte gráfico de pizza mostra a proporção de alunos matriculados em diferentes cursos de uma universidade.',
    complement: 'Se cada aluno está matriculado em apenas um curso, qual das afirmações está correta?',
    options: [
      '39% estudam Negócios e Engenharia',
      '22% estudam Educação',
      '37% estudam Educação ou Engenharia',
      '23% estudam Artes',
    ],
    correctIndex: 2,
    chart: PieChartMatriculas,
  },
  /* Q10 */
  {
    id: 10,
    main: 'Baseada no trabalho de Francisco et al. 2004, a figura abaixo exibe internações por doenças respiratórias em idosos e a intervenção vacinal contra influenza no Estado de São Paulo.',
    complement: 'Com base nesse gráfico, é correto afirmar que:',
    options: [
      'A proporção de internações é maior nas mulheres idosas',
      'Parece não haver efeito da vacina pois os percentuais mantiveram-se os mesmos',
      'Não há sazonalidade na proporção de internações',
      'Parece haver efeito da vacinação, pois os percentuais diminuíram entre os idosos',
    ],
    correctIndex: 3,
    chart: LineChartIdosos,
  },
  /* Q11 */
  {
    id: 11,
    main: 'Em um estudo transversal com 528 escolares de 6 a 10 anos de uma escola pública, foram consideradas as variáveis sexo, percentual de gordura corporal e índice de massa corporal (IMC). O gráfico abaixo apresenta a distribuição do IMC pelo percentual de gordura corporal, separado por sexo.',
    complement: 'Com relação à figura, é correto afirmar:',
    options: [
      'Há indícios de correlação negativa entre o IMC e o percentual de gordura das meninas',
      'Há indícios de correlação negativa entre o IMC e o percentual de gordura dos meninos',
      'Não há indícios de correlação positiva entre o IMC e o percentual de gordura das meninas',
      'Há indícios de correlação positiva entre o IMC e o percentual de gordura das meninas',
    ],
    correctIndex: 3,
    chart: ScatterChartImc,
  },
  /* Q12 */
  {
    id: 12,
    main: 'Abaixo, são dadas medidas resumo do salário mensal e da carga horária semanal de 100 funcionários de um hospital:',
    complement: 'Com base nessas informações, assinale a alternativa correta.',
    options: [
      'O salário possui menor variabilidade relativa, pois tem menor coeficiente de variação',
      'O salário possui menor variabilidade por ter maior desvio padrão',
      'A carga horária possui menor variabilidade por ter menor desvio padrão',
      'A carga horária possui menor variabilidade relativa, pois tem menor coeficiente de variação',
    ],
    correctIndex: 0,
    chart: TabelaHospital,
  },
  /* Q13 */
  {
    id: 13,
    main: 'A faixa etária é uma variável _____; um gráfico apropriado é o _____. A pressão arterial é uma variável _____; um gráfico apropriado é o _____.',
    options: [
      'Qualitativa ordinal; de barras; quantitativa discreta; de boxplot',
      'Quantitativa discreta; de barras; quantitativa contínua; histograma',
      'Qualitativa ordinal; de pizza; quantitativa contínua; boxplot',
      'Qualitativa ordinal; de barras; quantitativa contínua; histograma',
    ],
    correctIndex: 3,
  },
  /* Q14 */
  {
    id: 14,
    main: 'Para visualizar a relação entre idade gestacional (em semanas) e peso ao nascer (em kg), qual gráfico é mais apropriado?',
    options: [
      'Gráfico de barras',
      'Gráfico de linhas',
      'Gráfico de dispersão',
      'Boxplot',
    ],
    correctIndex: 2,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ExerciciosTeoricos() {
  const total = questions.length;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(new Array(total).fill(null));
  const [checked, setChecked] = useState<boolean[]>(new Array(total).fill(false));
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [tentativas, setTentativas] = useState(0);

  /* Whether we are past the last question (show final panel) */
  const showResult = current >= total;

  /* ---- handlers ---- */

  const handleSelect = (optIdx: any) => {
    if (checked[current]) return;
    const next = [...selected];
    next[current] = optIdx;
    setSelected(next);
  };

  const handleCheck = () => {
    if (selected[current] === null || checked[current]) return;
    const q = questions[current];
    const isCorrect = selected[current] === q.correctIndex;

    const nextChecked = [...checked];
    nextChecked[current] = true;
    setChecked(nextChecked);

    setTentativas((t) => t + 1);
    if (isCorrect) setAcertos((a) => a + 1);
    else setErros((e) => e + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleNext = () => {
    setCurrent(current + 1); // can go past total to show results
  };

  /* ---- render ---- */

  const renderQuestion = () => {
    const q = questions[current];
    const ChartComponent = q.chart;

    return (
      <Paper shadow="xs" p="md" withBorder>
        <Text size="sm" fw={600} mb="sm">
          Questão {q.id} de {total}
        </Text>

        {/* Chart / table if present */}
        {ChartComponent && <ChartComponent />}

        {/* Main text */}
        <Text size="md" fw={600} mb="xs">
          {q.id}. {q.main}
        </Text>

        {/* Complement text */}
        {q.complement && (
          <Text size="sm" mb="md" fs="italic">
            {q.complement}
          </Text>
        )}

        {/* Options */}
        <div>
          {q.options.map((opt, idx) => {
            let bgColor = 'transparent';
            let borderColor = '#dee2e6';

            if (checked[current]) {
              if (idx === q.correctIndex) {
                bgColor = '#d3f9d8';
                borderColor = '#40c057';
              } else if (idx === selected[current] && idx !== q.correctIndex) {
                bgColor = '#ffe3e3';
                borderColor = '#fa5252';
              }
            } else if (selected[current] === idx) {
              bgColor = '#e7f5ff';
              borderColor = '#339af0';
            }

            return (
              <Paper
                key={idx}
                shadow="none"
                p="sm"
                mb="xs"
                withBorder
                style={{
                  cursor: checked[current] ? 'default' : 'pointer',
                  backgroundColor: bgColor,
                  borderColor,
                  transition: 'all 0.15s ease',
                }}
                onClick={() => handleSelect(idx)}
              >
                <Text size="sm">
                  {String.fromCharCode(97 + idx)}) {opt}
                </Text>
              </Paper>
            );
          })}
        </div>

        {/* Verify button */}
        {!checked[current] && (
          <Button onClick={handleCheck} disabled={selected[current] === null} mt="md">
            Verificar
          </Button>
        )}

        {/* Feedback */}
        {checked[current] && (
          <Paper p="sm" mt="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Text size="sm" fw={600}>
              {selected[current] === q.correctIndex ? 'Correto!' : 'Incorreto.'}
            </Text>
          </Paper>
        )}

        {/* Navigation */}
        <Group justify="space-between" mt="lg">
          <Button variant="default" onClick={handlePrev} disabled={current === 0}>
            Questão anterior
          </Button>
          <Button variant="default" onClick={handleNext}>
            Próxima Questão
          </Button>
        </Group>
      </Paper>
    );
  };

  const renderFinalResult = () => (
    <Paper shadow="xs" p="xl" withBorder>
      <Title order={4} mb="md">
        Resultado Final
      </Title>
      <Stack gap="xs">
        <Text size="lg">
          Acertos: <b>{acertos}</b>
        </Text>
        <Text size="lg">
          Erros: <b>{erros}</b>
        </Text>
        <Text size="lg">
          Tentativas: <b>{tentativas}</b>
        </Text>
        <Text size="lg" fw={700} mt="sm">
          Aproveitamento: {tentativas > 0 ? ((acertos / tentativas) * 100).toFixed(0) : 0}%
        </Text>
      </Stack>
      <Button
        mt="lg"
        variant="default"
        onClick={() => setCurrent(0)}
      >
        Voltar às questões
      </Button>
    </Paper>
  );

  const renderSidebar = () => (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={5} mb="sm">
        Pontuação
      </Title>
      <Stack gap="xs">
        <Text size="sm">
          Acertos: <b>{acertos}</b>
        </Text>
        <Text size="sm">
          Erros: <b>{erros}</b>
        </Text>
        <Text size="sm">
          Tentativas: <b>{tentativas}</b>
        </Text>
      </Stack>
    </Paper>
  );

  return (
    <PageWrapper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 9 }}>
          {showResult ? renderFinalResult() : renderQuestion()}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          {renderSidebar()}
        </Grid.Col>
      </Grid>
    </PageWrapper>
  );
}
