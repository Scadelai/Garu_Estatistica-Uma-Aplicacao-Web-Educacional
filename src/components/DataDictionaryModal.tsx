import { Modal, Table } from '@mantine/core';

interface DataDictionaryModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  data: { variable: string; description: string }[];
}

export default function DataDictionaryModal({ opened, onClose, title, data }: DataDictionaryModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Variável</Table.Th>
            <Table.Th>Descrição</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((entry, i) => (
            <Table.Tr key={i}>
              <Table.Td fw={600}>{entry.variable}</Table.Td>
              <Table.Td>{entry.description}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Modal>
  );
}
