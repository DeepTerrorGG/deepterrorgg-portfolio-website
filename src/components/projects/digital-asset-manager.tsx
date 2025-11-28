
'use client';

import React, { useState, useRef } from 'react';
import {
  Folder, File as FileIcon, Upload, Plus, MoreVertical, Trash2, Link as LinkIcon, Edit, Loader2, ArrowLeft, Download, X, Share2, Copy
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";


// --- MOCK DATA & TYPES ---
interface FSItem {
  name: string;
  type: 'folder' | 'file';
  path: string;
  url?: string;
  size?: number;
}

const placeholderItems: FSItem[] = [
  { name: 'Documents', type: 'folder', path: 'Documents' },
  { name: 'Images', type: 'folder', path: 'Images' },
  { name: 'project-brief.pdf', type: 'file', path: 'project-brief.pdf', url: '#', size: 1024 },
  { name: 'logo.png', type: 'file', path: 'logo.png', url: '#', size: 51200 },
  { name: 'meeting-notes.txt', type: 'file', path: 'meeting-notes.txt', url: '#', size: 2048 },
];
// --- END MOCK DATA ---

const DigitalAssetManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    toast({
      title: "Upload Started",
      description: `Uploading ${files.length} file(s)...`,
    });
    // In a real app, you would start the upload process here.
  };
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({ title: 'Folder name is required', variant: 'destructive'});
      return;
    }
    toast({ title: `Folder "${newFolderName}" created.` });
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };
  
  const copyLink = (item: FSItem) => {
    navigator.clipboard.writeText(item.url || window.location.href);
    toast({ title: `Link copied for ${item.name}`});
  }
  
  const deleteItem = (item: FSItem) => {
    toast({ title: `Deleted ${item.name}`, variant: 'destructive'});
  }

  const FileSystemItem = ({ item }: { item: FSItem }) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className="group relative transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="aspect-square flex items-center justify-center p-4 bg-muted/30 rounded-t-lg cursor-pointer">
              {item.type === 'folder' ? <Folder className="w-16 h-16 text-primary"/> : <FileIcon className="w-16 h-16 text-muted-foreground"/>}
          </div>
          <div className="p-2 text-center text-sm truncate">{item.name}</div>
          
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyLink(item)}><LinkIcon className="mr-2 h-4 w-4"/>Copy Link</DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteItem(item)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
          <ContextMenuItem onClick={() => copyLink(item)}><LinkIcon className="mr-2 h-4 w-4"/>Copy Link</ContextMenuItem>
          <ContextMenuItem onClick={() => deleteItem(item)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <div className="w-full h-full bg-card flex flex-col p-4">
      <Card className="w-full h-full mx-auto shadow-2xl flex flex-col">
        <CardHeader className="flex-row items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            {currentPath && (
              <Button variant="ghost" size="icon" onClick={navigateUp}><ArrowLeft className="h-5 w-5"/></Button>
            )}
            <h2 className="text-sm text-muted-foreground">/{currentPath}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsNewFolderOpen(true)}><Plus className="mr-2 h-4 w-4"/>New Folder</Button>
            <Button variant="outline" onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4"/>Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 relative overflow-y-auto">
          {isLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2">Loading files...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {placeholderItems.map(item => (
                <FileSystemItem key={item.path} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
            <Input 
              placeholder="Folder name..." 
              value={newFolderName} 
              onChange={e => setNewFolderName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFolder}>Create</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalAssetManager;
