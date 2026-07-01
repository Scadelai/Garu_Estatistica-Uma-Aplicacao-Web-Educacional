import { Table, ScrollArea, Text } from '@mantine/core';

interface DataTableViewProps {
  dataset: any[];
  columns: string[];
}

export default function DataTableView({ dataset, columns }: DataTableViewProps) {
  if (!dataset || dataset.length === 0) {
    return <Text c="dimmed">Nenhum dado disponível.</Text>;
  }

  // Display only first 50 rows for performance reasons in this preview
  const displayData = dataset.slice(0, 50);

  return (
    <ScrollArea h={500} offsetScrollbars>
      <Table striped highlightOnHover withTableBorder withColumnBorders style={{ fontSize: 12 }}>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col}>{col}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {displayData.map((row, idx) => (
            <Table.Tr key={idx}>
              {columns.map((col) => {
                const val = row[col];
                let displayVal = val;
                if (val === null || val === undefined) displayVal = 'NA';
                else if (typeof val === 'number') displayVal = val.toLocaleString('pt-BR');
                return <Table.Td key={col}>{displayVal}</Table.Td>;
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {dataset.length > 50 && (
        <Text size="xs" c="dimmed" mt="xs" ta="right">
          Visualizando 50 de {dataset.length} registros...
        </Text>
      )}
    </ScrollArea>
  );
}