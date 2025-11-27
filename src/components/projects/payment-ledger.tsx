
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRight, Send, RefreshCw, AlertTriangle, CheckCircle, Percent, Plus, Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid'; 
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

// --- TYPES AND INITIAL STATE ---

type Account = { id: string; name: string; balance: number };
type LedgerEntry = { id: string; transferId: string; accountId: string; direction: 'DEBIT' | 'CREDIT'; amount: number; timestamp: Date; description: string };
type Transfer = { id: string; fromId: string; toId: string; amount: number; taxAmount: number; status: 'pending' | 'completed' | 'failed'; idempotencyKey: string; reason?: string; timestamp: Date;};

type TaxMode = 'flat' | 'tiered' | 'fixed';

const initialAccounts: Account[] = [
    { id: 'acc_alice', name: 'Alice', balance: 1000 },
    { id: 'acc_bob', name: 'Bob', balance: 500 },
    { id: 'acc_charlie', name: 'Charlie', balance: 750 },
    { id: 'acc_merchant', name: 'Merchant', balance: 20000 },
    { id: 'acc_tax_vault', name: 'Tax Vault', balance: 0 },
];

const TAX_ACCOUNT_ID = 'acc_tax_vault';

const PaymentLedger: React.FC = () => {
    const { toast } = useToast();
    
    // --- STATE MANAGEMENT (Simulated Database) ---
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [transferAmount, setTransferAmount] = useState('50');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastIdempotencyKey, setLastIdempotencyKey] = useState(uuidv4());
    
    // New state for custom accounts
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('100');

    // Transfer selection state
    const [fromAccountId, setFromAccountId] = useState<string>(initialAccounts[0].id);
    const [toAccountId, setToAccountId] = useState<string>(initialAccounts[1].id);

    // Tax State
    const [taxMode, setTaxMode] = useState<TaxMode>('flat');
    const [flatTaxRate, setFlatTaxRate] = useState(2.5);
    const [tieredTaxRates, setTieredTaxRates] = useState({
        threshold: 10000,
        rateBelow: 5,
        rateAbove: 2,
    });
    const [fixedTaxAmount, setFixedTaxAmount] = useState(100);


    // --- CORE LOGIC (Simulated Backend Transaction) ---
    const executeTransfer = useCallback((fromId: string, toId: string, amount: number, idempotencyKey: string) => {
        setIsProcessing(true);

        const newTransfer: Transfer = { id: `tran_${uuidv4()}`, fromId, toId, amount, taxAmount: 0, status: 'pending', idempotencyKey, timestamp: new Date() };
        setTransfers(prev => [newTransfer, ...prev]);

        setTimeout(() => {
            // IDEMPOTENCY CHECK
            const existingTransfer = transfers.find(t => t.idempotencyKey === idempotencyKey && t.status === 'completed');
            if (existingTransfer) {
                toast({ title: "Idempotency Check", description: "This transfer was already processed. No action taken." });
                setTransfers(prev => prev.filter(t => t.id !== newTransfer.id)); // Remove the pending duplicate
                setIsProcessing(false);
                return;
            }

            const fromAccount = accounts.find(a => a.id === fromId);
            const toAccount = accounts.find(a => a.id === toId);
            const taxAccount = accounts.find(a => a.id === TAX_ACCOUNT_ID);

            if (!fromAccount || !toAccount || !taxAccount) {
                setTransfers(prev => prev.map(t => t.id === newTransfer.id ? {...t, status: 'failed', reason: 'Account not found'} : t));
                toast({ title: 'Error', description: 'Account not found.', variant: 'destructive'});
                setIsProcessing(false);
                return;
            }

            let taxAmount = 0;
            if (taxMode === 'flat') {
                taxAmount = amount * (flatTaxRate / 100);
            } else if (taxMode === 'tiered') {
                const rate = amount >= tieredTaxRates.threshold ? tieredTaxRates.rateAbove : tieredTaxRates.rateBelow;
                taxAmount = amount * (rate / 100);
            } else if (taxMode === 'fixed') {
                taxAmount = fixedTaxAmount;
            }
            
            const totalDebit = amount + taxAmount;

            // CHECK BALANCE
            if (fromAccount.balance < totalDebit) {
                setTransfers(prev => prev.map(t => t.id === newTransfer.id ? {...t, status: 'failed', reason: 'Insufficient funds'} : t));
                toast({ title: 'Transaction Failed', description: 'Insufficient funds.', variant: 'destructive'});
                setIsProcessing(false);
                return;
            }

            const transferId = newTransfer.id;

            // CREATE LEDGER ENTRIES
            const debitEntry: LedgerEntry = { id: `le_${uuidv4()}`, transferId, accountId: fromId, direction: 'DEBIT', amount: totalDebit, timestamp: new Date(), description: `Transfer to ${toAccount.name} + Tax` };
            const creditEntry: LedgerEntry = { id: `le_${uuidv4()}`, transferId, accountId: toId, direction: 'CREDIT', amount, timestamp: new Date(), description: `Received from ${fromAccount.name}` };
            const taxCreditEntry: LedgerEntry = { id: `le_${uuidv4()}`, transferId, accountId: TAX_ACCOUNT_ID, direction: 'CREDIT', amount: taxAmount, timestamp: new Date(), description: `Tax from transfer ${transferId}` };
            setLedger(prev => [debitEntry, creditEntry, taxCreditEntry, ...prev]);

            // UPDATE BALANCES
            setAccounts(prev => prev.map(acc => {
                if (acc.id === fromId) return { ...acc, balance: acc.balance - totalDebit };
                if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
                if (acc.id === TAX_ACCOUNT_ID) return { ...acc, balance: acc.balance + taxAmount };
                return acc;
            }));

            // RECORD TRANSFER
            setTransfers(prev => prev.map(t => t.id === transferId ? {...t, status: 'completed', taxAmount } : t));

            toast({ title: 'Transfer Complete', description: `${fromAccount.name} sent $${amount} to ${toAccount.name}.` });
            setIsProcessing(false);

        }, 1500); // Increased delay for visual effect

    }, [accounts, transfers, toast, taxMode, flatTaxRate, tieredTaxRates, fixedTaxAmount]);
    
    const handleTransfer = (doubleSpend = false) => {
        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Invalid Amount", variant: "destructive"});
            return;
        }
        if (fromAccountId === toAccountId) {
            toast({ title: "Invalid Transfer", description: "Sender and receiver cannot be the same.", variant: "destructive"});
            return;
        }
        
        const key = doubleSpend ? lastIdempotencyKey : uuidv4();
        if (!doubleSpend) {
            setLastIdempotencyKey(key);
        }
        executeTransfer(fromAccountId, toAccountId, amount, key);
    };

    const handleAddAccount = () => {
        if (!newAccountName.trim()) {
            toast({ title: 'Account name is required', variant: 'destructive' });
            return;
        }
        const balance = parseFloat(newAccountBalance);
        if (isNaN(balance) || balance < 0) {
            toast({ title: 'Invalid starting balance', variant: 'destructive' });
            return;
        }

        const newAccount: Account = {
            id: `acc_${uuidv4()}`,
            name: newAccountName.trim(),
            balance: balance,
        };
        setAccounts(prev => [...prev, newAccount]);
        setNewAccountName('');
        setNewAccountBalance('100');
        toast({ title: 'Account Created', description: `Account "${newAccount.name}" created with $${balance}.` });
    };

    const resetSimulation = () => {
        setAccounts(initialAccounts);
        setLedger([]);
        setTransfers([]);
        setTransferAmount('50');
        setFromAccountId(initialAccounts[0].id);
        setToAccountId(initialAccounts[1].id);
        setLastIdempotencyKey(uuidv4());
        setTaxMode('flat');
        setFlatTaxRate(2.5);
        setTieredTaxRates({ threshold: 10000, rateBelow: 5, rateAbove: 2 });
        setFixedTaxAmount(100);
    };

    const availableAccounts = accounts.filter(a => a.id !== TAX_ACCOUNT_ID);

    return (
        <div className="w-full h-full bg-[#131722] flex items-center justify-center p-4">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                    <Card className="bg-black/30 border-border/20 text-white">
                        <CardHeader><CardTitle className="text-xl text-primary">Accounts</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[250px] pr-4">
                                <div className="space-y-2">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="flex justify-between items-center bg-background/30 p-2 rounded-md">
                                            <span className="font-semibold">{acc.name}</span>
                                            <span className="font-mono text-lg">${acc.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/30 border-border/20 text-white">
                        <CardHeader><CardTitle className="text-xl text-primary">New Transfer</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-center gap-2">
                               <Select value={fromAccountId} onValueChange={setFromAccountId}>
                                   <SelectTrigger className="w-full"><SelectValue placeholder="From" /></SelectTrigger>
                                   <SelectContent>
                                       {availableAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                   </SelectContent>
                               </Select>
                               <ArrowRight className="text-muted-foreground flex-shrink-0"/>
                               <Select value={toAccountId} onValueChange={setToAccountId}>
                                   <SelectTrigger className="w-full"><SelectValue placeholder="To" /></SelectTrigger>
                                   <SelectContent>
                                       {availableAccounts.filter(a => a.id !== fromAccountId).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                                   </SelectContent>
                               </Select>
                           </div>
                           <div>
                               <Label htmlFor="amount">Amount</Label>
                               <Input id="amount" type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="bg-background border-border/50 text-white mt-1"/>
                           </div>
                           <div className="flex gap-2">
                               <Button onClick={() => handleTransfer()} disabled={isProcessing} className="flex-1">
                                   {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>} Send
                               </Button>
                                <Button onClick={() => handleTransfer(true)} disabled={isProcessing} variant="secondary" className="flex-1" title="Simulates clicking the 'Send' button twice rapidly">
                                   <Send className="mr-2 h-4 w-4"/>Double Spend
                               </Button>
                           </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/30 border-border/20 text-white">
                        <CardHeader><CardTitle className="text-xl text-primary flex items-center gap-2"><UserPlus /> Add Account</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input placeholder="Account Name" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} className="bg-background border-border/50 text-white" />
                                <Input placeholder="Balance" type="number" value={newAccountBalance} onChange={e => setNewAccountBalance(e.target.value)} className="bg-background border-border/50 text-white w-32" />
                            </div>
                            <Button onClick={handleAddAccount} disabled={isProcessing} className="w-full"><Plus className="mr-2 h-4 w-4" />Create Account</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="bg-black/30 border-border/20 text-white">
                        <CardHeader><CardTitle className="text-xl text-primary">System Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Tabs value={taxMode} onValueChange={(v) => setTaxMode(v as TaxMode)}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="flat">Flat Rate</TabsTrigger>
                                    <TabsTrigger value="tiered">Tiered Rate</TabsTrigger>
                                    <TabsTrigger value="fixed">Fixed Amount</TabsTrigger>
                                </TabsList>
                                <TabsContent value="flat" className="pt-4">
                                     <Label htmlFor="tax-rate" className="flex justify-between">
                                        <span>Transaction Tax Rate</span>
                                        <span className="font-bold">{flatTaxRate.toFixed(1)}%</span>
                                    </Label>
                                    <Slider id="tax-rate" min={0} max={15} step={0.5} value={[flatTaxRate]} onValueChange={val => setFlatTaxRate(val[0])} className="mt-2"/>
                                </TabsContent>
                                <TabsContent value="tiered" className="pt-4 space-y-4">
                                    <div>
                                        <Label htmlFor="tiered-threshold" className="flex justify-between">
                                            <span>Threshold</span>
                                            <span className="font-bold">${tieredTaxRates.threshold.toLocaleString()}</span>
                                        </Label>
                                        <Slider id="tiered-threshold" min={1000} max={50000} step={1000} value={[tieredTaxRates.threshold]} onValueChange={val => setTieredTaxRates(t => ({...t, threshold: val[0]}))} className="mt-2"/>
                                    </div>
                                     <div>
                                        <Label htmlFor="rate-below" className="flex justify-between">
                                            <span>Rate Below Threshold</span>
                                            <span className="font-bold">{tieredTaxRates.rateBelow.toFixed(1)}%</span>
                                        </Label>
                                        <Slider id="rate-below" min={0} max={20} step={0.5} value={[tieredTaxRates.rateBelow]} onValueChange={val => setTieredTaxRates(t => ({...t, rateBelow: val[0]}))} className="mt-2"/>
                                    </div>
                                    <div>
                                        <Label htmlFor="rate-above" className="flex justify-between">
                                            <span>Rate Above Threshold</span>
                                            <span className="font-bold">{tieredTaxRates.rateAbove.toFixed(1)}%</span>
                                        </Label>
                                        <Slider id="rate-above" min={0} max={10} step={0.5} value={[tieredTaxRates.rateAbove]} onValueChange={val => setTieredTaxRates(t => ({...t, rateAbove: val[0]}))} className="mt-2"/>
                                    </div>
                                </TabsContent>
                                 <TabsContent value="fixed" className="pt-4">
                                    <Label htmlFor="fixed-tax">Fixed Tax Amount</Label>
                                    <Input id="fixed-tax" type="number" value={fixedTaxAmount} onChange={e => setFixedTaxAmount(parseFloat(e.target.value) || 0)} className="bg-background border-border/50 text-white mt-1"/>
                                </TabsContent>
                            </Tabs>
                            <div className="pt-4">
                                <Button variant="outline" size="sm" onClick={resetSimulation} className="w-full"><RefreshCw className="mr-2 h-4 w-4"/>Reset Simulation</Button>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="h-[450px] flex flex-col bg-black/30 border-border/20 text-white">
                        <CardHeader><CardTitle className="text-xl text-primary">Transaction History</CardTitle></CardHeader>
                        <CardContent className="flex-grow overflow-hidden">
                            <ScrollArea className="h-[350px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfers.map(t => (
                                            <TableRow key={t.id}>
                                                <TableCell className="text-xs">{format(t.timestamp, 'HH:mm:ss')}</TableCell>
                                                <TableCell>
                                                    <span className={cn('text-xs font-bold', t.status === 'completed' ? 'text-green-400' : t.status === 'failed' ? 'text-red-400' : 'text-yellow-400')}>
                                                        {t.status.toUpperCase()}
                                                    </span>
                                                    {t.status === 'failed' && <p className="text-xs text-muted-foreground">{t.reason}</p>}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs">
                                                    ${t.amount.toLocaleString('en-US',{minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentLedger;

    