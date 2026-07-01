import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Container, Grid, Paper, Title, Text, Select, Checkbox, Alert, Slider, Button, Group, SegmentedControl } from '@mantine/core';
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
  Legend,
  LabelList,
} from 'recharts';
import { COLORFUL } from '../../utils/colors';
import { CategoryOrderControl } from './CategoryOrderControl';
import { frequencyTable, quartiles, iqr, getNiceTicks } from '../../utils/statistics';
import { formatBR } from '../../utils/formatting';
import { CustomXAxisTick } from './CustomXAxisTick';
import { exportChartAsPNG } from '../../utils/exportChart';
import { IconAlertTriangle, IconDownload } from '@tabler/icons-react';

type ChartType = 'barras_v' | 'barras_h' | 'pizza' | 'histograma' | 'boxplot';

interface GraficoUnivariavelProps {
  dataset: Record<string, string | number | null>[];
  numericCols: string[];
  factorCols: string[];
  firstColumn: string | null;
}

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'barras_v', label: 'Barras (Vertical)' },
  { value: 'barras_h', label: 'Barras (Horizontal)' },
  { value: 'pizza', label: 'Setores' },
  { value: 'histograma', label: 'Histograma' },
  { value: 'boxplot', label: 'Boxplot' },
];

export default function GraficoUnivariavel({
 dataset, numericCols, factorCols, firstColumn }: GraficoUnivariavelProps) {
  const allCols = useMemo(() => [...factorCols, ...numericCols], [factorCols, numericCols]);
  const [selectedCol, setSelectedCol] = useState<string>(allCols[0] || '');
  const [chartType, setChartType] = useState<ChartType>('barras_v');
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [bins, setBins] = useState(10);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [freqMode, setFreqMode] = useState<'absoluta' | 'percentual'>('absoluta');

  const chartRef = useRef<HTMLDivElement>(null);

  const isFactor = useMemo(() => factorCols.includes(selectedCol), [factorCols, selectedCol]);
  const isNumeric = useMemo(() => numericCols.includes(selectedCol), [numericCols, selectedCol]);

  useEffect(() => {
    if (isFactor && selectedCol && dataset.length > 0) {
      const unique = [...new Set(dataset.map(d => {
        const v = d[selectedCol];
        return (v === null || v === undefined || String(v).trim() === '') ? '(vazio)' : String(v);
      }))].sort();
      setCustomOrder(prev => {
        if (prev.length === unique.length && prev.every((v, i) => v === unique[i])) return prev;
        return unique;
      });
    } else {
      setCustomOrder(prev => prev.length === 0 ? prev : []);
    }
  }, [selectedCol, isFactor, dataset]);

  useEffect(() => {
    setHiddenCategories([]);
  }, [selectedCol]);

  const activeDataset = useMemo(() => {
    if (hiddenCategories.length === 0 || !isFactor || !selectedCol) return dataset;
    return dataset.filter(row => {
      const v = row[selectedCol];
      const cat = (v === null || v === undefined || String(v).trim() === '') ? '(vazio)' : String(v);
      return !hiddenCategories.includes(cat);
    });
  }, [dataset, hiddenCategories, isFactor, selectedCol]);

  // Validation
  const categoricalCharts: ChartType[] = useMemo(() => ['barras_v', 'barras_h', 'pizza'], []);
  const numericCharts: ChartType[] = useMemo(() => ['histograma', 'boxplot'], []);
  const isInvalid = (isFactor && numericCharts.includes(chartType)) || (isNumeric && categoricalCharts.includes(chartType));
  
  const validCharts = useMemo(() => isFactor ? categoricalCharts : numericCharts, [isFactor, categoricalCharts, numericCharts]);

  // --- Categorical data ---
  const freqData = useMemo(() => {
    if (!selectedCol || !isFactor || activeDataset.length === 0) return [];
    const values = activeDataset
      .map((row) => row[selectedCol])
      .filter((v) => includeEmpty || (v !== null && v !== undefined && String(v).trim() !== ''))
      .map((v) => (v === null || v === undefined || String(v).trim() === '') ? '(vazio)' : String(v));
    return frequencyTable(values);
  }, [activeDataset, selectedCol, isFactor, includeEmpty]);

  const chartData = useMemo(() => {
    const data = freqData.map((row) => ({
      name: row.category || '(vazio)',
      frequencia: row.freq,
      proporcao: row.prop,
      porcentagem: parseFloat(row.perc.replace(',', '.').replace('%', '')),
    }));

    if (customOrder.length > 0) {
      data.sort((a, b) => {
        const idxA = customOrder.indexOf(a.name);
        const idxB = customOrder.indexOf(b.name);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    return data;
  }, [freqData, customOrder]);

  // --- Numeric data ---
  const numericValues = useMemo(() => {
    if (!selectedCol || !isNumeric) return [];
    return activeDataset
      .map((row) => {
        const v = row[selectedCol];
        if (v === null || v === undefined) return includeEmpty ? NaN : null;
        return Number(v);
      })
      .filter((v): v is number => v !== null && !isNaN(v));
  }, [activeDataset, selectedCol, isNumeric, includeEmpty]);

  const histogramData = useMemo(() => {
    if (numericValues.length === 0) return [];
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    if (min === max) {
      return [{ interval: `${formatBR(min, 1)}`, count: numericValues.length, relative: 1, percentualLabel: '100%' }];
    }
    const binWidth = (max - min) / bins;
    const total = numericValues.length;
    const data: { interval: string; count: number; relative: number; percentualLabel?: string }[] = [];
    for (let i = 0; i < bins; i++) {
      const from = min + i * binWidth;
      const to = min + (i + 1) * binWidth;
      const count = numericValues.filter((v) =>
        i === bins - 1 ? v >= from && v <= to : v >= from && v < to,
      ).length;
      data.push({
        interval: `${formatBR(from, 1)} - ${formatBR(to, 1)}`,
        count,
        relative: count / total,
        percentualLabel: count > 0 ? `${((count / total) * 100).toFixed(1).replace('.', ',')}%` : '',
      });
    }
    return data;
  }, [numericValues, bins]);

  const boxplotStats = useMemo(() => {
    if (numericValues.length === 0) return null;
    const sorted = [...numericValues].sort((a, b) => a - b);
    const q = quartiles(sorted);
    const iqrVal = iqr(sorted);
    const lowerBound = q.q1 - 1.5 * iqrVal;
    const upperBound = q.q3 + 1.5 * iqrVal;
    const nonOutliers = sorted.filter((v) => v >= lowerBound && v <= upperBound);
    const whiskerLow = nonOutliers.length > 0 ? nonOutliers[0] : q.q1;
    const whiskerHigh = nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : q.q3;
    const outlierEntries: { value: number; id: string }[] = [];
    activeDataset.forEach((row, index) => {
      const v = Number(row[selectedCol]);
      if (!isNaN(v) && (v < lowerBound || v > upperBound)) {
        const id = firstColumn && row[firstColumn] != null ? String(row[firstColumn]) : `Linha ${index + 1}`;
        outlierEntries.push({ value: v, id });
      }
    });
    return {
      q,
      iqrVal,
      whiskerLow,
      whiskerHigh,
      outlierEntries,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }, [numericValues, dataset, selectedCol, firstColumn, activeDataset]);

  // --- Boxplot hover state ---
  const [hoveredOutlier, setHoveredOutlier] = useState<{ value: number; id: string } | null>(null);

  const renderChart = useCallback(() => {
    if (chartType === 'barras_v' && isFactor) return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" interval={0} tick={<CustomXAxisTick />} height={110} label={{ value: selectedCol, position: 'insideBottom', offset: -5, style: { fontSize: 13, fill: '#333' } }} />
          <YAxis domain={freqMode === 'percentual' ? [0, 100] : ['auto', 'auto']} allowDecimals={false} label={{ value: freqMode === 'percentual' ? 'Percentual (%)' : 'Frequência Absoluta', angle: -90, position: 'insideLeft', offset: -5, dy: 40, style: { fontSize: 13, fill: '#333' } }} />
          <Tooltip formatter={(val: any) => [freqMode === 'percentual' ? `${Number(val).toFixed(1).replace('.', ',')}% (do Total)` : val, freqMode === 'percentual' ? 'Percentual' : 'Frequência']} />
          <Bar dataKey={freqMode === 'percentual' ? 'porcentagem' : 'frequencia'} name={freqMode === 'percentual' ? 'Percentual (%)' : 'Frequência Absoluta'}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORFUL[index % COLORFUL.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

    if (chartType === 'barras_h' && isFactor) return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={freqMode === 'percentual' ? [0, 100] : ['auto', 'auto']} allowDecimals={false} label={{ value: freqMode === 'percentual' ? 'Percentual (%)' : 'Frequência Absoluta', position: 'insideBottom', offset: -10, style: { fontSize: 13, fill: '#333' } }} height={60} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} label={{ value: selectedCol, angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 13, fill: '#333' } }} />
          <Tooltip formatter={(val: number | string | undefined) => [val, freqMode === 'percentual' ? 'Percentual (%)' : 'Frequência Absoluta']} />
          <Bar dataKey={freqMode === 'percentual' ? 'porcentagem' : 'frequencia'} name={freqMode === 'percentual' ? 'Percentual (%)' : 'Frequência Absoluta'}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORFUL[index % COLORFUL.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

    if (chartType === 'pizza' && isFactor) return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="porcentagem"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(1)}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORFUL[index % COLORFUL.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number | string | undefined) => [`${val}%`, 'Porcentagem']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );

    if (chartType === 'histograma' && isNumeric) return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap={0}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="interval"
            angle={-35}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 10, dy: 10 }}
            height={90}
            label={{ value: selectedCol, position: 'insideBottom', offset: -5, style: { fontSize: 13, fill: '#333' } }}
          />
          <YAxis 
            domain={[0, 1]}
            tickFormatter={(val: number) => `${(val * 100).toFixed(0)}%`}
            label={{ value: 'Percentual (%)', angle: -90, position: 'insideLeft', offset: -5, dy: 40, style: { fontSize: 13, fill: '#333' } }} 
          />
          <Tooltip formatter={(_value: unknown, _name: unknown, props: { payload?: { percentualLabel?: string, count?: number } }) => [`${props.payload?.percentualLabel || ''} (${props.payload?.count || 0})`, 'Frequência Relativa']} />
          <Bar dataKey="relative" name="Frequência Relativa" fill="#0C7BDC" stroke="#333">
            <LabelList dataKey="percentualLabel" position="top" fill="#333" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

    if (chartType === 'boxplot' && isNumeric && boxplotStats) {
      const { q, whiskerLow, whiskerHigh, outlierEntries, min: dataMin, max: dataMax } = boxplotStats;
      const svgW = 200;
      const svgH = 350;
      const padT = 30;
      const padB = 30;
      const plotH = svgH - padT - padB;
      const cx = svgW / 2;
      const boxW = 60;
      const minVal = Math.min(dataMin, whiskerLow);
      const maxVal = Math.max(dataMax, whiskerHigh);
      const { ticks, min: plotMinVal, max: plotMaxVal } = getNiceTicks(minVal, maxVal);
      const scale = (v: number) => {
        const denom = plotMaxVal - plotMinVal;
        return denom === 0 ? padT + plotH / 2 : padT + plotH - ((v - plotMinVal) / denom) * plotH;
      };
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
          {ticks.map((t) => <line key={`grid-${t}`} x1={cx - boxW - 10} y1={scale(t)} x2={svgW} y2={scale(t)} stroke="#eee" strokeWidth={1} />)}
          <line x1={cx - boxW - 10} y1={padT} x2={cx - boxW - 10} y2={svgH - padB} stroke="#999" strokeWidth={1} />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={cx - boxW - 14} y1={scale(t)} x2={cx - boxW - 10} y2={scale(t)} stroke="#999" strokeWidth={1} />
              <text x={cx - boxW - 18} y={scale(t)} dy=".35em" textAnchor="end" fontSize={11} fill="#666">{formatBR(t, 1)}</text>
            </g>
          ))}
          <line x1={cx} y1={scale(whiskerLow)} x2={cx} y2={scale(whiskerHigh)} stroke="#333" strokeWidth={1.5} />
          <line x1={cx - 15} y1={scale(whiskerLow)} x2={cx + 15} y2={scale(whiskerLow)} stroke="#333" strokeWidth={1.5} />
          <line x1={cx - 15} y1={scale(whiskerHigh)} x2={cx + 15} y2={scale(whiskerHigh)} stroke="#333" strokeWidth={1.5} />
          <rect x={cx - boxW / 2} y={scale(q.q3)} width={boxW} height={Math.max(scale(q.q1) - scale(q.q3), 1)} fill="#0C7BDC" stroke="#333" strokeWidth={1.5} />
          <line x1={cx - boxW / 2} y1={scale(q.q2)} x2={cx + boxW / 2} y2={scale(q.q2)} stroke="#333" strokeWidth={2.5} />
          {outlierEntries.map((o, i) => (
            <circle 
              key={`out-${i}`} cx={cx} cy={scale(o.value)} r={3.5} fill="#fff" stroke="#333" strokeWidth={1} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredOutlier({ value: o.value, id: o.id })}
              onMouseLeave={() => setHoveredOutlier(null)}
            />
          ))}
          {hoveredOutlier && (
            <text x={svgW} y={padT - 10} textAnchor="end" fontSize={11} fill="#e03131" fontWeight={600}>
              Outlier ID: {hoveredOutlier.id} | Valor: {formatBR(hoveredOutlier.value, 2)}
            </text>
          )}
        </svg>
      );
    }
    return null;
  }, [chartType, isFactor, isNumeric, chartData, histogramData, boxplotStats, selectedCol, hoveredOutlier, freqMode]);

  if (allCols.length === 0) {
    return <Text c="dimmed">Nenhuma variável disponível para gráficos.</Text>;
  }

  return (
    <Container fluid px={0}>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={5} mb="sm">Configurações</Title>
            <Select
              label="Tipo de Gráfico"
              data={CHART_OPTIONS}
              value={chartType}
              onChange={(v) => v && setChartType(v as ChartType)}
              mb="md"
            />
            <Select
              label="Variável"
              data={allCols.map((c) => ({ value: c, label: c }))}
              value={selectedCol}
              onChange={(v) => v && setSelectedCol(v)}
              searchable
              mb="md"
            />
            <Checkbox
              label="Considerar valores vazios (NA)"
              checked={includeEmpty}
              onChange={(e) => setIncludeEmpty(e.currentTarget.checked)}
              mb="md"
            />
            {(chartType === 'barras_v' || chartType === 'barras_h') && (
              <SegmentedControl
                mb="md"
                color="cyan"
                fullWidth
                size="xs"
                value={freqMode}
                onChange={(v) => setFreqMode(v as 'absoluta' | 'percentual')}
                data={[
                  { label: 'Frequência', value: 'absoluta' },
                  { label: 'Percentual', value: 'percentual' }
                ]}
              />
            )}
            {isFactor && customOrder.length > 0 && (
              <>
                <Title order={6} mt="md" mb="xs">Ordem das Categorias</Title>
                <CategoryOrderControl 
                  order={customOrder} 
                  hiddenCategories={hiddenCategories}
                  onChange={setCustomOrder} 
                  onToggleHide={(cat) => setHiddenCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                />
              </>
            )}
            {chartType === 'histograma' && isNumeric && (
              <>
                <Text size="sm" fw={500} mb={4}>Número de classes (bins): {bins}</Text>
                <Slider
                  min={5}
                  max={20}
                  value={bins}
                  onChange={setBins}
                  mb="md"
                  marks={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 15, label: '15' }, { value: 20, label: '20' }]}
                />
              </>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 9 }}>
          {isInvalid ? (
            <Paper shadow="xs" p="md" withBorder>
              <Alert icon={<IconAlertTriangle size={16} />} title="Seleção Inválida" color="yellow">
                A variável selecionada não é compatível com o gráfico "{CHART_OPTIONS.find(o => o.value === chartType)?.label}".
                {validCharts.length > 0 && (
                  <> Gráficos válidos para esta variável: <strong>{validCharts.map(v => CHART_OPTIONS.find(o => o.value === v)?.label).join(', ')}</strong>.</>
                )}
              </Alert>
            </Paper>
          ) : (
            <Paper shadow="xs" p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Title order={5}>Visualização</Title>
                <Button variant="light" size="xs" leftSection={<IconDownload size={14} />} onClick={() => exportChartAsPNG(chartRef, `grafico_${selectedCol}`)}>
                  Exportar PNG
                </Button>
              </Group>
              <div ref={chartRef} style={{ width: '100%', height: 400 }}>
                {renderChart()}
              </div>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
