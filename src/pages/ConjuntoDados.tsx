import { Title, Text, Paper, Button, Group } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import { useDisclosure } from '@mantine/hooks';
import DataDictionaryModal from '../components/DataDictionaryModal';
import { DicioAlimentacao, DicioParalisia } from '../data';

export default function ConjuntoDados() {
  const [alimentacaoOpened, alimentacaoHandlers] = useDisclosure(false);
  const [paralisiaOpened, paralisiaHandlers] = useDisclosure(false);

  return (
    <PageWrapper size="md">

      <Paper shadow="xs" p="md" mb="lg" withBorder>
        <Title order={4} mb="sm">
          Alimentação
        </Title>
        <Text mb="md" style={{ lineHeight: 1.6 }}>
          &lsquo;dados_saude_alimentação.csv&rsquo; é uma versão didática do
          &lsquo;Food choices&rsquo;, banco de dados de domínio público
          disponível em Kaggle. A base inclui informações de preferências
          gastronômicas, nutrição e de saúde de estudantes. A variável
          &lsquo;altura&rsquo; e os dados relacionados aos exames laboratoriais
          (HDL, LDL etc.) não existiam na base de dados original e foram
          acrescentados, de modo fictício, por questões didáticas. Esta base será
          utilizada na apresentação de alguns conceitos estatísticos.
        </Text>
        <Group>
          <Button onClick={alimentacaoHandlers.open}>Abrir Dicionário</Button>
          <Button
            component="a"
            href="/data/dados_saude_alimentacao.csv"
            download
            variant="outline"
          >
            Download dos dados
          </Button>
        </Group>
      </Paper>

      <Paper shadow="xs" p="md" mb="lg" withBorder>
        <Title order={4} mb="sm">
          Paralisia Cerebral
        </Title>
        <Text mb="md" style={{ lineHeight: 1.6 }}>
          Para fins didáticos, algumas informações fornecidas pelas Diretrizes de
          Atenção à Pessoa com Paralisia Cerebral do Ministério da Saúde (2014) e
          achados de Aurélio et al. (2002) na comparação do padrão de deglutição
          de alimentos entre crianças com paralisia cerebral (PC) e crianças sem
          acometimentos neurológicos (SAN), em Curitiba/PR, foram simulados e
          inseridos na planilha &lsquo;dados_paralisia.csv&rsquo; aqui fornecida.
          Este banco de dados será utilizado em alguns exercícios.
        </Text>
        <Group>
          <Button onClick={paralisiaHandlers.open}>Abrir Dicionário</Button>
          <Button
            component="a"
            href="/data/dados_paralisia.csv"
            download
            variant="outline"
          >
            Download dos dados
          </Button>
        </Group>
      </Paper>

      <DataDictionaryModal
        opened={alimentacaoOpened}
        onClose={alimentacaoHandlers.close}
        title="Dicionário - Alimentação"
        data={DicioAlimentacao}
      />

      <DataDictionaryModal
        opened={paralisiaOpened}
        onClose={paralisiaHandlers.close}
        title="Dicionário - Paralisia Cerebral"
        data={DicioParalisia}
      />
    </PageWrapper>
  );
}
