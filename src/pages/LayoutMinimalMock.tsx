import { useState, useRef } from 'react';
import { AppShell, Burger, Group, Title, NavLink, Container, Paper, Tooltip, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { 
  IconChartDots3, IconUsers, IconTable, IconChartPie, 
  IconDice, IconChartArea, IconPencil 
} from '@tabler/icons-react';

const navItemStyle = { borderRadius: '12px', marginBottom: '8px', justifyContent: 'center', height: '50px' };

function SidebarMenu({ icon: Icon, label, items }: { icon: any, label: string, items: { label: string, path: string }[] }) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const closeTimeout = useRef<number>(0);

  const openMenu = () => {
    window.clearTimeout(closeTimeout.current);
    setOpened(true);
  };

  const closeMenu = () => {
    closeTimeout.current = window.setTimeout(() => {
      setOpened(false);
    }, 200);
  };

  const keepMenu = () => {
    window.clearTimeout(closeTimeout.current);
  };

  // Envolvemos o componente num Group ou Div que detecta a saida do mouse
  // O React propaga eventos de mouse atraves do Portal, entao entrar no Dropdown chama o keepMenu
  return (
    <div onMouseLeave={closeMenu}>
      <Menu 
        position="right-start" 
        withArrow 
        offset={10} 
        opened={opened}
        onChange={setOpened}
        trigger="click"
      >
        <Menu.Target>
          <div onMouseEnter={keepMenu} onClick={openMenu}>
            <Tooltip label={label} position="right" withArrow disabled={opened} transitionProps={{ duration: 200 }}>
              <NavLink 
                component="button" 
                label="" 
                leftSection={<Icon size={24} />} 
                style={navItemStyle} 
              />
            </Tooltip>
          </div>
        </Menu.Target>
        <Menu.Dropdown onMouseEnter={keepMenu}>
          {items.map((item) => (
            <Menu.Item key={item.path} onClick={() => { navigate(item.path); setOpened(false); }}>{item.label}</Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}

export default function LayoutMinimalMock() {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ borderBottom: 'none', backgroundColor: 'transparent' }}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3} ml="xl">Garu - Menu lateral</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" style={{ borderRight: 'none', backgroundColor: '#f1f3f5', borderRadius: '0 20px 20px 0', marginTop: '20px', height: 'calc(100vh - 40px)' }}>
        
        <Tooltip label="O Projeto" position="right" withArrow transitionProps={{ duration: 200 }}>
          <NavLink label="" leftSection={<IconChartDots3 size={24} />} style={navItemStyle} onClick={() => navigate('/')} />
        </Tooltip>

        <Tooltip label="Equipe" position="right" withArrow transitionProps={{ duration: 200 }}>
          <NavLink label="" leftSection={<IconUsers size={24} />} style={navItemStyle} onClick={() => navigate('/equipe')} />
        </Tooltip>

        <SidebarMenu 
          icon={IconTable} 
          label="Descritiva" 
          items={[
            { label: 'Tipos de Variáveis', path: '/tipos-de-variaveis' },
            { label: 'Tabela de Frequências', path: '/tabela-de-frequencias' },
            { label: 'Medidas Resumo', path: '/medidas-resumo' }
          ]} 
        />

        <SidebarMenu 
          icon={IconChartPie} 
          label="Gráficos" 
          items={[
            { label: 'Qualitativas', path: '/graficos-qualitativos' },
            { label: 'Quantitativas', path: '/graficos-quantitativos' },
            { label: 'Bidimensionais', path: '/graficos-bidimensionais' }
          ]} 
        />

        <SidebarMenu 
          icon={IconDice} 
          label="Probabilidade" 
          items={[
            { label: 'Distribuições', path: '/distribuicoes' }
          ]} 
        />

        <SidebarMenu 
          icon={IconChartArea} 
          label="Inferência" 
          items={[
            { label: 'Teste T', path: '/teste-t' },
            { label: 'Teste Qui-quadrado', path: '/teste-qui-quadrado' },
            { label: 'Teste de Correlação', path: '/teste-correlacao' }
          ]} 
        />

        <SidebarMenu 
          icon={IconPencil} 
          label="Exercícios" 
          items={[
            { label: 'Exercícios Teóricos', path: '/exercicios-teoricos' },
            { label: 'Exercícios Práticos', path: '/exercicios-praticos' }
          ]} 
        />

      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" pt="xl">
          <Paper shadow="sm" p="xl" radius="xl" withBorder>
            <Title order={2} mb="md">GARU Menu Principal</Title>
          </Paper>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
