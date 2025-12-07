
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { crimeData } from '@/lib/sql-murder-mystery-data';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Editor from '@monaco-editor/react';
import alasql from 'alasql';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const SQLMurderMystery: React.FC = () => {
    const { toast } = useToast();
    const [query, setQuery] = useState('SELECT * FROM crime_scene_report\nWHERE date = 20240115 AND city = \'SQL City\';');
    const [results, setResults] = useState<{ columns: string[], data: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize alasql with the crime data
        Object.keys(crimeData).forEach(tableName => {
            alasql(`CREATE TABLE ${tableName}`);
            alasql.tables[tableName].data = crimeData[tableName].data.map(row => {
                const obj: Record<string, any> = {};
                crimeData[tableName].columns.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            });
        });

        // Cleanup on unmount
        return () => {
            Object.keys(crimeData).forEach(tableName => {
                alasql(`DROP TABLE ${tableName}`);
            });
        };
    }, []);

    const handleExecuteQuery = () => {
        setIsLoading(true);
        setError(null);
        setResults(null);

        setTimeout(() => {
            try {
                // Use parameterized queries to prevent SQL injection.
                // For this simulation, we'll parse the query to find simple values,
                // but a real implementation would use '?' placeholders.
                let sanitizedQuery = query;
                const params: (string | number)[] = [];
                
                // A simple regex to find quoted strings or numbers to parameterize them
                sanitizedQuery = query.replace(/(['"].*?['"]|\b\d+\b)/g, (match) => {
                    // Remove quotes for strings
                    if (match.startsWith('\'') || match.startsWith('"')) {
                        params.push(match.substring(1, match.length - 1));
                    } else {
                        params.push(Number(match));
                    }
                    return '?';
                });
                
                const res = alasql(sanitizedQuery, params);

                if (res && res.length > 0) {
                    const columns = Object.keys(res[0]);
                    setResults({ columns, data: res });
                } else {
                    setResults({ columns: [], data: [] });
                    toast({ title: 'Query Executed', description: 'No rows returned.' });
                }
            } catch (err: any) {
                setError(err.message);
                toast({ title: 'SQL Error', description: err.message, variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-6 h-[80vh]">
                
                {/* Left Panel: Query & Schema */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <Card className="flex-grow flex flex-col">
                        <CardHeader>
                            <CardTitle>SQL Query</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <div className="flex-grow border rounded-md overflow-hidden">
                                <Editor
                                    height="100%"
                                    language="sql"
                                    theme="vs-dark"
                                    value={query}
                                    onChange={(value) => setQuery(value || '')}
                                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                             <Button onClick={handleExecuteQuery} className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2 h-4 w-4"/>}
                                Execute Query
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild><Button variant="outline" className="w-full"><BookOpen className="mr-2"/> Schema</Button></DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Database Schema</DialogTitle>
                                        <CardDescription>Tables and columns available to query.</CardDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-4 pr-4">
                                            {Object.entries(crimeData).map(([tableName, tableData]) => (
                                                <div key={tableName}>
                                                    <h4 className="font-bold text-primary">{tableName}</h4>
                                                    <p className="text-xs text-muted-foreground">{tableData.columns.join(', ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Panel: Results */}
                <Card className="w-full md:w-2/3 flex flex-col">
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}
                        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><p>{error}</p></Alert>}
                        {results && (
                            <ScrollArea className="h-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {results.columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.data.map((row, i) => (
                                            <TableRow key={i}>
                                                {results.columns.map(col => <TableCell key={col}>{typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        )}
                        {!isLoading && !error && !results && <div className="flex items-center justify-center h-full text-muted-foreground"><p>Query results will be displayed here.</p></div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SQLMurderMystery;
