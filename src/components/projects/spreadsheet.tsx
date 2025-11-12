'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Table, Calculator, Sigma } from 'lucide-react';
import { Path } from 'path-parser';

const COLS = 5;
const ROWS = 10;

type CellValue = string | number;
type SheetData = (CellValue | null)[][];

const colNames = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));
const rowNames = Array.from({ length: ROWS }, (_, i) => (i + 1).toString());

const initialData = () => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

const Spreadsheet: React.FC = () => {
  const [data, setData] = useState<SheetData>(initialData());
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const parseCellId = (cellId: string): { row: number; col: number } | null => {
    const match = cellId.match(/^([A-Z])(\d+)$/);
    if (!match) return null;
    const col = match[1].charCodeAt(0) - 65;
    const row = parseInt(match[2], 10) - 1;
    return { row, col };
  };

  const getCellDisplayValue = useCallback((row: number, col: number): string => {
    const cellValue = data[row][col];
    if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
      try {
        const formula = cellValue.substring(1).toUpperCase();
        
        // SUM
        const sumMatch = formula.match(/^SUM\(([A-Z]\d+):([A-Z]\d+)\)$/);
        if (sumMatch) {
          const start = parseCellId(sumMatch[1]);
          const end = parseCellId(sumMatch[2]);
          if (start && end) {
            let sum = 0;
            for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
              for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                const val = parseFloat(getCellDisplayValue(r, c));
                if (!isNaN(val)) sum += val;
              }
            }
            return sum.toString();
          }
        }

        // AVERAGE
        const avgMatch = formula.match(/^AVERAGE\(([A-Z]\d+):([A-Z]\d+)\)$/);
        if (avgMatch) {
          const start = parseCellId(avgMatch[1]);
          const end = parseCellId(avgMatch[2]);
          if (start && end) {
            let sum = 0;
            let count = 0;
            for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
              for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                const val = parseFloat(getCellDisplayValue(r, c));
                if (!isNaN(val)) {
                  sum += val;
                  count++;
                }
              }
            }
            return count > 0 ? (sum / count).toFixed(2) : '0';
          }
        }
        
        // Direct cell reference
        const cellRefMatch = formula.match(/^[A-Z]\d+$/);
        if (cellRefMatch) {
            const ref = parseCellId(formula);
            if(ref) return getCellDisplayValue(ref.row, ref.col);
        }

        return '#ERROR';
      } catch (e) {
        return '#ERROR';
      }
    }
    return cellValue?.toString() ?? '';
  }, [data]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data.map(r => [...r])];
    newData[row][col] = value;
    setData(newData);
  };
  
  const handleInputBlur = () => {
    setEditingCell(null);
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === 'Enter') {
      const nextRow = row < ROWS - 1 ? row + 1 : row;
      setEditingCell(`${colNames[col]}${nextRow + 1}`);
      e.preventDefault();
    } else if (e.key === 'Tab') {
      const nextCol = col < COLS - 1 ? col + 1 : 0;
      const nextRow = nextCol === 0 ? (row < ROWS - 1 ? row + 1 : row) : row;
      setEditingCell(`${colNames[nextCol]}${nextRow + 1}`);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const displayedData = useMemo(() => {
    return Array.from({ length: ROWS }, (_, r) => 
      Array.from({ length: COLS }, (_, c) => getCellDisplayValue(r, c))
    );
  }, [data, getCellDisplayValue]);


  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Table className="h-6 w-6" />
            Mini Spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-border border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 w-12 px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted border-r"></th>
                  {colNames.map(name => (
                    <th key={name} className="w-28 px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {rowNames.map((rName, rIndex) => (
                  <tr key={rName}>
                    <td className="sticky left-0 z-10 w-12 px-2 py-2 text-center text-xs font-medium text-muted-foreground bg-muted border-r">{rName}</td>
                    {colNames.map((cName, cIndex) => {
                      const cellId = `${cName}${rName}`;
                      const isEditing = editingCell === cellId;

                      return (
                        <td
                          key={cellId}
                          className={cn(
                            "relative w-28 h-10 p-0 border-r text-sm",
                            isEditing ? "border-primary" : "hover:bg-muted/50"
                          )}
                          onClick={() => setEditingCell(cellId)}
                        >
                          {isEditing ? (
                            <Input
                              type="text"
                              value={data[rIndex][cIndex] || ''}
                              onChange={e => handleCellChange(rIndex, cIndex, e.target.value)}
                              onBlur={handleInputBlur}
                              onKeyDown={e => handleInputKeyDown(e, rIndex, cIndex)}
                              autoFocus
                              className="w-full h-full p-2 border-2 border-primary rounded-none focus-visible:ring-0 outline-none"
                            />
                          ) : (
                            <div className={cn(
                                "w-full h-full p-2 overflow-hidden whitespace-nowrap",
                                typeof data[rIndex][cIndex] === 'string' && data[rIndex][cIndex]?.startsWith('=') ? 'text-purple-400 italic' : '',
                                isNaN(parseFloat(displayedData[rIndex][cIndex])) ? 'text-left' : 'text-right',
                            )}>
                                {displayedData[rIndex][cIndex]}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
             <p className="flex items-center gap-2"><Sigma className="h-4 w-4"/>Formulas: Use <code className="bg-muted px-1 rounded-sm">=SUM(A1:B2)</code> or <code className="bg-muted px-1 rounded-sm">=AVERAGE(A1:B2)</code>.</p>
             <p className="flex items-center gap-2"><Calculator className="h-4 w-4"/>References: Use <code className="bg-muted px-1 rounded-sm">=A1</code> to reference another cell.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Spreadsheet;
