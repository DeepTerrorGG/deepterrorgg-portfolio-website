
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'image';

type Field = {
  name: string;
  type: FieldType;
};

type ContentType = {
  id?: string;
  name: string;
  slug: string;
  fields: Field[];
};

export const SchemaEditor: React.FC = () => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const contentTypesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'content_types') : null, [firestore]);
    const { data: contentTypes } = useCollection<ContentType>(contentTypesQuery);

    const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleSelectContentType = (id: string) => {
        const selected = contentTypes?.find(ct => ct.id === id);
        setSelectedContentType(selected || null);
        setIsCreatingNew(false);
    };

    const handleCreateNew = () => {
        setSelectedContentType({ name: '', slug: '', fields: [] });
        setIsCreatingNew(true);
    };

    const handleFieldNameChange = (index: number, newName: string) => {
        if (!selectedContentType) return;
        const newFields = [...selectedContentType.fields];
        newFields[index].name = newName;
        setSelectedContentType({ ...selectedContentType, fields: newFields });
    };

    const handleFieldTypeChange = (index: number, newType: FieldType) => {
        if (!selectedContentType) return;
        const newFields = [...selectedContentType.fields];
        newFields[index].type = newType;
        setSelectedContentType({ ...selectedContentType, fields: newFields });
    };
    
    const handleAddField = () => {
        if (!selectedContentType) return;
        const newField: Field = { name: `newField${selectedContentType.fields.length + 1}`, type: 'text' };
        setSelectedContentType({ ...selectedContentType, fields: [...selectedContentType.fields, newField] });
    };

    const handleRemoveField = (index: number) => {
        if (!selectedContentType) return;
        const newFields = selectedContentType.fields.filter((_, i) => i !== index);
        setSelectedContentType({ ...selectedContentType, fields: newFields });
    };

    const handleSave = () => {
        if (!selectedContentType || !firestore) return;
        if (!selectedContentType.name.trim() || !selectedContentType.slug.trim()) {
            toast({ title: 'Name and slug are required.', variant: 'destructive'});
            return;
        }

        if (isCreatingNew) {
            addDocumentNonBlocking(collection(firestore, 'content_types'), { ...selectedContentType, createdAt: serverTimestamp() });
            toast({ title: 'Content Type Created!' });
        } else if (selectedContentType.id) {
            const { id, ...data } = selectedContentType;
            updateDocumentNonBlocking(doc(firestore, 'content_types', id), data);
            toast({ title: 'Content Type Updated!' });
        }
        
        setIsCreatingNew(false);
        setSelectedContentType(null);
    };
    
     const handleDelete = () => {
        if (!selectedContentType?.id || !firestore) return;
        deleteDocumentNonBlocking(doc(firestore, 'content_types', selectedContentType.id));
        toast({ title: 'Content Type Deleted', variant: 'destructive'});
        setSelectedContentType(null);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Schema Editor</CardTitle>
                <CardDescription>Define and manage your content types and their fields.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h3 className="font-semibold mb-2">Content Types</h3>
                    <div className="space-y-2">
                        {contentTypes?.map(ct => (
                            <Button key={ct.id} variant={selectedContentType?.id === ct.id ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => handleSelectContentType(ct.id)}>
                                {ct.name}
                            </Button>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4"/> Create New
                        </Button>
                    </div>
                </div>
                <div className="md:col-span-2">
                    {selectedContentType ? (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="ct-name">Content Type Name</Label>
                                <Input id="ct-name" value={selectedContentType.name} 
                                    onChange={e => setSelectedContentType({...selectedContentType, name: e.target.value, slug: slugify(e.target.value)})} 
                                    placeholder="e.g., Blog Post" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="ct-slug">API Slug</Label>
                                <Input id="ct-slug" value={selectedContentType.slug} disabled placeholder="e.g., blog-post" />
                            </div>
                            <h4 className="font-semibold pt-4">Fields</h4>
                            <div className="space-y-2">
                                {selectedContentType.fields.map((field, index) => (
                                    <div key={index} className="flex gap-2 items-center p-2 rounded-md bg-muted/50">
                                        <Input value={field.name} onChange={e => handleFieldNameChange(index, e.target.value)} placeholder="Field Name"/>
                                        <Select value={field.type} onValueChange={v => handleFieldTypeChange(index, v as FieldType)}>
                                            <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="textarea">Textarea</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="boolean">Boolean</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="image">Image</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button size="icon" variant="ghost" onClick={() => handleRemoveField(index)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" onClick={handleAddField} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Field</Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Select a content type or create a new one.</div>
                    )}
                </div>
            </CardContent>
            {selectedContentType && (
                <CardFooter className="flex justify-between">
                    <div>
                        {!isCreatingNew && (
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setSelectedContentType(null); setIsCreatingNew(false); }}>Cancel</Button>
                        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Save</Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
};
