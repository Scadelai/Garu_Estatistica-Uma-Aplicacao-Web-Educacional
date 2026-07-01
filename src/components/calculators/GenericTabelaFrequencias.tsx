import { useMemo, useState, useEffect } from 'react';
import { Container, Grid, Paper, Title, Text, Select, Table } from '@mantine/core';
import { frequencyTable } from '../../utils/statistics';
import { CategoryOrderControl } from './CategoryOrderControl';

interface GenericTabelaFrequenciasProps {
  dataset: any[];
  factorCols: string[];
}

export default function GenericTabelaFrequencias({ dataset, factorCols }: GenericTabelaFrequenciasProps) {
  const [selectedCol, setSelectedCol] = useState<string>(factorCols[0] || '');
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  useEffect(() => {
    setCustomOrder([]);
    setHiddenCategories([]);
    if (selectedCol && dataset.length > 0) {
      const rawValues = dataset
        .map((row) => row[selectedCol])
        .filter((val) => val !== undefined && val !== null && String(val).trim() !== '');
      const unique = [...new Set(rawValues.map((v) => String(v)))];
      unique.sort((a, b) => a.localeCompare(b));
      setCustomOrder(unique);
    }
  }, [selectedCol, dataset]);

  const { rows, total } = useMemo(() => {
    if (!selectedCol || dataset.length === 0) return { rows: [], total: 0 };
    
    // Extract categorical valid string values, ignoring hidden ones
    const rawValues = dataset
      .map((row) => row[selectedCol])
      .filter((val) => val !== undefined && val !== null && String(val).trim() !== '')
      .map(v => String(v))
      .filter((cat) => !hiddenCategories.includes(cat));

    const table = frequencyTable(rawValues, customOrder);
    
    const totalFreq = table.reduce((s, r) => s + r.freq, 0);
    return { rows: table, total: totalFreq };
  }, [dataset, selectedCol, hiddenCategories, customOrder]);

  if (factorCols.length === 0) {
    return <Text c="dimmed">Por favor, carregue dados com colunas categóricas (fatores).</Text>;
  }

  return (
    <Container fluid px={0}>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Variável de Análise</Title>
            <Select
              label="Selecione a coluna categórica"
              data={factorCols}
              value={selectedCol}
              onChange={(val) => val && setSelectedCol(val)}
              searchable
              mb="md"
            />
            {customOrder.length > 0 && (
              <>
                <Title order={6} mt="xs" mb="xs">Ordem das Categorias</Title>
                <CategoryOrderControl 
                  order={customOrder} 
                  hiddenCategories={hiddenCategories}
                  onChange={setCustomOrder} 
                  onToggleHide={(cat) => setHiddenCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                  useColors={false} 
                />
              </>
            )}
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
          {rows.length > 0 ? (
            <Paper shadow="xs" p="md" withBorder>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{selectedCol}</Table.Th>
                    <Table.Th>Frequência Absoluta (n)</Table.Th>
                    <Table.Th>Proporção (p)</Table.Th>
                    <Table.Th>Porcentagem (%)</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{row.category}</Table.Td>
                      <Table.Td>{row.freq}</Table.Td>
                      <Table.Td>{row.prop.toFixed(4)}</Table.Td>
                      <Table.Td>{row.perc}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td>Total</Table.Td>
                    <Table.Td>{total}</Table.Td>
                    <Table.Td>1.0000</Table.Td>
                    <Table.Td>100%</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Paper>
          ) : (
            <Text c="dimmed">Não foi possível calcular tabela de frequências (todas as categorias ocultas ou dados inválidos).</Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
