import { AppShell, Burger, Group, Title, Button, Menu, UnstyledButton, Text, Container, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function LayoutSuperiorMock() {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header style={{ backgroundColor: '#2C2E33', color: 'white' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <Title order={4} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Garu Estatística</Title>
          </Group>
          <Group gap="xs" visibleFrom="sm">
            <Button variant="subtle" color="gray" c="white" onClick={() => navigate('/')}>O projeto</Button>
            <Button variant="subtle" color="gray" c="white" onClick={() => navigate('/equipe')}>Equipe</Button>
            
            <Menu trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <UnstyledButton style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                  <Text size="sm" fw={500} mr="xs">Descritiva</Text>
                  <IconChevronDown size={14} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate('/tipos-de-variaveis')}>Tipos de Variáveis</Menu.Item>
                <Menu.Item onClick={() => navigate('/tabela-de-frequencias')}>Tabela de Frequências</Menu.Item>
                <Menu.Item onClick={() => navigate('/medidas-resumo')}>Medidas Resumo</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <UnstyledButton style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                  <Text size="sm" fw={500} mr="xs">Gráficos</Text>
                  <IconChevronDown size={14} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate('/graficos-qualitativos')}>Qualitativas</Menu.Item>
                <Menu.Item onClick={() => navigate('/graficos-quantitativos')}>Quantitativas</Menu.Item>
                <Menu.Item onClick={() => navigate('/graficos-bidimensionais')}>Bidimensionais</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <UnstyledButton style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                  <Text size="sm" fw={500} mr="xs">Probabilidade</Text>
                  <IconChevronDown size={14} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate('/distribuicoes')}>Distribuições</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            
            <Menu trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <UnstyledButton style={{ display: 'flex', alignItems: 'center', color: 'white', padding: '8px 12px', borderRadius: '4px' }}>
                  <Text size="sm" fw={500} mr="xs">Inferência</Text>
                  <IconChevronDown size={14} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate('/teste-t')}>Teste T</Menu.Item>
                <Menu.Item onClick={() => navigate('/teste-qui-quadrado')}>Teste Qui-quadrado</Menu.Item>
                <Menu.Item onClick={() => navigate('/teste-correlacao')}>Teste de Correlação</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Main>
        <Container size="md" mt="xl">
          <Paper shadow="sm" radius="md" p="xl" withBorder>
            <Title order={2} mb="md">Layout com Menu Superior</Title>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
