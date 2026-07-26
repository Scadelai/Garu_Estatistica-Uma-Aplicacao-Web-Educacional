import { Image, Text, Stack, Paper } from '@mantine/core';
import PageWrapper from '../components/PageWrapper';
import garuLogo from '../assets/images/garu_3.png';

export default function Projeto() {
  return (
    <PageWrapper title="O Projeto" color="gray">
      <Paper shadow="xs" p="xl" withBorder>
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <Image src={garuLogo} alt="Garu Estatística" maw="100%" />
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            <Text mb="sm">Este é o projeto Garu Estatística.</Text>
            <Text mb="sm">
              Aqui você pode encontrar várias funcionalidades, como os principais
              conceitos da estatística descritiva e inferencial, além de exercícios.
            </Text>
            <Text mb="sm">
              Garu Estatística é um aplicativo gratuito, reestruturado em TypeScript e React por
              alunos de graduação e pós-graduação da Unifesp.
            </Text>
            <Text mb="sm">
              O app não é autossuficiente no ensino de estatística. A equipe se esforça
              para manter a correção e integridade das informações, mas reconhecemos que
              podem ocorrer falhas. Estamos sempre abertos a críticas construtivas.
            </Text>
            <Text mb="sm">
              A equipe está aberta a sugestões da comunidade para a abordagem de
              problemas sugeridos pelos usuários, dentro dos limites da equipe.
            </Text>
            <Text mb="sm">
              Interessados em participar do projeto, incluindo alunos de outras
              instituições, podem entrar em contato com a coordenação por meio do
              endereço de e-mail garuestatistica@unifesp.br.
            </Text>
          </div>
        </Stack>
      </Paper>
    </PageWrapper>
  );
}
