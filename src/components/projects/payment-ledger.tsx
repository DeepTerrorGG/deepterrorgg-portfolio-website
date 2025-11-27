'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, DollarSign, Send, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid'; // Using uuid for idempotency key

// --- TYPES AND INITIAL STATE ---

type Account = { id: string; name: string; balance: number };
type LedgerEntry = { id: string; transferId: string; accountId: string; direction: 'DEBIT' | 'CREDIT'; amount: number; timestamp: Date };
type Transfer = { id: string; fromId: string; toId: string; amount: number; status: 'pending' | 'completed' | 'failed'; idempotencyKey: string; };

const initialAccounts: Account[] = [
    { id: 'acc_alice', name: 'Alice', balance: 1000 },
    { id: 'acc_bob', name: 'Bob', balance: 500 },
];

const PaymentLedger: React.FC = () => {
    const { toast } = useToast();
    
    // --- STATE MANAGEMENT (Simulated Database) ---
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [transferAmount, setTransferAmount] = useState('50');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastIdempotencyKey, setLastIdempotencyKey] = useState(uuidv4());
    const [lastTransferResult, setLastTransferResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

    // --- CORE LOGIC (Simulated Backend Transaction) ---
    const executeTransfer = useCallback((fromAccountId: string, toAccountId: string, amount: number, idempotencyKey: string) => {
        setIsProcessing(true);
        setLastTransferResult(null);

        // Simulate async operation
        setTimeout(() => {
            // 1. IDEMPOTENCY CHECK
            const existingTransfer = transfers.find(t => t.idempotencyKey === idempotencyKey);
            if (existingTransfer) {
                toast({ title: "Idempotency Check", description: "This transfer was already processed. No action taken." });
                setLastTransferResult({ status: 'success', message: `Duplicate ignored. Transfer ${existingTransfer.id} already completed.` });
                setIsProcessing(false);
                return;
            }

            // --- START TRANSACTION ---
            const fromAccount = accounts.find(a => a.id === fromAccountId);
            const toAccount = accounts.find(a => a.id === toAccountId);

            if (!fromAccount || !toAccount) {
                toast({ title: 'Error', description: 'Account not found.', variant: 'destructive'});
                setIsProcessing(false);
                return;
            }

            // 2. CHECK BALANCE
            if (fromAccount.balance < amount) {
                const failedTransfer: Transfer = { id: `tran_${uuidv4()}`, fromId: fromAccountId, toId: toAccountId, amount, status: 'failed', idempotencyKey };
                setTransfers(prev => [...prev, failedTransfer]);
                setLastTransferResult({ status: 'error', message: 'Insufficient funds. Transaction rolled back.' });
                toast({ title: 'Transaction Failed', description: 'Insufficient funds.', variant: 'destructive'});
                setIsProcessing(false);
                return;
            }

            // --- ALL CHECKS PASSED, PROCEED WITH MUTATIONS ---
            const transferId = `tran_${uuidv4()}`;

            // 3. CREATE LEDGER ENTRIES
            const debitEntry: LedgerEntry = { id: `le_${uuidv4()}`, transferId, accountId: fromAccountId, direction: 'DEBIT', amount, timestamp: new Date() };
            const creditEntry: LedgerEntry = { id: `le_${uuidv4()}`, transferId, accountId: toAccountId, direction: 'CREDIT', amount, timestamp: new Date() };
            setLedger(prev => [...prev, debitEntry, creditEntry]);

            // 4. UPDATE BALANCES
            setAccounts(prev => prev.map(acc => {
                if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
                if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
                return acc;
            }));

            // 5. RECORD TRANSFER
            const completedTransfer: Transfer = { id: transferId, fromId: fromAccountId, toId: toAccountId, amount, status: 'completed', idempotencyKey };
            setTransfers(prev => [...prev, completedTransfer]);

            // --- END TRANSACTION ---
            setLastTransferResult({ status: 'success', message: 'Transfer successful.' });
            toast({ title: 'Transfer Complete', description: `${fromAccount.name} sent $${amount} to ${toAccount.name}.` });
            setIsProcessing(false);

        }, 1000); // Simulate network latency

    }, [accounts, transfers, toast]);
    
    const handleTransfer = (doubleSpend = false) => {
        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Invalid Amount", variant: "destructive"});
            return;
        }
        
        const key = doubleSpend ? lastIdempotencyKey : uuidv4();
        setLastIdempotencyKey(key);
        executeTransfer('acc_alice', 'acc_bob', amount, key);
    };

    const resetSimulation = () => {
        setAccounts(initialAccounts);
        setLedger([]);
        setTransfers([]);
        setTransferAmount('50');
        setLastTransferResult(null);
        setLastIdempotencyKey(uuidv4());
    };

    return (
        <div className="w-full h-full bg-[#131722] flex items-center justify-center p-4">
            <Card className="w-full max-w-5xl mx-auto shadow-2xl bg-black/30 border-border/20 text-white">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary text-center">Payment Ledger Simulation</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        A demonstration of double-entry bookkeeping with transactional integrity and idempotency.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Accounts & Transfer */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-xl">Accounts</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {accounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center bg-muted/20 p-3 rounded-md">
                                        <span className="font-semibold">{acc.name}</span>
                                        <span className="font-mono text-lg">${acc.balance.toLocaleString()}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-xl">New Transfer</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center gap-4">
                                   <span>Alice</span><ArrowRight className="text-muted-foreground"/><span>Bob</span>
                               </div>
                               <div>
                                   <label htmlFor="amount">Amount</label>
                                   <Input id="amount" type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="bg-background border-border/50"/>
                               </div>
                               <div className="flex gap-2">
                                   <Button onClick={() => handleTransfer()} disabled={isProcessing} className="flex-1">
                                       <Send className="mr-2 h-4 w-4"/>Send Transfer
                                   </Button>
                                    <Button onClick={() => handleTransfer(true)} disabled={isProcessing} variant="secondary" className="flex-1" title="Simulates clicking the 'Send' button twice rapidly">
                                       <Send className="mr-2 h-4 w-4"/>Double Spend
                                   </Button>
                               </div>
                               {lastTransferResult && (
                                   <div className={cn(
                                       "p-3 rounded-md text-sm text-center flex items-center justify-center gap-2",
                                       lastTransferResult.status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                                   )}>
                                       {lastTransferResult.status === 'success' ? <CheckCircle className="h-5 w-5"/> : <AlertTriangle className="h-5 w-5"/>}
                                       {lastTransferResult.message}
                                   </div>
                               )}
                            </CardContent>
                            <CardFooter><Button variant="outline" size="sm" onClick={resetSimulation}><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button></CardFooter>
                        </Card>
                    </div>

                    {/* Right: Ledger */}
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader><CardTitle className="text-xl">General Ledger</CardTitle></CardHeader>
                        <CardContent className="flex-grow overflow-hidden">
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                       <TableHead>Account</TableHead>
                                       <TableHead>Type</TableHead>
                                       <TableHead className="text-right">Amount</TableHead>
                                   </TableRow>
                               </TableHeader>
                           </Table>
                           <div className="h-[400px] overflow-y-auto">
                               <Table>
                                   <TableBody>
                                        {[...ledger].reverse().map(entry => (
                                           <TableRow key={entry.id}>
                                               <TableCell>{accounts.find(a => a.id === entry.accountId)?.name}</TableCell>
                                               <TableCell>
                                                   <span className={cn(entry.direction === 'DEBIT' ? 'text-red-400' : 'text-green-400')}>{entry.direction}</span>
                                               </TableCell>
                                               <TableCell className="text-right font-mono">${entry.amount.toLocaleString()}</TableCell>
                                           </TableRow>
                                       ))}
                                   </TableBody>
                               </Table>
                           </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentLedger;
