
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const ApiExplorer: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>API Explorer</CardTitle>
                <CardDescription>View auto-generated API endpoints for your content types.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">API Explorer will be implemented here.</p>
            </CardContent>
        </Card>
    );
};
