import {
  IconTable, IconChartPie, IconChartBar, IconDice,
  IconChartArea, IconDatabase, IconPencil, IconUsers,
  IconFlask,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

export interface AppItem {
  name: string;
  path: string;
  icon: Icon;
  color: string;
}

export interface FolderItem {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  color: string;
  apps: AppItem[];
}

/** Standalone items rendered outside of folders (direct navigation) */
export interface StandaloneItem {
  name: string;
  path: string;
  icon: Icon;
  color: string;
  description: string;
}

export const folders: FolderItem[] = [
  {
    id: 'descritiva', name: 'Descritiva', description: 'Explore, organize e sumarize seus dados com tabelas, medidas e gráficos', icon: IconTable, color: 'cyan',
    apps: [
      { name: 'Tipos de Variáveis', path: '/tipos-de-variaveis', icon: IconDatabase, color: 'cyan' },
      { name: 'Tabela de Frequências', path: '/tabela-de-frequencias', icon: IconTable, color: 'cyan' },
      { name: 'Medidas Resumo', path: '/medidas-resumo', icon: IconChartBar, color: 'cyan' },
      { name: 'Gráficos Qualitativos', path: '/graficos-qualitativos', icon: IconChartPie, color: 'teal' },
      { name: 'Gráficos Quantitativos', path: '/graficos-quantitativos', icon: IconChartBar, color: 'teal' },
      { name: 'Gráficos Bidimensionais', path: '/graficos-bidimensionais', icon: IconChartBar, color: 'teal' },
    ]
  },
  {
    id: 'probabilidade', name: 'Probabilidade', description: 'Descubra as principais distribuições de probabilidade', icon: IconDice, color: 'indigo',
    apps: [
      { name: 'Distribuições', path: '/distribuicoes', icon: IconDice, color: 'indigo' },
    ]
  },
  {
    id: 'inferencia', name: 'Inferência', description: 'Realize testes de hipóteses para populações maiores a partir de amostras', icon: IconChartArea, color: 'blue',
    apps: [
      { name: 'Teste T', path: '/teste-t', icon: IconChartArea, color: 'blue' },
      { name: 'Qui-quadrado', path: '/teste-qui-quadrado', icon: IconTable, color: 'blue' },
      { name: 'Teste de Correlação', path: '/teste-correlacao', icon: IconChartArea, color: 'blue' },
    ]
  },
  {
    id: 'exercicios', name: 'Exercícios', description: 'Teste seus conhecimentos e explore as bases de dados disponíveis', icon: IconPencil, color: 'orange',
    apps: [
      { name: 'Exercícios Teóricos', path: '/exercicios-teoricos', icon: IconPencil, color: 'orange' },
      { name: 'Exercícios Práticos', path: '/exercicios-praticos', icon: IconPencil, color: 'orange' },
      { name: 'Conjuntos de Dados', path: '/conjuntos-de-dados', icon: IconDatabase, color: 'orange' },
    ]
  },
  {
    id: 'info', name: 'Institucional', description: 'Saiba mais sobre o GARU Estatística, a equipe e contatos', icon: IconUsers, color: 'gray',
    apps: [
      { name: 'O Projeto', path: '/sobre', icon: IconDatabase, color: 'gray' },
      { name: 'Equipe', path: '/equipe', icon: IconUsers, color: 'gray' },
      { name: 'Contato', path: '/contato', icon: IconUsers, color: 'gray' },
    ]
  }
];

/** Standalone items that appear outside folder grid */
export const standaloneItems: StandaloneItem[] = [
  {
    name: 'Meu Laboratório',
    path: '/meu-laboratorio',
    icon: IconFlask,
    color: 'violet',
    description: 'Importe seus próprios dados CSV e aplique todas as ferramentas da plataforma',
  },
];

/** Find the folder (category) that a given path belongs to */
export function findFolderByPath(path: string): FolderItem | undefined {
  return folders.find(f => f.apps.some(a => a.path === path));
}

/** Find the specific app within a folder by path */
export function findAppByPath(path: string): AppItem | undefined {
  for (const folder of folders) {
    const app = folder.apps.find(a => a.path === path);
    if (app) return app;
  }
  // Check standalone items
  const standalone = standaloneItems.find(s => s.path === path);
  if (standalone) return { name: standalone.name, path: standalone.path, icon: standalone.icon, color: standalone.color };
  return undefined;
}
