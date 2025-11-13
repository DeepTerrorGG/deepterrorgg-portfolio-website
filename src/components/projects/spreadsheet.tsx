
'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Table, Plus, X, Save, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';

const COLS = 26;
const ROWS = 100;

type CellValue = string | number | boolean | null;
type SheetData = CellValue[][];
type Sheet = { name: string; data: SheetData };
type Workbook = Sheet[];

const colNames = Array.from({ length: COLS }, (_, i) => String.fromCharCode(65 + i));

const createEmptySheet = (name: string): Sheet => {
  const data: SheetData = [];
  for (let i = 0; i < ROWS; i++) {
    data.push(Array(COLS).fill(null));
  }
  return { name, data };
};

const Spreadsheet: React.FC = () => {
  const [workbook, setWorkbook] = useState<Workbook>([createEmptySheet('Sheet 1')]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  
  const [renamingSheet, setRenamingSheet] = useState<{ index: number; name: string } | null>(null);

  
  const [columnWidths, setColumnWidths] = useState<number[]>(Array(COLS).fill(120));
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const startResizeX = useRef<number>(0);
  
  const { toast } = useToast();
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const cellNavRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = useMemo(() => workbook[activeSheetIndex]?.data, [workbook, activeSheetIndex]);
  
  useEffect(() => {
    if (editingCell) return;
    if (formulaInputRef.current) {
        const cellValue = data?.[selectedCell.row]?.[selectedCell.col] ?? '';
        formulaInputRef.current.value = String(cellValue);
    }
    if (cellNavRef.current) {
      cellNavRef.current.value = `${colNames[selectedCell.col]}${selectedCell.row + 1}`;
    }
  }, [selectedCell, data, editingCell]);

  const parseCellId = (cellId: string): { row: number; col: number } | null => {
    const match = cellId.match(/^([A-Z]+)(\d+)$/i);
    if (!match) return null;
    let col = 0;
    for (let i = 0; i < match[1].length; i++) {
        col = col * 26 + (match[1].toUpperCase().charCodeAt(i) - 64);
    }
    col -= 1;
    const row = parseInt(match[2], 10) - 1;
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
    return { row, col };
  };

  const evaluateFormula = useCallback((formula: string, sheetData: SheetData, visited: Set<string> = new Set()): string => {
    
    const getCellValue = (r: number, c: number): string => {
      const cellId = `${colNames[c]}${r + 1}`;
      if (visited.has(cellId)) {
        throw new Error('#REF!');
      }
      visited.add(cellId);
      const cellValue = sheetData[r]?.[c];

      if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
        const result = evaluateFormula(cellValue.substring(1), sheetData, new Set(visited));
        visited.delete(cellId);
        return result;
      }
      
      visited.delete(cellId);
      if (cellValue === null || cellValue === '' || cellValue === undefined) return '0';
      if (typeof cellValue === 'boolean') {
          return cellValue ? 'TRUE' : 'FALSE';
      }
      return String(cellValue);
    };

    const sumMatch = formula.match(/^SUM\((([A-Z]+\d+):([A-Z]+\d+))\)$/i);
    if (sumMatch) {
        const start = parseCellId(sumMatch[2]);
        const end = parseCellId(sumMatch[3]);
        if (!start || !end) return '#REF!';
        let sum = 0;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
            for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                 const cellVal = getCellValue(r,c);
                 const num = parseFloat(cellVal);
                 if (!isNaN(num)) sum += num;
            }
        }
        return sum.toString();
    }
    
    const avgMatch = formula.match(/^AVERAGE\((([A-Z]+\d+):([A-Z]+\d+))\)$/i);
    if(avgMatch){
        const start = parseCellId(avgMatch[2]);
        const end = parseCellId(avgMatch[3]);
        if(!start || !end) return '#REF!';
        let sum = 0; let count = 0;
        for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
            for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
                 const cellVal = getCellValue(r,c);
                 const num = parseFloat(cellVal);
                 if (!isNaN(num)) {
                    sum += num;
                    count++;
                 }
            }
        }
        return count > 0 ? (sum/count).toString() : '#DIV/0!';
    }
    
    const concatMatch = formula.match(/^CONCAT\((.*)\)$/i);
    if (concatMatch) {
      const args = concatMatch[1].split(',').map(s => s.trim());
      return args.map(arg => {
        if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
        const cell = parseCellId(arg);
        if (cell) return getCellValue(cell.row, cell.col);
        return arg;
      }).join('');
    }
    
    const ifMatch = formula.match(/^IF\((.*),(.*),(.*)\)$/i);
    if (ifMatch) {
        const [_, conditionArg, trueArg, falseArg] = ifMatch.map(s => s.trim());
        let condition = false;
        const conditionCell = parseCellId(conditionArg);
        
        if(conditionCell) {
            const val = getCellValue(conditionCell.row, conditionCell.col);
            condition = val.toUpperCase() === 'TRUE' || (parseFloat(val) !== 0 && !isNaN(parseFloat(val)));
        } else {
            condition = conditionArg.toUpperCase() === 'TRUE';
        }

        const resolveArg = (arg: string) => {
            if (arg.startsWith('"') && arg.endsWith('"')) return arg.slice(1, -1);
            const cell = parseCellId(arg);
            return cell ? getCellValue(cell.row, cell.col) : arg;
        };
        
        return condition ? resolveArg(trueArg) : resolveArg(falseArg);
    }
    
    try {
        const cellRefReplaced = formula.replace(/[A-Z]+\d+/gi, (match) => {
            const cell = parseCellId(match);
            if (!cell) throw new Error('#NAME?');
            const val = getCellValue(cell.row, cell.col);
            const num = parseFloat(val);
            if(isNaN(num) && val !== '' && val !== null && val.toUpperCase() !== 'TRUE' && val.toUpperCase() !== 'FALSE') throw new Error('#VALUE!');
            return val || '0';
        });
        // eslint-disable-next-line no-eval
        const result = eval(cellRefReplaced);
        return String(result);

    } catch (e: any) {
        return e.message;
    }

  }, []);
  
  const getCellDisplayValue = useCallback((row: number, col: number) => {
    if(!data) return '';
    const cellValue = data[row]?.[col];
    if (cellValue === null || cellValue === undefined || cellValue === '') return '';
    if (typeof cellValue === 'string' && cellValue.startsWith('=')) {
      try {
        return evaluateFormula(cellValue.substring(1), data);
      } catch (e: any) {
        return e.message;
      }
    }
    return String(cellValue);
  }, [data, evaluateFormula]);


  const handleCellChange = (row: number, col: number, value: CellValue) => {
    const newWorkbook = [...workbook];
    const newSheet = { ...newWorkbook[activeSheetIndex] };
    const newData = [...newSheet.data.map(r => [...r])];
    
    if(typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        newData[row][col] = Number(value);
    } else {
        newData[row][col] = value;
    }
    
    newSheet.data = newData;
    newWorkbook[activeSheetIndex] = newSheet;
    setWorkbook(newWorkbook);
  };

  const handleFormulaBarCommit = () => {
    if(selectedCell && formulaInputRef.current) {
        handleCellChange(selectedCell.row, selectedCell.col, formulaInputRef.current.value);
    }
  };

  const handleCellSelection = (row: number, col: number) => {
    if (editingCell) {
        setEditingCell(null);
    }
    setSelectedCell({row, col});
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editingCell) return;
    let {row, col} = selectedCell;
    
    if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
    else if (e.key === 'ArrowDown') row = Math.min(ROWS - 1, row + 1);
    else if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
    else if (e.key === 'ArrowRight') col = Math.min(COLS - 1, col + 1);
    else if (e.key === 'Enter') { e.preventDefault(); setEditingCell(selectedCell); return; }
    else if (e.key === 'Delete' || e.key === 'Backspace') { handleCellChange(row, col, ''); return; }
    else if(e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { 
        handleCellChange(row, col, '');
        setEditingCell(selectedCell);
        return;
    } else { return; }

    e.preventDefault();
    handleCellSelection(row, col);
  };

  const addSheet = () => {
    const newSheetName = `Sheet ${workbook.length + 1}`;
    setWorkbook(prev => [...prev, createEmptySheet(newSheetName)]);
    setActiveSheetIndex(workbook.length);
    toast({title: `${newSheetName} created.`});
  }
  
  const deleteSheet = (indexToDelete: number) => {
    if (workbook.length <= 1) {
        toast({title: "Cannot delete the last sheet", variant: "destructive"});
        return;
    }
    const sheetName = workbook[indexToDelete].name;
    setWorkbook(prev => prev.filter((_, i) => i !== indexToDelete));
    if (activeSheetIndex >= indexToDelete) {
        setActiveSheetIndex(Math.max(0, activeSheetIndex - 1));
    }
    toast({title: `Deleted "${sheetName}"`});
  }

  const handleRenameSheet = () => {
    if (!renamingSheet) return;
    if (renamingSheet.name.trim() === '') {
        toast({title: "Sheet name cannot be empty", variant: "destructive"});
        return;
    }
    setWorkbook(prevWorkbook => {
        const newWorkbook = [...prevWorkbook];
        newWorkbook[renamingSheet.index] = { ...newWorkbook[renamingSheet.index], name: renamingSheet.name };
        return newWorkbook;
    });
    setRenamingSheet(null);
  };

  
  const handleCellNav = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const input = cellNavRef.current?.value;
        if(input) {
            const cell = parseCellId(input);
            if(cell) {
                handleCellSelection(cell.row, cell.col);
            } else {
                toast({title: "Invalid Cell", description: `"${input}" is not a valid cell address.`, variant: "destructive"});
            }
        }
    }
  }

  const exportData = () => {
    const wb = XLSX.utils.book_new();
    workbook.forEach(sheet => {
      const dataForExport = sheet.data.map((row, rIdx) => 
        row.map((_, cIdx) => getCellDisplayValue(rIdx, cIdx))
      );
      const ws = XLSX.utils.aoa_to_sheet(dataForExport);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    XLSX.writeFile(wb, "spreadsheet.xlsx");
    toast({ title: "Exported!", description: "Workbook saved as spreadsheet.xlsx" });
  };
  
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        
        const newWorkbook: Workbook = wb.SheetNames.map(sheetName => {
          const ws = wb.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
          
          const newSheetData: SheetData = createEmptySheet(sheetName).data;
          jsonData.forEach((row, r) => {
            if (r < ROWS) {
              row.forEach((cell, c) => {
                if (c < COLS) {
                  newSheetData[r][c] = cell;
                }
              });
            }
          });
          return { name: sheetName, data: newSheetData };
        });

        if (newWorkbook.length === 0) {
            throw new Error("No sheets found in the file.");
        }

        setWorkbook(newWorkbook);
        setActiveSheetIndex(0);
        setSelectedCell({row: 0, col: 0});
        toast({ title: "Import Successful", description: `Loaded "${file.name}"` });

      } catch (err) {
        console.error(err);
        toast({ title: "Import Failed", description: "Could not read the spreadsheet file. Please ensure it's a valid .xlsx file.", variant: "destructive" });
      } finally {
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const handleMouseDownResize = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    setResizingCol(colIndex);
    startResizeX.current = e.clientX;
  };
  
  const handleMouseMoveResize = useCallback((e: MouseEvent) => {
    if (resizingCol === null) return;
    const diffX = e.clientX - startResizeX.current;
    setColumnWidths(prevWidths => {
      const newWidths = [...prevWidths];
      newWidths[resizingCol] = Math.max(30, newWidths[resizingCol] + diffX);
      return newWidths;
    });
    startResizeX.current = e.clientX;
  }, [resizingCol]);

  const handleMouseUpResize = useCallback(() => {
    setResizingCol(null);
  }, []);

  useEffect(() => {
    if (resizingCol !== null) {
      window.addEventListener('mousemove', handleMouseMoveResize);
      window.addEventListener('mouseup', handleMouseUpResize);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveResize);
      window.removeEventListener('mouseup', handleMouseUpResize);
    };
  }, [resizingCol, handleMouseMoveResize, handleMouseUpResize]);
  
  const gridTemplateColumns = useMemo(() => {
    return `50px ${columnWidths.map(w => `${w}px`).join(' ')}`;
  }, [columnWidths]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4">
        <Card className="w-full h-full mx-auto shadow-2xl flex flex-col">
            <CardHeader className="p-2 border-b">
                 <div className="flex items-center gap-2">
                    <Input
                        ref={cellNavRef}
                        onKeyDown={handleCellNav}
                        className="w-24 h-9 font-mono text-center"
                    />
                    <Input
                        ref={formulaInputRef}
                        onBlur={handleFormulaBarCommit}
                         onKeyDown={(e) => {
                           if(e.key === 'Enter') {
                                handleFormulaBarCommit();
                                handleCellSelection(Math.min(ROWS-1, selectedCell.row+1), selectedCell.col);
                                e.currentTarget.blur();
                           }
                         }}
                        className="flex-grow font-mono h-9"
                    />
                    <input type="file" ref={fileInputRef} onChange={importData} accept=".xlsx" className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="h-9 w-9">
                        <FolderOpen className="h-4 w-4" />
                        <span className="sr-only">Open/Import</span>
                    </Button>
                    <Button onClick={exportData} variant="outline" size="icon" className="h-9 w-9">
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save/Export</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-0 overflow-auto" onKeyDown={handleKeyPress} tabIndex={0}>
                <div className="grid" style={{ gridTemplateColumns }}>
                    {/* Corner */}
                    <div className="sticky top-0 left-0 z-30 bg-muted border-b border-r"></div>
                    {/* Column Headers */}
                    {colNames.map((name, c) => (
                      <div key={name} className="sticky top-0 z-20 bg-muted border-b border-r text-center font-bold p-2 text-sm select-none relative">
                        {name}
                        <div 
                          onMouseDown={(e) => handleMouseDownResize(e, c)}
                          className="absolute top-0 right-[-4px] w-2 h-full cursor-col-resize z-30" 
                        />
                      </div>
                    ))}
                    {/* Rows */}
                    {Array.from({ length: ROWS }).map((_, r) => (
                        <React.Fragment key={r}>
                            {/* Row Header */}
                            <div className="sticky left-0 z-10 bg-muted border-b border-r text-center font-bold p-2 text-sm select-none">{r + 1}</div>
                            {/* Cells */}
                            {Array.from({ length: COLS }).map((_, c) => {
                                const isSelected = selectedCell.row === r && selectedCell.col === c;
                                const isEditing = editingCell?.row === r && editingCell?.col === c;
                                const cellValue = data?.[r]?.[c];
                                const displayValue = getCellDisplayValue(r,c);
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={cn(
                                            "border-r border-b border-border/20 text-sm overflow-hidden whitespace-nowrap p-2",
                                            isSelected && !isEditing ? "ring-2 ring-primary ring-inset z-10" : "",
                                            isEditing ? "z-20 p-0" : "hover:bg-muted/30"
                                        )}
                                        onClick={() => handleCellSelection(r, c)}
                                        onDoubleClick={() => setEditingCell({row: r, col: c})}
                                    >
                                        {isEditing ? (
                                             <Input
                                                type="text"
                                                defaultValue={String(cellValue ?? '')}
                                                onBlur={(e) => {
                                                    handleCellChange(r, c, e.target.value);
                                                    setEditingCell(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter') {
                                                        handleCellChange(r, c, e.currentTarget.value);
                                                        setEditingCell(null);
                                                        handleCellSelection(Math.min(ROWS-1, r+1), c);
                                                    } else if (e.key === 'Escape') {
                                                        setEditingCell(null);
                                                    }
                                                }}
                                                autoFocus
                                                className="w-full h-full p-2 border-0 rounded-none focus-visible:ring-2 focus-visible:ring-primary outline-none bg-background"
                                            />
                                        ) : (
                                            <div className={cn(
                                                 typeof cellValue === 'string' && cellValue?.startsWith('=') ? 'text-purple-400 italic' : '',
                                                 displayValue.startsWith('#') ? 'text-red-400' : ''
                                            )}>
                                                {displayValue}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </CardContent>
             <CardFooter className="p-0 border-t bg-muted/30 rounded-b-lg">
                <Tabs value={activeSheetIndex.toString()} onValueChange={(val) => setActiveSheetIndex(parseInt(val))} className="w-full">
                    <TabsList className="bg-transparent p-1 rounded-none justify-start">
                        {workbook.map((sheet, index) => (
                            <DropdownMenu key={index}>
                              <DropdownMenuTrigger asChild>
                                <TabsTrigger 
                                  value={index.toString()} 
                                  className="h-8 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/80"
                                  onDoubleClick={() => setRenamingSheet({ index, name: sheet.name })}
                                >
                                  <span>{sheet.name}</span>
                                </TabsTrigger>
                              </DropdownMenuTrigger>
                               <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setRenamingSheet({ index, name: sheet.name })}>Rename</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => deleteSheet(index)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        ))}
                        <Button variant="ghost" size="icon" onClick={addSheet} className="ml-2 h-8 w-8">
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </TabsList>
                </Tabs>
            </CardFooter>
        </Card>

        {renamingSheet !== null && (
          <Dialog open={true} onOpenChange={() => setRenamingSheet(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Sheet</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  defaultValue={renamingSheet.name}
                  onChange={(e) => setRenamingSheet({ ...renamingSheet, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSheet()}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleRenameSheet}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
    </div>
  );
};
export default Spreadsheet;
