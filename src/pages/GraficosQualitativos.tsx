import { useState, useMemo } from 'react';
import { Grid, Paper, Title, Text, Select } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import { CustomXAxisTick } from '../components/calculators/CustomXAxisTick';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { COLORFUL } from '../utils/colors';
import { frequencyTable } from '../utils/statistics';
import { dadosSaudeAlimentacao, FACTOR_COLUMNS } from '../data/dadosSaudeAlimentacao';
import { getFactorValues } from '../data';

export default function GraficosQualitativos() {
  const [selectedCol, setSelectedCol] = useState<string>(FACTOR_COLUMNS[0]);

  const freqData = useMemo(() => {
    const values = getFactorValues(dadosSaudeAlimentacao, selectedCol);
    const table = frequencyTable(values);
    return table;
  }, [selectedCol]);

  const chartData = useMemo(
    () =>
      freqData.map((row) => ({
        name: row.category || '(vazio)',
        frequencia: row.freq,
        proporcao: row.prop,
        porcentagem: parseFloat(row.perc.replace(',', '.').replace('%', '')),
      })),
    [freqData],
  );

  const showPie = ['Sexo', 'Relacionamento', 'Pratica esportes', 'Toma vitaminas'].includes(selectedCol);

  return (
    <PageWrapper size="xl">

      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              Selecione uma variavel qualitativa (categorica) do conjunto de dados para visualizar sua
              distribuicao por meio de graficos de barras e, quando apropriado, graficos de setores (pizza).
            </Text>
            <Select
              label="Variavel qualitativa"
              data={FACTOR_COLUMNS.map((c) => ({ value: c, label: c }))}
              value={selectedCol}
              onChange={(val) => val && setSelectedCol(val)}
              mb="md"
              w={320}
            />
          </Paper>
        </Grid.Col>

        {/* Grafico de barras */}
        <Grid.Col span={showPie ? 7 : 12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">
              Grafico de Barras - Frequencia Relativa
            </Title>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomXAxisTick />}
                  height={100}
                  label={{ value: selectedCol, position: 'insideBottom', offset: -10, style: { fontSize: 14, fill: '#333' } }}
                />
                <YAxis
                  label={{
                    value: 'Frequência Relativa',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    style: { fontSize: 13, fill: '#333' },
                  }}
                />
                <Bar dataKey="proporcao" name="Frequência Relativa">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORFUL[index % COLORFUL.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>

        {/* Grafico de setores (pizza) */}
        {showPie && (
          <Grid.Col span={5}>
            <Paper shadow="xs" p="md" withBorder>
              <Title order={5} mb="sm">
                Grafico de Setores
              </Title>
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="porcentagem"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, porcentagem }: any) =>
                      `${name}: ${porcentagem.toFixed(1).replace('.', ',')}%`
                    }
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORFUL[index % COLORFUL.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${value.toFixed(1).replace('.', ',')}%`,
                      'Porcentagem',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>
        )}
      </Grid>
    </PageWrapper>
  );
}
