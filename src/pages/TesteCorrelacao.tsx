import PageWrapper from '../components/PageWrapper';
import GenericTesteCorrelacao from '../components/calculators/GenericTesteCorrelacao';
import { dadosSaudeAlimentacao, NUMERIC_COLUMNS } from '../data/dadosSaudeAlimentacao';

export default function TesteCorrelacao() {
  return (
    <PageWrapper size="xl">
      <GenericTesteCorrelacao
        dataset={dadosSaudeAlimentacao}
        numericCols={[...NUMERIC_COLUMNS]}
      />
    </PageWrapper>
  );
}
