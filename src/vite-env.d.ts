/// <reference types="vite/client" />

declare module 'jstat' {
  const jStat: {
    normal: {
      pdf: (x: number, mean: number, sd: number) => number;
      cdf: (x: number, mean: number, sd: number) => number;
      inv: (p: number, mean: number, sd: number) => number;
      sample: (mean: number, sd: number) => number;
    };
    studentt: {
      pdf: (x: number, df: number) => number;
      cdf: (x: number, df: number) => number;
      inv: (p: number, df: number) => number;
    };
    chisquare: {
      pdf: (x: number, df: number) => number;
      cdf: (x: number, df: number) => number;
      inv: (p: number, df: number) => number;
    };
    binomial: {
      pdf: (k: number, n: number, p: number) => number;
      cdf: (k: number, n: number, p: number) => number;
    };
    poisson: {
      pdf: (k: number, lambda: number) => number;
      cdf: (k: number, lambda: number) => number;
    };
    exponential: {
      pdf: (x: number, rate: number) => number;
      cdf: (x: number, rate: number) => number;
    };
  };
  export default jStat;
}

declare module 'react-katex' {
  import { ComponentType } from 'react';
  export const BlockMath: ComponentType<{ math: string }>;
  export const InlineMath: ComponentType<{ math: string }>;
}
