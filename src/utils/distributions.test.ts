import { describe, it, expect } from 'vitest';
import {
  dnorm, pnorm, qnorm,
  dt, pt, qt,
  dchisq, pchisq, qchisq,
  dbinom, pbinom,
  dpois, ppois,
  dexp, pexp,
  generateCurveData, generateShadedCurveData, rnorm
} from './distributions';

describe('Distributions', () => {
  describe('Normal Distribution', () => {
    it('dnorm should compute standard normal PDF', () => {
      expect(dnorm(0)).toBeCloseTo(0.3989, 4);
      expect(dnorm(0, 10, 2)).toBeCloseTo(0.0000007, 7);
    });

    it('pnorm should compute standard normal CDF', () => {
      expect(pnorm(0)).toBeCloseTo(0.5, 4);
      expect(pnorm(1.96)).toBeCloseTo(0.975, 3);
    });

    it('qnorm should compute standard normal quantile', () => {
      expect(qnorm(0.5)).toBeCloseTo(0, 4);
      expect(qnorm(0.975)).toBeCloseTo(1.96, 2);
    });
  });

  describe('Student t Distribution', () => {
    it('dt should compute PDF', () => {
      expect(dt(0, 10)).toBeCloseTo(0.3891, 4);
    });

    it('pt should compute CDF', () => {
      expect(pt(0, 10)).toBeCloseTo(0.5, 4);
    });

    it('qt should compute quantile', () => {
      expect(qt(0.5, 10)).toBeCloseTo(0, 4);
      expect(qt(0.975, 10)).toBeCloseTo(2.228, 3);
    });
  });

  describe('Chi-square Distribution', () => {
    it('dchisq should compute PDF', () => {
      expect(dchisq(2, 2)).toBeCloseTo(0.1839, 4);
    });

    it('pchisq should compute CDF', () => {
      expect(pchisq(2, 2)).toBeCloseTo(0.6321, 4);
    });

    it('qchisq should compute quantile', () => {
      expect(qchisq(0.5, 2)).toBeCloseTo(1.386, 3);
    });
  });

  describe('Binomial Distribution', () => {
    it('dbinom should compute PDF', () => {
      expect(dbinom(5, 10, 0.5)).toBeCloseTo(0.2461, 4);
    });

    it('pbinom should compute CDF', () => {
      expect(pbinom(5, 10, 0.5)).toBeCloseTo(0.623, 3);
    });
  });

  describe('Poisson Distribution', () => {
    it('dpois should compute PDF', () => {
      expect(dpois(3, 4)).toBeCloseTo(0.1954, 4);
    });

    it('ppois should compute CDF', () => {
      expect(ppois(3, 4)).toBeCloseTo(0.4335, 4);
    });
  });

  describe('Exponential Distribution', () => {
    it('dexp should compute PDF', () => {
      expect(dexp(1, 1)).toBeCloseTo(0.3679, 4);
    });

    it('pexp should compute CDF', () => {
      expect(pexp(1, 1)).toBeCloseTo(0.6321, 4);
    });
  });

  describe('Utilities', () => {
    it('generateCurveData should generate correctly sized data', () => {
      const data = generateCurveData((x) => x * x, 0, 10, 10);
      expect(data.length).toBe(11);
      expect(data[0]).toEqual({ x: 0, y: 0 });
      expect(data[10]).toEqual({ x: 10, y: 100 });
    });

    it('generateShadedCurveData should generate shaded segments appropriately', () => {
      // Small epsilon for float comparison logic, although we check exactly in range:
      const data = generateShadedCurveData((x) => x, 0, 10, 2, 8, 10);
      expect(data.length).toBe(11);
      
      const shadedItem = data.find(item => Math.abs(item.x - 5) < 0.001);
      expect(shadedItem?.shaded).not.toBeNull();
      
      const unshadedItem = data.find(item => Math.abs(item.x - 1) < 0.001);
      expect(unshadedItem?.shaded).toBeNull();
    });

    it('rnorm should generate random normally distributed values', () => {
      const samples = rnorm(100, 0, 1);
      expect(samples.length).toBe(100);
      samples.forEach(val => expect(typeof val).toBe('number'));
    });
  });
});
