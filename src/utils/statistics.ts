// Floor to nearest multiple of N
export function floorN(x: number, N: number): number {
  return Math.floor(x / N) * N;
}

// Ceil to nearest multiple of N
export function ceilN(x: number, N: number): number {
  return Math.ceil(x / N) * N;
}

// Generate nice ticks for charts
export function getNiceTicks(min: number, max: number, maxTicks = 5): { ticks: number[], min: number, max: number } {
  if (min === max) return { ticks: [min], min: min - 1, max: max + 1 };
  
  const range = max - min;
  const rawStep = range / maxTicks;
  const mag = Math.floor(Math.log10(rawStep));
  const magPow = Math.pow(10, mag);
  const msd = rawStep / magPow;
  
  let step = magPow;
  if (msd > 5) step = 10 * magPow;
  else if (msd > 2) step = 5 * magPow;
  else if (msd > 1) step = 2 * magPow;
  
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  
  const ticks = [];
  for (let t = niceMin; t <= niceMax + step / 2; t += step) {
    ticks.push(t);
  }
  
  return { ticks, min: niceMin, max: niceMax };
}

// Get mode(s) of a numeric array
export function getMode(values: number[]): number[] {
  const freq = new Map<number, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) || 0) + 1);
  }
  const maxFreq = Math.max(...freq.values());
  const modes: number[] = [];
  for (const [val, count] of freq) {
    if (count === maxFreq) modes.push(val);
  }
  return modes.sort((a, b) => a - b);
}

// Get mode(s) of a string array
export function getModeStr(values: string[]): string[] {
  const freq = new Map<string, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) || 0) + 1);
  }
  const maxFreq = Math.max(...freq.values());
  const modes: string[] = [];
  for (const [val, count] of freq) {
    if (count === maxFreq) modes.push(val);
  }
  return modes;
}

// Convert array to set notation string: {val1, val2, val3}
export function vectorToString(values: (number | string)[]): string {
  return `{${values.join(', ')}}`;
}

// Population variance (divides by n, not n-1)
export function populationVariance(values: number[]): number {
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
}

// Sample variance (divides by n-1)
export function sampleVariance(values: number[]): number {
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
}

// Population standard deviation
export function populationStdDev(values: number[]): number {
  return Math.sqrt(populationVariance(values));
}

// Sample standard deviation
export function sampleStdDev(values: number[]): number {
  return Math.sqrt(sampleVariance(values));
}

// Standard error
export function standardError(values: number[]): number {
  return sampleStdDev(values) / Math.sqrt(values.length);
}

// Mean
export function mean(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

// Median
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n % 2 === 1) return sorted[Math.floor(n / 2)];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

// Quartiles using same method as R (type 7 - default)
export function quartiles(values: number[]): { q1: number; q2: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  function quantile(p: number): number {
    const index = (n - 1) * p;
    const lo = Math.floor(index);
    const hi = Math.ceil(index);
    const frac = index - lo;
    if (lo === hi) return sorted[lo];
    return sorted[lo] * (1 - frac) + sorted[hi] * frac;
  }

  return {
    q1: quantile(0.25),
    q2: quantile(0.5),
    q3: quantile(0.75),
  };
}

// Interquartile range
export function iqr(values: number[]): number {
  const q = quartiles(values);
  return q.q3 - q.q1;
}

