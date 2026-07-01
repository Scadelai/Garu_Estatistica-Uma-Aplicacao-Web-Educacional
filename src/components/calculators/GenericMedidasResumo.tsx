import { useMemo, useState } from 'react';
import { Container, Grid, Paper, Title, Text, Select, Group } from '@mantine/core';
import {
  mean,
  median,
  getMode,
  populationVariance,
  sampleVariance,
  standardError,
  quartiles,
  iqr,
} from '../../utils/statistics';
import { formatBR } from '../../utils/formatting';

interface GenericMedidasResumoProps {
  dataset: any[];
  numericCols: string[];
}

export default function GenericMedidasResumo({ dataset, numericCols }: GenericMedidasResumoProps) {
  const [selectedCol, setSelectedCol] = useState<string>(numericCols[0] || '');

  const stats = useMemo(() => {
    if (!selectedCol || dataset.length === 0) return null;
    
    // Extract and filter valid numeric values
    const rawValues = dataset.map((row) => Number(row[selectedCol])).filter(val => !isNaN(val));
    if (rawValues.length === 0) return null;

    const sorted = [...rawValues].sort((a, b) => a - b);
    const n = sorted.length;
    
    const meanVal = mean(sorted);
    const medianVal = median(sorted);
    const modes = getMode(sorted);
    const q = quartiles(sorted);
    const iqrVal = iqr(sorted);
    const popVar = populationVariance(sorted);
    const sampVar = sampleVariance(sorted);
    const popSd = Math.sqrt(popVar);
    const sampSd = Math.sqrt(sampVar);
    const stdErr = standardError(sorted);
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];
    const amplitude = maxVal - minVal;
    
    // Coefficient of variation (sample)
    const cv = (sampSd / meanVal) * 100;

    return {
      n, meanVal, medianVal, modes,
      q25: q.q1, q50: q.q2, q75: q.q3,
      iqrVal, popVar, sampVar, popSd, sampSd,
      stdErr, minVal, maxVal, amplitude, cv
    };
  }, [dataset, selectedCol]);

  if (numericCols.length === 0) {
    return <Text c="dimmed">Por favor, carregue dados com colunas numéricas.</Text>;
  }

  return (
    <Container fluid px={0}>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Variável de Análise</Title>
            <Select
              label="Selecione a coluna numérica"
              data={numericCols}
              value={selectedCol}
              onChange={(val) => val && setSelectedCol(val)}
              searchable
            />
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
          {stats ? (
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="sm" p="md" withBorder>
                  <Title order={5} mb="md">Medidas de Posição</Title>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Tamanho da amostra (n):</Text>
                    <Text>{stats.n}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Média:</Text>
                    <Text>{formatBR(stats.meanVal, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Mínimo:</Text>
                    <Text>{formatBR(stats.minVal, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>1º Quartil (Q1):</Text>
                    <Text>{formatBR(stats.q25, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Mediana (Q2):</Text>
                    <Text>{formatBR(stats.medianVal, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>3º Quartil (Q3):</Text>
                    <Text>{formatBR(stats.q75, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Máximo:</Text>
                    <Text>{formatBR(stats.maxVal, 2)}</Text>
                  </Group>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="sm" p="md" withBorder>
                  <Title order={5} mb="md">Medidas de Dispersão</Title>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Amplitude:</Text>
                    <Text>{formatBR(stats.amplitude, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Distância Interquartílica (DIQ):</Text>
                    <Text>{formatBR(stats.iqrVal, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Variância:</Text>
                    <Text>{formatBR(stats.sampVar, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Desvio Padrão:</Text>
                    <Text>{formatBR(stats.sampSd, 2)}</Text>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Coeficiente de Variação:</Text>
                    <Text>{formatBR(stats.cv, 2)}%</Text>
                  </Group>
                </Paper>
              </Grid.Col>
            </Grid>
          ) : (
            <Text c="dimmed">Não foi possível calcular estatísticas para a coluna selecionada.</Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
