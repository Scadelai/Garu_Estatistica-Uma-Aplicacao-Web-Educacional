import { create } from 'zustand';
import { generateRandomElements } from '../utils/statistics';

interface SummaryStore {
  elements: number[];
  count: number;
  min: number;
  max: number;
  type: 'discrete' | 'continuous';
  setCount: (count: number) => void;
  setRange: (min: number, max: number) => void;
  setType: (type: 'discrete' | 'continuous') => void;
  generate: () => void;
}

export const useSummaryStore = create<SummaryStore>((set, get) => ({
  elements: generateRandomElements(10, 1, 10, 'discrete'),
  count: 10,
  min: 1,
  max: 10,
  type: 'discrete',
  setCount: (count) => set({ count }),
  setRange: (min, max) => set({ min, max }),
  setType: (type) => {
    const { count, min, max } = get();
    set({ type, elements: generateRandomElements(count, min, max, type) });
  },
  generate: () => {
    const { count, min, max, type } = get();
    set({ elements: generateRandomElements(count, min, max, type) });
  },
}));
