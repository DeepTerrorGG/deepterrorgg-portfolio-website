'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Table, Calculator, Sigma, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const COLS = 8;
const ROWS = 15;

type CellValue = string | number;
type SheetData = (CellValue | null)[][];
type Workbook = SheetData[];

const colNames = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));
const rowNames = Array.from({ length: ROWS }, (_, i) => (i + 1).toString());

const initialData = () => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

const Spreadsheet: React.FC = () => {
  const [workbook, setWorkbook] = useState<Workbook>([initialData()]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const data = workbook[activeSheetIndex];

  const parseCellId = (cellId: string): { row: number; col: number } | null => {
    const match = cellId.match(/^([A-Z])(\d+)$/);
    if (!match) return null;
    const col = match[1].charCodeAt(0) - 65;
    const row = parseInt(match[2], 10) - 1;
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
    return { row, col };
  };

  const evaluateFormula = (formula: string, visited: Set<string> = new Set()): string => {
    if (visited.has(formula)) {
      return '#REF!'; // Circular reference detection
    }
    visited.add(formula);

    try {
      const upperFormula = formula.substring(1).toUpperCase();
      
      const rangeRegex = /^([A-Z]+)\(([A-Z]\d+):([A-Z]\d+)\)$/;
      const rangeMatch = upperFormula.match(rangeRegex);
      if (rangeMatch) {
        const func = rangeMatch[1];
        const start = parseCellId(rangeMatch[2]);
        const end = parseCellId(rangeMatch[3]);
        if (start && end) {
          const values: number[] = [];
          for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
            for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
              const val = getCellDisplayValue(r, c, visited);
              const num = parseFloat(val);
              if (!isNaN(num)) values.push(num);
            }
          }
          if (values.length === 0 && func !== 'COUNT') return '0';
          
          switch(func) {
            case 'SUM':
              return values.reduce((a, b) => a + b, 0).toString();
            case 'AVERAGE':
              return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
            case 'COUNT':
              return values.length.toString();
            case 'MAX':
              return Math.max(...values).toString();
            case 'MIN':
              return Math.min(...values).toString();
            default:
              return '#NAME?';
          }
        }
      }

      const cellRefMatch = upperFormula.match(/^[A-Z]\d+$/);
      if (cellRefMatch) {
        const ref = parseCellId(upperFormula);
        if (ref) return getCellDisplayValue(ref.row, ref.col, visited);
      }

      return '#ERROR';
    } catch (e) {
      return '#ERROR';
    }
  };

  const getCellDisplayValue = useCallback((row: number, col: number, visited: Set<string> = new Set()): string => {
    const cellValue = data[row][col];
    if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
      return evaluateFormula(cellValue, visited);
    }
    return cellValue?.toString() ?? '';
  }, [data]);

  const handleCellChange = (row: number, col: number, value: string) => {
    const newWorkbook = [...workbook];
    const newSheet = [...newWorkbook[activeSheetIndex].map(r => [...r])];
    newSheet[row][col] = value;
    newWorkbook[activeSheetIndex] = newSheet;
    setWorkbook(newWorkbook);
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
  
  const addSheet = () => {
    setWorkbook(prev => [...prev, initialData()]);
    setActiveSheetIndex(workbook.length);
  }

  const displayedData = useMemo(() => {
    return Array.from({ length: ROWS }, (_, r) => 
      Array.from({ length: COLS }, (_, c) => getCellDisplayValue(r, c))
    );
  }, [data, getCellDisplayValue]);


  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-5xl mx-auto shadow-2xl overflow-hidden flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Table className="h-6 w-6" />
            Mini Spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <div className="overflow-x-auto border rounded-lg flex-grow">
            <table className="min-w-full divide-y divide-border border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 w-12 px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted border-r"></th>
                  {colNames.map(name => (
                    <th key={name} className="w-32 px-2 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">{name}</th>
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
                            "relative w-32 h-10 p-0 border-r text-sm",
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
             <p className="flex items-center gap-2"><Sigma className="h-4 w-4"/>Formulas: <code className="bg-muted px-1 rounded-sm">=SUM(A1:B2)</code>, <code className="bg-muted px-1 rounded-sm">AVERAGE</code>, <code className="bg-muted px-1 rounded-sm">COUNT</code>, <code className="bg-muted px-1 rounded-sm">MIN</code>, <code className="bg-muted px-1 rounded-sm">MAX</code>.</p>
             <p className="flex items-center gap-2"><Calculator className="h-4 w-4"/>References: Use <code className="bg-muted px-1 rounded-sm">=A1</code> to reference another cell.</p>
          </div>
        </CardContent>
        <div className="p-2 border-t bg-muted/50 flex items-center gap-2">
            <Tabs value={activeSheetIndex.toString()} onValueChange={(val) => setActiveSheetIndex(parseInt(val))} className="w-full">
                <TabsList>
                    {workbook.map((_, index) => (
                        <TabsTrigger key={index} value={index.toString()}>Sheet {index + 1}</TabsTrigger>
                    ))}
                     <Button variant="ghost" size="sm" onClick={addSheet} className="ml-2">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </TabsList>
            </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default Spreadsheet;
