import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface FormulaBlockProps {
  formula: string;
  inline?: boolean;
}

export default function FormulaBlock({ formula, inline = false }: FormulaBlockProps) {
  if (inline) return <InlineMath math={formula} />;
  return <BlockMath math={formula} />;
}
