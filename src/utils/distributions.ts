import jStat from 'jstat';

// Normal distribution
export const dnorm = (x: number, mean = 0, sd = 1) => jStat.normal.pdf(x, mean, sd);
export const pnorm = (x: number, mean = 0, sd = 1) => jStat.normal.cdf(x, mean, sd);
export const qnorm = (p: number, mean = 0, sd = 1) => jStat.normal.inv(p, mean, sd);

// Student t distribution
export const dt = (x: number, df: number) => jStat.studentt.pdf(x, df);
export const pt = (x: number, df: number) => jStat.studentt.cdf(x, df);
export const qt = (p: number, df: number) => jStat.studentt.inv(p, df);

// Chi-square distribution
export const dchisq = (x: number, df: number) => jStat.chisquare.pdf(x, df);
export const pchisq = (x: number, df: number) => jStat.chisquare.cdf(x, df);
export const qchisq = (p: number, df: number) => jStat.chisquare.inv(p, df);

// Binomial distribution
export const dbinom = (k: number, n: number, p: number) => jStat.binomial.pdf(k, n, p);
export const pbinom = (k: number, n: number, p: number) => jStat.binomial.cdf(k, n, p);

// Poisson distribution
export const dpois = (k: number, lambda: number) => jStat.poisson.pdf(k, lambda);
export const ppois = (k: number, lambda: number) => jStat.poisson.cdf(k, lambda);

// Exponential distribution
export const dexp = (x: number, rate: number) => jStat.exponential.pdf(x, rate);
export const pexp = (x: number, rate: number) => jStat.exponential.cdf(x, rate);

// Generate curve data points for plotting
export function generateCurveData(
  pdfFn: (x: number) => number,
  xMin: number,
  xMax: number,
  points = 200
): { x: number; y: number }[] {
  const step = (xMax - xMin) / points;
  const data: { x: number; y: number }[] = [];
  for (let x = xMin; x <= xMax; x += step) {
    data.push({ x, y: pdfFn(x) });
  }
  return data;
}

// Generate curve data with shaded region info
export function generateShadedCurveData(
  pdfFn: (x: number) => number,
  xMin: number,
  xMax: number,
  shadeMin: number,
  shadeMax: number,
  points = 200
): { x: number; y: number; shaded: number | null }[] {
  const step = (xMax - xMin) / points;
  const data: { x: number; y: number; shaded: number | null }[] = [];
  for (let x = xMin; x <= xMax; x += step) {
    const y = pdfFn(x);
    data.push({
      x,
      y,
      shaded: x >= shadeMin && x <= shadeMax ? y : null,
    });
  }
  return data;
}

// Generate random normal samples
export function rnorm(n: number, mean = 0, sd = 1): number[] {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    samples.push(jStat.normal.sample(mean, sd));
  }
  return samples;
}
