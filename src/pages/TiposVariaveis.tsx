import { Grid, Paper, Table, Title, Text, Image } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import garuVariaveis from '../assets/images/garu_variaveis.png';

const variaveisExemplo = [
  { variavel: 'Sexo', valores: "'Masculino', 'Feminino'", tipo: 'Qualitativa Nominal' },
  { variavel: 'Ano letivo', valores: '1, 2, 3, 4...', tipo: 'Quantitativa Discreta' },
  { variavel: 'Peso (kg)', valores: '61,2; 85; 119,3; ...', tipo: 'Quantitativa Contínua' },
  { variavel: 'Altura (m)', valores: '1,75; 1,67; 1,68; ...', tipo: 'Quantitativa Contínua' },
  { variavel: 'Idade (anos)', valores: '17, 21, 20,...', tipo: 'Quantitativa Discreta' },
  { variavel: 'Trabalho', valores: "'Tempo Integral', 'Meio Período', 'Não trabalha'", tipo: 'Qualitativa Ordinal' },
  { variavel: 'Relacionamento', valores: "'Solteiro', 'Em um relacionamento', 'Morando junto', ...", tipo: 'Qualitativa Nominal' },
  { variavel: 'Cozinha', valores: "'Sempre', 'Quase todo dia', 'Nunca', ...", tipo: 'Qualitativa Ordinal' },
  { variavel: 'Come Fora', valores: "'Sempre', 'Quase todo dia', 'Nunca', ...", tipo: 'Qualitativa Ordinal' },
  { variavel: 'Culinária Favorita', valores: "'Árabe', 'Oriental', 'Africana', ...", tipo: 'Qualitativa Nominal' },
  { variavel: 'Pratica exercícios', valores: "'Sempre', 'Quase todo dia', 'Nunca', ...", tipo: 'Qualitativa Ordinal' },
  { variavel: 'Pratica esportes', valores: "'Sim', 'Não'", tipo: 'Qualitativa Nominal' },
  { variavel: 'Toma Vitamina', valores: "'Sim', 'Não'", tipo: 'Qualitativa Nominal' },
  { variavel: 'HDL (mg/dL)', valores: '50,76; 56,43; 56,87;', tipo: 'Quantitativa Contínua' },
  { variavel: 'LDL (mg/dL)', valores: '84,93; 100,65; 101,47;', tipo: 'Quantitativa Contínua' },
  { variavel: 'Triglicérides (mg/dL)', valores: '61,32; 55,4; 91,62;', tipo: 'Quantitativa Contínua' },
  { variavel: 'Álcool: Consumo mensal', valores: "'Não bebe', 'Raramente', 'Ocasional', 'Frequente', ...", tipo: 'Qualitativa Ordinal' },
  { variavel: 'Álcool: Dose média', valores: "'Não bebe', 'Até 2 doses', '3 a 4 doses', ...", tipo: 'Qualitativa Ordinal' },
];

export default function TiposVariaveis() {
  return (
    <PageWrapper>
      <Grid gutter="lg">
        <Grid.Col span={6}>
          <Paper shadow="xs" p="md" mb="md" withBorder>
            <Title order={5} mb="sm">
              Variáveis Qualitativas
            </Title>
            <Text size="sm" style={{ lineHeight: 1.6 }}>
              As variáveis qualitativas representam um atributo ou característica do indivíduo.
              Ainda é possível realizar uma distinção dentro desse grupo: as variáveis qualitativas
              nominais, para quais não há nenhuma possível hierarquia ou ordenação entre suas
              possíveis realizações, e as variáveis qualitativas ordinais, para quais existe uma
              ordenação entre suas categorias. Para exemplificar, a variável sexo é uma variável
              qualitativa nominal, pois não há uma ordem entre os valores &apos;feminino&apos; e
              &apos;masculino&apos;, e a variável grau de instrução é um exemplo de variável
              qualitativa ordinal, pois há uma ordem entre seus possíveis valores: ensino primário,
              ensino fundamental, ensino médio, etc.
            </Text>
          </Paper>

          <Paper shadow="xs" p="md" mb="md" withBorder>
            <Title order={5} mb="sm">
              Variáveis Quantitativas
            </Title>
            <Text size="sm" style={{ lineHeight: 1.6 }}>
              Como indicado pelo nome, as variáveis quantitativas representam uma quantidade. Essas
              também podem ser classificadas em dois tipos: as variáveis quantitativas discretas,
              geralmente provenientes de uma contagem e cujos possíveis valores podem ser listados em
              um conjunto finito de números; e as variáveis quantitativas contínuas, provenientes de
              uma mensuração, e que podem assumir qualquer valor real dentro de um intervalo. Um
              exemplo da primeira é o número de filhos que uma pessoa tem (0, 1, 2, 3, ...), e
              exemplos clássicos da segunda são altura e peso.
            </Text>
          </Paper>

          <Text size="xs" c="dimmed" mt="md">
            Fonte: Morettin, P. and Bussab, W. (2000). Estatística Básica (7a. ed.). Editora
            Saraiva.
          </Text>
        </Grid.Col>

        <Grid.Col span={6}>
          <Image
            src={garuVariaveis}
            alt="Tipos de Variáveis"
            mb="lg"
            radius="md"
          />

          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Variável</Table.Th>
                <Table.Th>Possíveis Valores</Table.Th>
                <Table.Th>Tipo de Variável</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {variaveisExemplo.map((row, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{row.variavel}</Table.Td>
                  <Table.Td>{row.valores}</Table.Td>
                  <Table.Td>{row.tipo}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Grid.Col>
      </Grid>
    </PageWrapper>
  );
}
