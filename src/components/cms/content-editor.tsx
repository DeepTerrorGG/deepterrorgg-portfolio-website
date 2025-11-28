'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { Label } from '../ui/label';

type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'image';
type Field = { name: string; type: FieldType };
type ContentType = { id: string; name: string; slug: string; fields: Field[] };
type ContentEntry = {
    id?: string;
    contentTypeId: string;
    slug: string;
    fields: Record<string, any>;
};

const DynamicFormField = ({ field, value, onChange }: { field: Field; value: any; onChange: (val: any) => void }) => {
  switch (field.type) {
    case 'text':
    case 'image':
      return <Input type={field.type === 'image' ? 'url' : 'text'} placeholder={field.name} value={value || ''} onChange={e => onChange(e.target.value)} />;
    case 'textarea':
      return <Textarea placeholder={field.name} value={value || ''} onChange={e => onChange(e.target.value)} />;
    case 'number':
      return <Input type="number" placeholder={field.name} value={value || ''} onChange={e => onChange(parseFloat(e.target.value))} />;
    case 'boolean':
      return <div className="flex items-center gap-2"><Switch checked={!!value} onCheckedChange={onChange} /><Label>{field.name}</Label></div>;
    case 'date':
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={onChange} initialFocus /></PopoverContent>
        </Popover>
      );
    default: return null;
  }
};

export const ContentEditor: React.FC = () => {
    const firestore = useFirestore();
    const contentTypesQuery = useMemoFirebase(() => collection(firestore, 'content_types'), [firestore]);
    const { data: contentTypes, isLoading: loadingTypes } = useCollection<ContentType>(contentTypesQuery);

    const [selectedContentTypeId, setSelectedContentTypeId] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<ContentEntry | null>(null);

    const selectedContentType = useMemo(() => contentTypes?.find(ct => ct.id === selectedContentTypeId), [contentTypes, selectedContentTypeId]);

    const entriesQuery = useMemoFirebase(() => {
        if (!selectedContentTypeId || !firestore) return null;
        return query(collection(firestore, 'content_entries'), where('contentTypeId', '==', selectedContentTypeId));
    }, [firestore, selectedContentTypeId]);
    const { data: entries, isLoading: loadingEntries } = useCollection<ContentEntry>(entriesQuery);

    const handleCreateNewEntry = () => {
        if (!selectedContentType) return;
        const newEntry: ContentEntry = {
            contentTypeId: selectedContentType.id,
            slug: selectedContentType.slug,
            fields: {},
        };
        selectedContentType.fields.forEach(f => newEntry.fields[f.name] = '');
        setSelectedEntry(newEntry);
    };

    const handleSaveEntry = () => {
        if (!selectedEntry) return;
        if (selectedEntry.id) {
            const { id, ...data } = selectedEntry;
            updateDocumentNonBlocking(doc(firestore, 'content_entries', id), { ...data, updatedAt: serverTimestamp() });
        } else {
            addDocumentNonBlocking(collection(firestore, 'content_entries'), { ...selectedEntry, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        setSelectedEntry(null);
    };
    
    const handleDeleteEntry = () => {
        if (!selectedEntry?.id) return;
        deleteDocumentNonBlocking(doc(firestore, 'content_entries', selectedEntry.id));
        setSelectedEntry(null);
    }
    
    const handleFieldChange = (fieldName: string, value: any) => {
        setSelectedEntry(prev => prev ? { ...prev, fields: { ...prev.fields, [fieldName]: value }} : null);
    }

    if (loadingTypes) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin"/></div>;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Content Editor</CardTitle>
                <CardDescription>Create and manage content for your defined types.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Select onValueChange={id => { setSelectedContentTypeId(id); setSelectedEntry(null); }} value={selectedContentTypeId || ''}>
                        <SelectTrigger><SelectValue placeholder="Select a Content Type"/></SelectTrigger>
                        <SelectContent>
                            {contentTypes?.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {selectedContentType && (
                        <div className="mt-4">
                            <Button onClick={handleCreateNewEntry} className="w-full"><Plus className="mr-2 h-4 w-4"/>New {selectedContentType.name}</Button>
                            <div className="mt-2 border rounded-md h-96 overflow-y-auto">
                                {loadingEntries ? <Loader2 className="animate-spin m-4"/> : entries?.map(entry => (
                                    <Button key={entry.id} variant={selectedEntry?.id === entry.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedEntry(entry)}>
                                        {entry.fields.title || entry.fields.name || `Entry ${entry.id?.substring(0,5)}`}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                 <div className="md:col-span-2">
                     {selectedEntry && selectedContentType ? (
                        <Card>
                             <CardHeader><CardTitle>{selectedEntry.id ? `Editing '${selectedEntry.fields.title || 'Entry'}'` : `New ${selectedContentType.name}`}</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                {selectedContentType.fields.map(field => (
                                    <div key={field.name}>
                                        <Label className="capitalize">{field.name}</Label>
                                        <DynamicFormField field={field} value={selectedEntry.fields[field.name]} onChange={val => handleFieldChange(field.name, val)}/>
                                    </div>
                                ))}
                             </CardContent>
                             <CardFooter className="flex justify-between">
                                 {selectedEntry.id && (
                                     <Button variant="destructive" onClick={handleDeleteEntry}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                 )}
                                 <div className="flex gap-2 ml-auto">
                                     <Button variant="outline" onClick={() => setSelectedEntry(null)}>Cancel</Button>
                                     <Button onClick={handleSaveEntry}>Save</Button>
                                 </div>
                             </CardFooter>
                        </Card>
                     ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Select an entry or create a new one.</div>
                     )}
                </div>
            </CardContent>
        </Card>
    );
};
