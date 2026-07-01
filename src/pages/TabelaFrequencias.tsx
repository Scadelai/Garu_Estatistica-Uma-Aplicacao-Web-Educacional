import { useMemo } from 'react';
import { Grid, Paper, Tabs, Table, Title, Text } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import { dadosSaudeAlimentacao } from '../data';
import { frequencyTable, frequencyTableIntervals } from '../utils/statistics';
import { getFactorValues, getNumericValues } from '../data';

export default function TabelaFrequencias() {
  const relacionamentoTable = useMemo(() => {
    const values = getFactorValues(dadosSaudeAlimentacao, 'Relacionamento');
    const table = frequencyTable(values);
    table.sort((a, b) => a.category.localeCompare(b.category));
    const totalFreq = table.reduce((s, r) => s + r.freq, 0);
    return { rows: table, total: totalFreq };
  }, []);

  const anoLetivoTable = useMemo(() => {
    const values = getFactorValues(dadosSaudeAlimentacao, 'Ano letivo');
    const table = frequencyTable(values);
    table.sort((a, b) => Number(a.category) - Number(b.category));
    const totalFreq = table.reduce((s, r) => s + r.freq, 0);
    return { rows: table, total: totalFreq };
  }, []);

  const pesoTable = useMemo(() => {
    const values = getNumericValues(dadosSaudeAlimentacao, 'Peso');
    const breaks = [45, 60, 75, 90, 105, 120];
    const table = frequencyTableIntervals(values, breaks);
    const totalFreq = table.reduce((s, r) => s + r.freq, 0);
    return { rows: table, total: totalFreq };
  }, []);

  return (
    <PageWrapper>
      <Grid gutter="lg">
        <Grid.Col span={4}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={4} mb="md">
              Tabela de Frequências
            </Title>

            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              A tabela de frequências resume as observações referentes a uma variável, indicando a
              quantidade de vezes que cada valor ou categoria foi observado no conjunto de dados.
            </Text>

            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              A <strong>frequência absoluta</strong> de um determinado valor ou categoria é o número
              de vezes que este valor ou categoria foi observado no conjunto de dados. Por exemplo, se
              20 entre 100 estudantes pesquisados são solteiros, a frequência absoluta da categoria
              &lsquo;Solteiro&rsquo; é 20.
            </Text>

            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              A <strong>proporção</strong> (ou frequência relativa) de um valor ou categoria é a
              razão entre sua frequência absoluta e o número total de observações. No exemplo
              anterior, a proporção de solteiros seria 20/100 = 0,200, ou seja, 20,0%.
            </Text>

            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              Para variáveis quantitativas contínuas, cujos possíveis valores formam um intervalo de
              números reais, é necessário agrupar os valores em intervalos (ou faixas) para a
              construção da tabela de frequências.
            </Text>

            <Text size="xs" c="dimmed" mt="lg">
              Fonte: Morettin, P. and Bussab, W. (2000). Estatística Básica (7a. ed.). Editora
              Saraiva.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={8}>
          <Tabs defaultValue="exemplo1">
            <Tabs.List mb="md">
              <Tabs.Tab value="exemplo1">Exemplo 1</Tabs.Tab>
              <Tabs.Tab value="exemplo2">Exemplo 2</Tabs.Tab>
              <Tabs.Tab value="exemplo3">Exemplo 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="exemplo1">
              <Title order={5} mb="sm">
                Variável: Relacionamento (Qualitativa Nominal)
              </Title>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Relacionamento</Table.Th>
                    <Table.Th>Frequência Absoluta</Table.Th>
                    <Table.Th>Proporção</Table.Th>
                    <Table.Th>Porcentagem</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {relacionamentoTable.rows.map((row, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{row.category}</Table.Td>
                      <Table.Td>{row.freq}</Table.Td>
                      <Table.Td>{row.prop.toFixed(3).replace('.', ',')}</Table.Td>
                      <Table.Td>{row.perc}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td>Total</Table.Td>
                    <Table.Td>{relacionamentoTable.total}</Table.Td>
                    <Table.Td>1,000</Table.Td>
                    <Table.Td>100,0%</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel value="exemplo2">
              <Title order={5} mb="sm">
                Variável: Ano letivo (Quantitativa Discreta)
              </Title>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ano letivo</Table.Th>
                    <Table.Th>Frequência Absoluta</Table.Th>
                    <Table.Th>Proporção</Table.Th>
                    <Table.Th>Porcentagem</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {anoLetivoTable.rows.map((row, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{row.category}</Table.Td>
                      <Table.Td>{row.freq}</Table.Td>
                      <Table.Td>{row.prop.toFixed(3).replace('.', ',')}</Table.Td>
                      <Table.Td>{row.perc}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td>Total</Table.Td>
                    <Table.Td>{anoLetivoTable.total}</Table.Td>
                    <Table.Td>1,000</Table.Td>
                    <Table.Td>100,0%</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel value="exemplo3">
              <Title order={5} mb="sm">
                Variável: Peso (Quantitativa Contínua)*
              </Title>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Peso (kg)</Table.Th>
                    <Table.Th>Frequência Absoluta</Table.Th>
                    <Table.Th>Proporção</Table.Th>
                    <Table.Th>Porcentagem</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {pesoTable.rows.map((row, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{row.interval}</Table.Td>
                      <Table.Td>{row.freq}</Table.Td>
                      <Table.Td>{row.prop.toFixed(3).replace('.', ',')}</Table.Td>
                      <Table.Td>{row.perc}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td>Total</Table.Td>
                    <Table.Td>{pesoTable.total}</Table.Td>
                    <Table.Td>1,000</Table.Td>
                    <Table.Td>100,0%</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
              <Text size="xs" c="dimmed" mt="sm" fs="italic">
                *Dividiu-se as observações em intervalos.
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </PageWrapper>
  );
}
