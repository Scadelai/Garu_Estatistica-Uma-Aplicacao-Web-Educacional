import { create } from 'zustand';

export type CustomDatasetRecord = Record<string, string | number | null>;

interface CustomLabState {
  customDataset: CustomDatasetRecord[] | null;
  fileName: string | null;
  numericColumns: string[];
  factorColumns: string[];
  allColumns: string[];
  setCustomDataset: (
    data: CustomDatasetRecord[],
    name: string,
    numeric: string[],
    factor: string[],
    allCols: string[]
  ) => void;
  clearCustomDataset: () => void;
}

export const useCustomLabStore = create<CustomLabState>((set) => ({
  customDataset: null,
  fileName: null,
  numericColumns: [],
  factorColumns: [],
  allColumns: [],
  setCustomDataset: (data, name, numeric, factor, allCols) =>
    set({
      customDataset: data,
      fileName: name,
      numericColumns: numeric,
      factorColumns: factor,
      allColumns: allCols,
    }),
  clearCustomDataset: () =>
    set({
      customDataset: null,
      fileName: null,
      numericColumns: [],
      factorColumns: [],
      allColumns: [],
    }),
}));
