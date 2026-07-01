import PageWrapper from '../components/PageWrapper';
import GenericQuiQuadrado from '../components/calculators/GenericQuiQuadrado';
import { dadosSaudeAlimentacao, SHORT_LEVEL_COLUMNS } from '../data/dadosSaudeAlimentacao';

export default function TesteQuiQuadrado() {
  return (
    <PageWrapper size="xl">
      <GenericQuiQuadrado 
        dataset={dadosSaudeAlimentacao} 
        factorCols={[...SHORT_LEVEL_COLUMNS]} 
      />
    </PageWrapper>
  );
}
