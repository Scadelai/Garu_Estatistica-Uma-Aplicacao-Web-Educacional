import { create } from 'zustand';

interface DataStore {
  activeDataset: 'alimentacao' | 'paralisia';
  setActiveDataset: (dataset: 'alimentacao' | 'paralisia') => void;
}

export const useDataStore = create<DataStore>((set) => ({
  activeDataset: 'alimentacao',
  setActiveDataset: (dataset) => set({ activeDataset: dataset }),
}));
