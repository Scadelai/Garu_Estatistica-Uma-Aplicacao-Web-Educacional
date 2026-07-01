import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Loader, Center } from '@mantine/core';

const LayoutAppsMock = lazy(() => import('./pages/LayoutAppsMock'));
const Projeto = lazy(() => import('./pages/Projeto'));
const Equipe = lazy(() => import('./pages/Equipe'));
const Contato = lazy(() => import('./pages/Contato'));
const ConjuntoDados = lazy(() => import('./pages/ConjuntoDados'));
const TiposVariaveis = lazy(() => import('./pages/TiposVariaveis'));
const TabelaFrequencias = lazy(() => import('./pages/TabelaFrequencias'));
const MedidasResumo = lazy(() => import('./pages/MedidasResumo'));
const GraficosQualitativos = lazy(() => import('./pages/GraficosQualitativos'));
const GraficosQuantitativos = lazy(() => import('./pages/GraficosQuantitativos'));
const GraficosBidimensionais = lazy(() => import('./pages/GraficosBidimensionais'));
const Distribuicoes = lazy(() => import('./pages/Distribuicoes'));
const TesteT = lazy(() => import('./pages/TesteT'));
const TesteQuiQuadrado = lazy(() => import('./pages/TesteQuiQuadrado'));
const TesteCorrelacao = lazy(() => import('./pages/TesteCorrelacao'));
const ExerciciosTeoricos = lazy(() => import('./pages/ExerciciosTeoricos'));
const ExerciciosPraticos = lazy(() => import('./pages/ExerciciosPraticos'));
const MeuLaboratorio = lazy(() => import('./pages/MeuLaboratorio'));

const SuspenseFallback = () => (
  <Center style={{ width: '100vw', height: '100vh' }}>
    <Loader size="xl" />
  </Center>
);

export default function App() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/" element={<LayoutAppsMock />} />
        <Route path="/sobre" element={<Projeto />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/conjuntos-de-dados" element={<ConjuntoDados />} />
        <Route path="/meu-laboratorio" element={<MeuLaboratorio />} />
        <Route path="/tipos-de-variaveis" element={<TiposVariaveis />} />
        <Route path="/tabela-de-frequencias" element={<TabelaFrequencias />} />
        <Route path="/medidas-resumo" element={<MedidasResumo />} />
        <Route path="/graficos-qualitativos" element={<GraficosQualitativos />} />
        <Route path="/graficos-quantitativos" element={<GraficosQuantitativos />} />
        <Route path="/graficos-bidimensionais" element={<GraficosBidimensionais />} />
        <Route path="/distribuicoes" element={<Distribuicoes />} />
        <Route path="/teste-t" element={<TesteT />} />
        <Route path="/teste-qui-quadrado" element={<TesteQuiQuadrado />} />
        <Route path="/teste-correlacao" element={<TesteCorrelacao />} />
        <Route path="/exercicios-teoricos" element={<ExerciciosTeoricos />} />
        <Route path="/exercicios-praticos" element={<ExerciciosPraticos />} />
      </Routes>
    </Suspense>
  );
}
