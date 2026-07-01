export * from './dadosSaudeAlimentacao';
export * from './dadosParalisia';
export * from './exercIdosos';
export * from './exercImc';
export * from './dataDictionaries';

export function getColumnValues(data: Record<string, any>[], column: string): any[] {
  return data.map((row) => row[column]);
}

export function getFactorValues(data: Record<string, any>[], column: string): string[] {
  return data.map((row) => String(row[column]));
}

export function getNumericValues(data: Record<string, any>[], column: string): number[] {
  return data
    .map((row) => row[column])
    .filter((val): val is number => val !== null && val !== undefined && !Number.isNaN(val));
}
