// Format number with comma as decimal separator (Brazilian Portuguese)
export function formatBR(value: number, digits = 2): string {
  return value.toFixed(digits).replace('.', ',');
}

// Format p-values properly (e.g. < 0,0001)
export function formatPValue(value: number, digits = 4): string {
  if (value < Math.pow(10, -digits)) {
    return `< ${Math.pow(10, -digits).toFixed(digits).replace('.', ',')}`;
  }
  return value.toFixed(digits).replace('.', ',');
}

// Format as percentage with comma decimal
export function formatPercent(value: number, digits = 1): string {
  return (value * 100).toFixed(digits).replace('.', ',') + '%';
}

// Parse Brazilian formatted number (comma decimal) to float
export function parseBR(value: string): number {
  return parseFloat(value.replace(',', '.'));
}