export function frequencyTable(values: string[], order?: string[]): { category: string; freq: number; prop: number; perc: string }[] {
  const freq = new Map<string, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) || 0) + 1);
  }
  const total = values.length;
  const result: { category: string; freq: number; prop: number; perc: string }[] = [];
  for (const [cat, count] of freq) {
    const prop = count / total;
    result.push({
      category: cat,
      freq: count,
      prop: Math.round(prop * 1000) / 1000,
      perc: (prop * 100).toFixed(1).replace('.', ',') + '%',
    });
  }
  if (order && order.length > 0) {
    result.sort((a, b) => {
      const idxA = order.indexOf(a.category);
      const idxB = order.indexOf(b.category);
      if (idxA === -1 && idxB === -1) return a.category.localeCompare(b.category);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  } else {
    result.sort((a, b) => a.category.localeCompare(b.category));
  }
  return result;
}

// Frequency table for numeric data with intervals
export function frequencyTableIntervals(values: number[], breaks: number[]): { interval: string; freq: number; prop: number; perc: string }[] {
  const result: { interval: string; freq: number; prop: number; perc: string }[] = [];
  const validValues = values.filter(v => !isNaN(v));
  const total = validValues.length;

  for (let i = 0; i < breaks.length - 1; i++) {
    const lo = breaks[i];
    const hi = breaks[i + 1];
    const count = validValues.filter(v => v > lo && v <= hi).length;
    const prop = count / total;
    result.push({
      interval: `(${lo},${hi}]`,
      freq: count,
      prop: Math.round(prop * 1000) / 1000,
      perc: (prop * 100).toFixed(1).replace('.', ',') + '%',
    });
  }
  return result;
}

// Generate sorted random integers in a range
export function generateRandomElements(count: number, min: number, max: number, type: 'discrete' | 'continuous' = 'discrete'): number[] {
  const elements: number[] = [];
  for (let i = 0; i < count; i++) {
    if (type === 'continuous') {
      elements.push(Math.random() * (max - min) + min);
    } else {
      elements.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
  }
  return elements.sort((a, b) => a - b);
}

// Contingency table
export function contingencyTable(var1: string[], var2: string[], order1?: string[], order2?: string[]): {
  matrix: number[][];
  rowLabels: string[];
  colLabels: string[];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
} {
  const rowLabels = [...new Set(var1)];
  if (order1 && order1.length > 0) {
    rowLabels.sort((a, b) => {
      const idxA = order1.indexOf(a);
      const idxB = order1.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  } else {
    rowLabels.sort((a, b) => a.localeCompare(b));
  }

  const colLabels = [...new Set(var2)];
  if (order2 && order2.length > 0) {
    colLabels.sort((a, b) => {
      const idxA = order2.indexOf(a);
      const idxB = order2.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  } else {
    colLabels.sort((a, b) => a.localeCompare(b));
  }

  const matrix = rowLabels.map(() => colLabels.map(() => 0));

  for (let i = 0; i < var1.length; i++) {
    const ri = rowLabels.indexOf(var1[i]);
    const ci = colLabels.indexOf(var2[i]);
    if (ri >= 0 && ci >= 0) matrix[ri][ci]++;
  }

  const rowTotals = matrix.map(row => row.reduce((s, v) => s + v, 0));
  const colTotals = colLabels.map((_, ci) => matrix.reduce((s, row) => s + row[ci], 0));
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0);

  return { matrix, rowLabels, colLabels, rowTotals, colTotals, grandTotal };
}

// Expected frequencies for chi-square test
export function expectedFrequencies(observed: {
  matrix: number[][]; rowTotals: number[]; colTotals: number[]; grandTotal: number;
}): number[][] {
  return observed.matrix.map((row, ri) =>
    row.map((_, ci) => (observed.rowTotals[ri] * observed.colTotals[ci]) / observed.grandTotal)
  );
}

// Chi-square test statistic
export function chiSquareStatistic(observed: number[][], expected: number[][]): number {
  let chi2 = 0;
  for (let i = 0; i < observed.length; i++) {
    for (let j = 0; j < observed[i].length; j++) {
      if (expected[i][j] > 0) {
        chi2 += (observed[i][j] - expected[i][j]) ** 2 / expected[i][j];
      }
    }
  }
  return chi2;
}

// Pearson correlation
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  const sdx = Math.sqrt(x.reduce((s, v) => s + (v - mx) ** 2, 0) / (n - 1));
  const sdy = Math.sqrt(y.reduce((s, v) => s + (v - my) ** 2, 0) / (n - 1));
  if (sdx === 0 || sdy === 0) return 0;
  const cov = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (n - 1);
  return cov / (sdx * sdy);
}

// Spearman correlation (rank-based)
export function spearmanCorrelation(x: number[], y: number[]): number {
  function rank(arr: number[]): number[] {
    const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array(arr.length);
    let i = 0;
    while (i < sorted.length) {
      let j = i;
      while (j < sorted.length && sorted[j].v === sorted[i].v) j++;
      const avgRank = (i + j + 1) / 2; // 1-based average rank for ties
      for (let k = i; k < j; k++) ranks[sorted[k].i] = avgRank;
      i = j;
    }
    return ranks;
  }
  return pearsonCorrelation(rank(x), rank(y));
}

// Shapiro-Wilk normality test (simplified implementation)
// Returns { W, pValue }
export function shapiroWilk(values: number[]): { W: number; pValue: number } {
  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const m = mean(sorted);
  const ss = sorted.reduce((s, v) => s + (v - m) ** 2, 0);

  if (ss === 0) return { W: 1, pValue: 1 };

  // Compute W statistic using normal quantiles approximation
  // Uses the rational approximation for the normal inverse CDF
  let b = 0;
  let sumSqM = 0;
  const halfN = Math.floor(n / 2);
  for (let i = 0; i < halfN; i++) {
    const p = (i + 1 - 0.375) / (n + 0.25);
    const m_i = Math.abs(normalInvApprox(p));
    b += m_i * (sorted[n - 1 - i] - sorted[i]);
    sumSqM += 2 * m_i * m_i;
  }
  const W = sumSqM > 0 ? (b * b) / (ss * sumSqM) : 1;

  // Approximate p-value using log-normal transform
  const mu = -1.2725 + 1.0521 * Math.log(n);
  const sigma = 1.0308 - 0.26758 * Math.log(n);
  const z = (Math.log(1 - Math.min(W, 0.9999)) - mu) / sigma;
  const pValue = 1 - normalCdfApprox(z);

  return { W: Math.min(W, 1), pValue: Math.max(0, Math.min(1, pValue)) };
}

// Approximate normal inverse CDF (probit) using rational approximation
function normalInvApprox(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [-3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
    4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// Approximate normal CDF using error function approximation
function normalCdfApprox(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327;
  const p = d * Math.exp(-x * x / 2) *
    (t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.3302744)))));
  return x > 0 ? 1 - p : p;
}
