import Papa from 'papaparse';
import type { CustomDatasetRecord } from '../stores/useCustomLabStore';

interface ParsedResult {
  data: CustomDatasetRecord[];
  numericColumns: string[];
  factorColumns: string[];
  allColumns: string[];
}

export function parseCustomCSV(file: File): Promise<ParsedResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data;
          
          if (!rawData || rawData.length === 0) {
            reject(new Error("O arquivo está vazio ou formatado incorretamente."));
            return;
          }

          const columns = Object.keys(rawData[0]);
          const numericColumns: string[] = [];
          const factorColumns: string[] = [];

          // Helper clean string (NA -> null)
          const cleanValue = (val: string | null | undefined): string | null => {
            if (val === null || val === undefined) return null;
            const t = val.trim();
            if (t === "" || t.toUpperCase() === "NA" || t.toUpperCase() === "N/A" || t.toLowerCase() === "null") {
              return null;
            }
            return t;
          };

          // Step 1: Infer column types
          columns.forEach((col) => {
            let isNumeric = true;
            let hasValidData = false;

            for (const row of rawData) {
              const val = cleanValue(row[col]);
              if (val !== null) {
                hasValidData = true;
                // Replace comma with dot for number checking
                const numVal = Number(val.replace(',', '.'));
                if (isNaN(numVal)) {
                  isNumeric = false;
                  break; // found one non-numeric, it's a factor
                }
              }
            }

            if (hasValidData && isNumeric) {
              numericColumns.push(col);
            } else {
              factorColumns.push(col);
            }
          });

          // Step 2: Transform data
          const transformedData: CustomDatasetRecord[] = rawData.map((row) => {
            const newRow: CustomDatasetRecord = {};
            columns.forEach((col) => {
              const rawStr = cleanValue(row[col]);
              if (rawStr === null) {
                newRow[col] = null;
              } else if (numericColumns.includes(col)) {
                newRow[col] = Number(rawStr.replace(',', '.'));
              } else {
                newRow[col] = rawStr;
              }
            });
            return newRow;
          });

          resolve({
            data: transformedData,
            numericColumns,
            factorColumns,
            allColumns: columns,
          });
        } catch (err) {
          reject(new Error("Erro ao processar os dados do arquivo."));
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}
