import { describe, it, expect } from 'vitest';
import {
  floorN, ceilN, getMode, getModeStr, vectorToString,
  populationVariance, sampleVariance, populationStdDev, sampleStdDev, standardError,
  mean, median, quartiles, iqr,
  frequencyTable, frequencyTableIntervals,
  generateRandomElements, contingencyTable, expectedFrequencies, chiSquareStatistic,
  pearsonCorrelation, spearmanCorrelation, shapiroWilk
} from './statistics';

describe('Statistics Utilities', () => {
  it('floorN / ceilN', () => {
    expect(floorN(12, 5)).toBe(10);
    expect(ceilN(12, 5)).toBe(15);
  });

  it('getMode / getModeStr', () => {
    expect(getMode([1, 2, 2, 3, 3, 3])).toEqual([3]);
    expect(getMode([1, 2, 2, 3, 3])).toEqual([2, 3]);

    expect(getModeStr(['a', 'b', 'b'])).toEqual(['b']);
    expect(getModeStr(['a', 'a', 'b', 'b'])).toEqual(['a', 'b']);
  });

  it('vectorToString', () => {
    expect(vectorToString([1, 2, 3])).toBe('{1, 2, 3}');
  });

  it('Central tendency & dispersion', () => {
    const data = [1, 2, 3, 4, 5];
    expect(mean(data)).toBe(3);
    expect(median(data)).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(2.5);

    expect(populationVariance(data)).toBe(2);
    expect(sampleVariance(data)).toBe(2.5);
    expect(populationStdDev(data)).toBeCloseTo(1.414, 3);
    expect(sampleStdDev(data)).toBeCloseTo(1.581, 3);

    expect(standardError(data)).toBeCloseTo(sampleStdDev(data) / Math.sqrt(5), 5);
  });

  it('Quartiles & IQR', () => {
    const data = [1, 2, 3, 4, 5];
    const q = quartiles(data);
    expect(q.q1).toBe(2);
    expect(q.q2).toBe(3);
    expect(q.q3).toBe(4);
    expect(iqr(data)).toBe(2);
  });

  it('Frequency Tables', () => {
    const catData = ['A', 'A', 'B'];
    const tbl = frequencyTable(catData);
    expect(tbl.length).toBe(2);
    expect(tbl[0].category).toBe('A');
    expect(tbl[0].freq).toBe(2);
    expect(tbl[0].prop).toBeCloseTo(0.667, 3);
    
    // Testing numeric interval tables
    const numData = [1, 2, 3, 4, 5];
    const breaks = [0, 2, 4, 6];
    const itbl = frequencyTableIntervals(numData, breaks);
    expect(itbl.length).toBe(3);
    expect(itbl[0].interval).toBe('(0,2]');
    expect(itbl[0].freq).toBe(2); // 1, 2
  });

  it('Contingency / Chi-Square', () => {
    const var1 = ['M', 'M', 'F', 'F'];
    const var2 = ['Y', 'N', 'Y', 'N'];
    const ct = contingencyTable(var1, var2);
    expect(ct.grandTotal).toBe(4);
    
    const expFrame = expectedFrequencies(ct);
    expect(expFrame.length).toBe(2); // 2 rows

    const chi2 = chiSquareStatistic(ct.matrix, expFrame);
    expect(chi2).toBeGreaterThanOrEqual(0); // in this tied minimal instance it's 0
  });

  it('Correlations', () => {
    const x = [1, 2, 3];
    const y = [2, 4, 6];
    expect(pearsonCorrelation(x, y)).toBeCloseTo(1, 5);
    expect(spearmanCorrelation(x, y)).toBeCloseTo(1, 5);
  });

  it('Shapiro-Wilk', () => {
    const normData = [0.1, 0.2, 0.3, 0.4, 0.5];
    const sw = shapiroWilk(normData);
    expect(sw.W).toBeGreaterThan(0);
    expect(sw.pValue).toBeGreaterThanOrEqual(0);
  });

  it('generateRandomElements', () => {
    const elemsDiscrete = generateRandomElements(5, 1, 10, 'discrete');
    expect(elemsDiscrete.length).toBe(5);
    elemsDiscrete.forEach(v => {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(10);
    });

    const elemsCont = generateRandomElements(5, 1, 10, 'continuous');
    expect(elemsCont.length).toBe(5);
  });
});
