import { Text, Paper } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';

export default function Contato() {
  return (
    <PageWrapper title="Contato" color="gray">
      <Paper shadow="xs" p="xl" withBorder>
        <Text mb="sm">
          Críticas, correções, sugestões ou interesse em participar do projeto
          devem ser enviadas para:
        </Text>
        <Text fw={700} mb="lg">garuestatistica@unifesp.br</Text>
        <Text>Garu Estatística, 2024. Versão 1.0.8</Text>
        <Text>Última atualização: 16/07/2024</Text>
      </Paper>
    </PageWrapper>
  );
}
