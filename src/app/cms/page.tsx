
// src/app/cms/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SchemaEditor } from '@/components/cms/schema-editor';
import { ContentEditor } from '@/components/cms/content-editor';
import { ApiExplorer } from '@/components/cms/api-explorer';
import { Database, Edit, Code } from 'lucide-react';

const HeadlessCmsPage: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-card p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <Tabs defaultValue="schema" className="w-full">
          <CardHeader className="px-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-3xl font-bold text-primary">Headless CMS</CardTitle>
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="schema"><Database className="mr-2 h-4 w-4"/>Schema</TabsTrigger>
                <TabsTrigger value="content"><Edit className="mr-2 h-4 w-4"/>Content</TabsTrigger>
                <TabsTrigger value="api"><Code className="mr-2 h-4 w-4"/>API</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          
          <TabsContent value="schema" className="mt-4">
            <SchemaEditor />
          </TabsContent>
          <TabsContent value="content" className="mt-4">
            <ContentEditor />
          </TabsContent>
          <TabsContent value="api" className="mt-4">
            <ApiExplorer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HeadlessCmsPage;
