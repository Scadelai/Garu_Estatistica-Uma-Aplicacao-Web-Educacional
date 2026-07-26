import { useMemo, useState, useEffect } from 'react';
import { Container, Grid, Paper, Title, Text, Select, Slider, Table } from '@mantine/core';
import { CategoryOrderControl } from './CategoryOrderControl';
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
import { RED_NAIL } from '../../utils/colors';
import { dchisq, pchisq, qchisq } from '../../utils/distributions';
import { contingencyTable, expectedFrequencies, chiSquareStatistic } from '../../utils/statistics';
import { formatBR, formatPValue } from '../../utils/formatting';

interface GenericQuiQuadradoProps {
  dataset: any[];
  factorCols: string[];
}

export default function GenericQuiQuadrado({ dataset, factorCols }: GenericQuiQuadradoProps) {
  const [var1, setVar1] = useState<string>(factorCols[0] || '');
  const [var2, setVar2] = useState<string>(factorCols[1] || factorCols[0] || '');
  const [alpha, setAlpha] = useState(0.05);

  const [customOrder1, setCustomOrder1] = useState<string[]>([]);
  const [hidden1, setHidden1] = useState<string[]>([]);
  const [customOrder2, setCustomOrder2] = useState<string[]>([]);
  const [hidden2, setHidden2] = useState<string[]>([]);

  useEffect(() => {
    setCustomOrder1([]);
    setHidden1([]);
    if (var1 && dataset.length > 0) {
      const vals = dataset.map((d) => String(d[var1] ?? 'NA'));
      const unique = [...new Set(vals)];
      unique.sort((a, b) => a.localeCompare(b));
      setCustomOrder1(unique);
    }
  }, [var1, dataset]);

  useEffect(() => {
    setCustomOrder2([]);
    setHidden2([]);
    if (var2 && dataset.length > 0) {
      const vals = dataset.map((d) => String(d[var2] ?? 'NA'));
      const unique = [...new Set(vals)];
      unique.sort((a, b) => a.localeCompare(b));
      setCustomOrder2(unique);
    }
  }, [var2, dataset]);

  const ctable = useMemo(() => {
    if (!var1 || !var2 || dataset.length === 0) return null;
    
    const filteredDataset = dataset.filter(row => {
      const val1 = String(row[var1] ?? 'NA');
      const val2 = String(row[var2] ?? 'NA');
      return !hidden1.includes(val1) && !hidden2.includes(val2);
    });

    const v1 = filteredDataset.map(item => String(item[var1] ?? 'NA'));
    const v2 = filteredDataset.map(item => String(item[var2] ?? 'NA'));
    
    return contingencyTable(v1, v2, customOrder1, customOrder2);
  }, [var1, var2, dataset, hidden1, hidden2, customOrder1, customOrder2]);

  const expected = useMemo(() => {
    if (!ctable) return null;
    return expectedFrequencies(ctable);
  }, [ctable]);

  const chi2 = useMemo(() => {
    if (!ctable || !expected) return 0;
    return chiSquareStatistic(ctable.matrix, expected);
  }, [ctable, expected]);

  const df = useMemo(() => {
    if (!ctable) return 1;
    return Math.max(1, (ctable.rowLabels.length - 1) * (ctable.colLabels.length - 1));
  }, [ctable]);

  const chiCrit = useMemo(() => qchisq(1 - alpha, df), [alpha, df]);
  const pValue = useMemo(() => 1 - pchisq(chi2, df), [chi2, df]);

  const chartData = useMemo(() => {
    const xMax = Math.max(chi2 * 1.5, chiCrit * 1.5, df * 3, 10);
    const step = xMax / 300;
    const data: { x: number; y: number; rejection: number | null; accept: number | null }[] = [];
    for (let x = 0.01; x <= xMax; x += step) {
      const y = dchisq(x, df);
      const inReject = x >= chiCrit;
      data.push({
        x,
        y,
        rejection: inReject ? y : null,
        accept: !inReject ? y : null,
      });
    }
    return data;
  }, [df, chiCrit, chi2]);

  if (factorCols.length < 2) {
    return (
      <Paper shadow="xs" p="md" withBorder>
        <Text c="red">São necessárias pelo menos duas variáveis qualitativas para este teste.</Text>
      </Paper>
    );
  }

  if (!ctable || !expected) return null;

  return (
    <Container size="xl" px={0}>
      <Grid gutter="lg">
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>
              O teste qui-quadrado de independência avalia se duas variáveis categóricas são
              independentes. Compara as frequências observadas com as frequências esperadas sob a
              hipótese de independência.
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Variável 1"
                  data={factorCols.map((c) => ({ value: c, label: c }))}
                  value={var1}
                  onChange={(val) => val && setVar1(val)}
                  mb="xs"
                />
                {customOrder1.length > 0 && (
                  <CategoryOrderControl 
                    order={customOrder1} 
                    hiddenCategories={hidden1}
                    onChange={setCustomOrder1} 
                    onToggleHide={(cat) => setHidden1(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                    useColors={false} 
                  />
                )}
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Variável 2"
                  data={factorCols.map((c) => ({ value: c, label: c }))}
                  value={var2}
                  onChange={(val) => val && setVar2(val)}
                  mb="xs"
                />
                {customOrder2.length > 0 && (
                  <CategoryOrderControl 
                    order={customOrder2} 
                    hiddenCategories={hidden2}
                    onChange={setCustomOrder2} 
                    onToggleHide={(cat) => setHidden2(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                    useColors={false} 
                  />
                )}
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Text size="sm" fw={500} mb={4}>χ² Crítico: {formatBR(chiCrit, 3)}</Text>
                <Text size="sm" fw={500} mb={4}>Estatística χ²: {formatBR(chi2, 3)}</Text>
                <Text size="sm" fw={500} mb={4}>P-Valor: {formatPValue(pValue, 3)}</Text>
                <Slider
                  min={0.01}
                  max={0.1}
                  step={0.01}
                  value={alpha}
                  onChange={setAlpha}
                  marks={[
                    { value: 0.01, label: '0,01' },
                    { value: 0.05, label: '0,05' },
                    { value: 0.1, label: '0,10' },
                  ]}
                />
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        {/* Observadas */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Frequências Observadas</Title>
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 12 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{var1} / {var2}</Table.Th>
                    {ctable.colLabels.map((col) => (
                      <Table.Th key={col}>{col}</Table.Th>
                    ))}
                    <Table.Th>Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ctable.rowLabels.map((row, ri) => (
                    <Table.Tr key={row}>
                      <Table.Td fw={600}>{row}</Table.Td>
                      {ctable.matrix[ri].map((val, ci) => (
                        <Table.Td key={ci}>{val}</Table.Td>
                      ))}
                      <Table.Td fw={600}>{ctable.rowTotals[ri]}</Table.Td>
                    </Table.Tr>
                  ))}
                  <Table.Tr fw={700}>
                    <Table.Td>Total</Table.Td>
                    {ctable.colTotals.map((val, ci) => (
                      <Table.Td key={ci}>{val}</Table.Td>
                    ))}
                    <Table.Td>{ctable.grandTotal}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </div>
          </Paper>
        </Grid.Col>

        {/* Esperadas */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Frequências Esperadas</Title>
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 12 }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{var1} / {var2}</Table.Th>
                    {ctable.colLabels.map((col) => (
                      <Table.Th key={col}>{col}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {ctable.rowLabels.map((row, ri) => (
                    <Table.Tr key={row}>
                      <Table.Td fw={600}>{row}</Table.Td>
                      {expected[ri].map((val, ci) => (
                        <Table.Td key={ci}>{formatBR(val, 3)}</Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </Paper>
        </Grid.Col>

        {/* Gráfico */}
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Distribuição Qui-Quadrado (df = {df}) | p-valor = {formatPValue(pValue, 3)}</Title>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" tickFormatter={(v: any) => formatBR(v, 1)} label={{ value: 'χ²', position: 'insideBottom', offset: -10 }} height={50} />
                <YAxis tickFormatter={(v: any) => formatBR(v, 3)} label={{ value: 'Densidade', angle: -90, position: 'insideLeft', offset: 10 }} width={80} />
                <Tooltip formatter={(v: any) => formatBR(v, 3)} labelFormatter={(v: any) => `x = ${formatBR(Number(v), 3)}`} />
                <Area type="monotone" dataKey="accept" name="Aceitação" stroke="none" fill="#bcbcbc" fillOpacity={0.3} />
                <Area type="monotone" dataKey="rejection" name="Rejeição" stroke="none" fill={RED_NAIL} fillOpacity={0.4} />
                <Area type="monotone" dataKey="y" name="Densidade" stroke={RED_NAIL} fill="none" strokeWidth={2} />
                <ReferenceLine
                  x={chiCrit}
                  stroke="#333"
                  strokeDasharray="5 3"
                  strokeWidth={1}
                  label={{ value: `crítico=${formatBR(chiCrit, 3)}`, position: 'top', fontSize: 10 }}
                />
                <ReferenceLine
                  x={chi2}
                  stroke="#1c7ed6"
                  strokeWidth={2}
                  label={{ value: `teste=${formatBR(chi2, 3)}`, position: 'top', fontSize: 10, fill: '#1c7ed6', dy: Math.abs(chi2 - chiCrit) < (df * 0.5) ? 15 : 0, dx: Math.abs(chi2 - chiCrit) < (df * 0.5) ? -5 : 0, textAnchor: Math.abs(chi2 - chiCrit) < (df * 0.5) ? 'end' : 'middle' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}