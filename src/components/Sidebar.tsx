import { ScrollArea, NavLink } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconChartDots3,
  IconUsers,
  IconMail,
  IconDatabase,
  IconTable,
  IconChartPie,
  IconDice,
  IconChartArea,
  IconPencil,
  IconLayoutDashboard,
  IconFlask,
} from '@tabler/icons-react';

interface SidebarProps {
  onNavClick?: () => void;
}

export default function Sidebar({ onNavClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const go = (path: string) => {
    navigate(path);
    onNavClick?.();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <ScrollArea>
      <NavLink label="O projeto" leftSection={<IconChartDots3 size={18} />} active={isActive('/')} onClick={() => go('/')} />
      <NavLink label="Equipe" leftSection={<IconUsers size={18} />} active={isActive('/equipe')} onClick={() => go('/equipe')} />
      <NavLink label="Contato" leftSection={<IconMail size={18} />} active={isActive('/contato')} onClick={() => go('/contato')} />
      <NavLink label="Conjuntos de dados" leftSection={<IconDatabase size={18} />} active={isActive('/conjuntos-de-dados')} onClick={() => go('/conjuntos-de-dados')} />      <NavLink label="Meu Laboratório" leftSection={<IconFlask size={18} />} color="teal" variant="light" active={isActive('/meu-laboratorio')} onClick={() => go('/meu-laboratorio')} />

      <NavLink label="Descritiva" leftSection={<IconTable size={18} />} defaultOpened>
        <NavLink label="Tipos de Variáveis" active={isActive('/tipos-de-variaveis')} onClick={() => go('/tipos-de-variaveis')} />
        <NavLink label="Tabela de Frequências" active={isActive('/tabela-de-frequencias')} onClick={() => go('/tabela-de-frequencias')} />
        <NavLink label="Medidas Resumo" active={isActive('/medidas-resumo')} onClick={() => go('/medidas-resumo')} />
      </NavLink>

      <NavLink label="Gráficos" leftSection={<IconChartPie size={18} />} defaultOpened>
        <NavLink label="Variáveis Qualitativas" active={isActive('/graficos-qualitativos')} onClick={() => go('/graficos-qualitativos')} />
        <NavLink label="Variáveis Quantitativas" active={isActive('/graficos-quantitativos')} onClick={() => go('/graficos-quantitativos')} />
        <NavLink label="Gráficos Bidimensionais" active={isActive('/graficos-bidimensionais')} onClick={() => go('/graficos-bidimensionais')} />
      </NavLink>

      <NavLink label="Probabilidade" leftSection={<IconDice size={18} />} defaultOpened>
        <NavLink label="Distribuições" active={isActive('/distribuicoes')} onClick={() => go('/distribuicoes')} />
      </NavLink>

      <NavLink label="Inferência" leftSection={<IconChartArea size={18} />} defaultOpened>
        <NavLink label="Teste T para uma amostra" active={isActive('/teste-t')} onClick={() => go('/teste-t')} />
        <NavLink label="Teste Qui-quadrado" active={isActive('/teste-qui-quadrado')} onClick={() => go('/teste-qui-quadrado')} />
        <NavLink label="Teste de Correlação" active={isActive('/teste-correlacao')} onClick={() => go('/teste-correlacao')} />
      </NavLink>

      <NavLink label="Exercícios" leftSection={<IconPencil size={18} />} defaultOpened>
        <NavLink label="Exercícios Teóricos" active={isActive('/exercicios-teoricos')} onClick={() => go('/exercicios-teoricos')} />
        <NavLink label="Exercícios Práticos" active={isActive('/exercicios-praticos')} onClick={() => go('/exercicios-praticos')} />
      </NavLink>

      <NavLink label="Testes de Usabilidade (UX)" leftSection={<IconLayoutDashboard size={18} />} color="pink" variant="light" active>
        <NavLink label="Menu Superior" onClick={() => go('/mockup-superior')} />
        <NavLink label="GARU Estatística" onClick={() => go('/mockup-apps')} />
        <NavLink label="Menu Minimalista" onClick={() => go('/mockup-minimal')} />
      </NavLink>
    </ScrollArea>
  );
}
