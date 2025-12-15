
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ContentType = { id: string; name: string; slug: string; };

export const ApiExplorer: React.FC = () => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const contentTypesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'content_types') : null, [firestore]);
    const { data: contentTypes } = useCollection<ContentType>(contentTypesQuery);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Explorer</CardTitle>
                <CardDescription>View auto-generated API endpoints for your content types.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {contentTypes && contentTypes.length > 0 ? contentTypes.map(ct => (
                    <div key={ct.id} className="p-3 rounded-md bg-muted/50">
                        <h3 className="font-semibold">{ct.name}</h3>
                        <div className="flex items-center justify-between gap-2 mt-1">
                            <code className="text-sm p-2 bg-background rounded-md flex-grow">
                                GET {baseUrl}/api/content/{ct.slug}
                            </code>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(`${baseUrl}/api/content/${ct.slug}`)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )) : (
                    <p className="text-muted-foreground text-center py-8">No content types created yet. Add a schema to see API endpoints.</p>
                )}
            </CardContent>
        </Card>
    );
};
