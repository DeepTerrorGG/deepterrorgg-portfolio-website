
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import alasql from 'alasql';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Book, StickyNote, AlertTriangle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { crimeData } from '@/lib/sql-murder-mystery-data';

const SqlMurderMystery: React.FC = () => {
    const { toast } = useToast();
    const [query, setQuery] = useState('SELECT * FROM crime_scene_report\nWHERE date = 20240115 AND city = "SQL City";');
    const [results, setResults] = useState<{ columns: string[], rows: any[][] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notebook, setNotebook] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const monaco = useMonaco();
    useEffect(() => {
        monaco?.editor.defineTheme('sql-mystery-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#111827' },
        });
        monaco?.editor.setTheme('sql-mystery-theme');
    }, [monaco]);

    useEffect(() => {
        const initDb = async () => {
            try {
                // Clear existing tables to prevent duplication on re-render
                Object.keys(crimeData).forEach(tableName => {
                    alasql(`DROP TABLE IF EXISTS ${tableName}`);
                });

                for (const tableName in crimeData) {
                    const columns = crimeData[tableName].columns.join(', ');
                    await alasql.promise(`CREATE TABLE ${tableName} (${columns})`);
                    await alasql.promise(`SELECT * INTO ${tableName} FROM ?`, [crimeData[tableName].data]);
                }
                setIsLoading(false);
            } catch (e) {
                console.error("DB Init Error:", e);
                setError("Failed to initialize the database.");
                setIsLoading(false);
            }
        };
        initDb();
    }, []);

    const executeQuery = () => {
        setError(null);
        setResults(null);
        if(!query.trim()) {
            setError("Query cannot be empty.");
            return;
        }
        try {
            const res = alasql(query);
            if (res.length > 0) {
                const columns = Object.keys(res[0]);
                const rows = res.map(row => Object.values(row));
                setResults({ columns, rows });
            } else {
                setResults({ columns: [], rows: [] });
                toast({ title: "Query returned no results." });
            }
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full h-full p-4 bg-gray-900 text-gray-200 font-mono">
            {/* Left Panel: Info */}
            <Card className="md:col-span-2 bg-gray-800/50 border-gray-700 flex flex-col h-full">
                <Tabs defaultValue="intro" className="flex flex-col flex-grow">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-900/70">
                        <TabsTrigger value="intro">Introduction</TabsTrigger>
                        <TabsTrigger value="schema"><Book className="mr-2 h-4 w-4"/>Schema</TabsTrigger>
                        <TabsTrigger value="notebook"><StickyNote className="mr-2 h-4 w-4"/>Notebook</TabsTrigger>
                    </TabsList>
                    <TabsContent value="intro" className="flex-grow p-4 overflow-y-auto">
                        <h3 className="font-bold text-lg text-primary mb-2">The Case</h3>
                        <p className="text-sm text-gray-300">A murder has occurred in SQL City! As the lead detective, it's your job to use your SQL skills to sift through the evidence and find the culprit. Start by examining the crime scene report for the date <code className="bg-gray-700 p-1 rounded">20240115</code>.</p>
                        <p className="text-sm mt-4">Write your queries in the editor and hit 'Run Query' to investigate.</p>
                    </TabsContent>
                    <TabsContent value="schema" className="flex-grow p-4 overflow-y-auto">
                         <h3 className="font-bold text-lg text-primary mb-2">Database Schema</h3>
                         <div className="space-y-4 text-xs">
                             {Object.entries(crimeData).map(([table, details]) => (
                                 <div key={table}>
                                     <p className="font-bold text-gray-300">{table}</p>
                                     <p className="text-gray-400 pl-2">{details.columns.join(', ')}</p>
                                 </div>
                             ))}
                         </div>
                    </TabsContent>
                    <TabsContent value="notebook" className="flex-grow flex flex-col p-4">
                        <h3 className="font-bold text-lg text-primary mb-2">Your Notebook</h3>
                        <textarea value={notebook} onChange={e => setNotebook(e.target.value)} placeholder="Keep your clues here..." className="w-full flex-grow bg-gray-900/50 border-gray-700 rounded-md p-2 text-sm"/>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Right Panel: SQL and Results */}
            <div className="md:col-span-3 flex flex-col gap-4 h-full">
                <Card className="bg-gray-800/50 border-gray-700 flex-grow-[2] flex flex-col">
                    <CardHeader className="p-3 flex-row justify-between items-center">
                        <CardTitle className="text-lg">SQL Editor</CardTitle>
                        <Button onClick={executeQuery} disabled={isLoading}><Play className="mr-2 h-4 w-4"/>Run Query</Button>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        {isLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div> : 
                        <Editor
                            height="100%"
                            language="sql"
                            theme="sql-mystery-theme"
                            value={query}
                            onChange={(val) => setQuery(val || '')}
                            options={{ minimap: { enabled: false } }}
                        />}
                    </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700 flex-grow-[3] flex flex-col">
                    <CardHeader className="p-3"><CardTitle className="text-lg">Results</CardTitle></CardHeader>
                    <CardContent className="p-0 flex-grow overflow-auto">
                        {error ? (
                            <div className="p-4 text-red-400 flex items-start gap-2"><AlertTriangle className="h-5 w-5 flex-shrink-0"/>{error}</div>
                        ) : results ? (
                            <ScrollArea className="h-full">
                                {results.rows.length > 0 ? (
                                    <Table className="text-xs">
                                        <TableHeader>
                                            <TableRow className="border-gray-700 hover:bg-gray-800">
                                                {results.columns.map(col => <TableHead key={col} className="text-gray-300">{col}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.rows.map((row, i) => (
                                                <TableRow key={i} className="border-gray-700 hover:bg-gray-800/50">
                                                    {row.map((cell, j) => <TableCell key={j}>{String(cell)}</TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : <p className="p-4 text-gray-400">Query executed successfully, but returned no rows.</p>}
                            </ScrollArea>
                        ) : <p className="p-4 text-gray-500">Query results will appear here.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SqlMurderMystery;
