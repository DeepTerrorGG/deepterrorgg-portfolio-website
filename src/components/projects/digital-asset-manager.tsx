
'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Folder, File as FileIcon, Upload, Plus, MoreVertical, Trash2, Link as LinkIcon, Edit, Loader2, ArrowLeft, Download, X, Share2, Move, FileText, FileSpreadsheet, FileJson
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Progress } from '../ui/progress';
import Image from 'next/image';

// --- TYPES AND INITIAL STATE ---
interface FSItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  url?: string;
  size?: number;
}

const initialItems: FSItem[] = [
  { id: '1', name: 'Documents', type: 'folder', path: 'Documents' },
  { id: '2', name: 'Images', type: 'folder', path: 'Images' },
  { id: '3', name: 'project-brief.pdf', type: 'file', path: 'project-brief.pdf', url: '#', size: 1024 },
  { id: '4', name: 'logo.png', type: 'file', path: 'logo.png', url: 'https://picsum.photos/seed/4/800/600', size: 51200 },
  { id: '5', name: 'meeting-notes.txt', type: 'file', path: 'meeting-notes.txt', url: '#', size: 2048 },
  { id: '6', name: 'cat.jpg', type: 'file', path: 'Images/cat.jpg', url: 'https://picsum.photos/seed/cat/800/600', size: 12345 },
  { id: '7', name: 'dog.jpg', type: 'file', path: 'Images/dog.jpg', url: 'https://picsum.photos/seed/dog/800/600', size: 23456 },
  { id: '8', name: 'Reports', type: 'folder', path: 'Documents/Reports' },
  { id: '9', name: 'Q1-report.docx', type: 'file', path: 'Documents/Reports/Q1-report.docx', url: '#', size: 54321 },
  { id: '10', name: 'budget.xlsx', type: 'file', path: 'Documents/Reports/budget.xlsx', url: '#', size: 23456 },
];
// --- END INITIAL STATE ---

const isImageFile = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
const isPdfFile = (fileName: string) => /\.(pdf)$/i.test(fileName);


const getFileIcon = (fileName: string) => {
    if (/\.(pdf)$/i.test(fileName)) return <FileText className="w-16 h-16 sm:w-24 sm:h-24 text-red-500" />;
    if (/\.(docx?)$/i.test(fileName)) return <FileText className="w-16 h-16 sm:w-24 sm:h-24 text-blue-500" />;
    if (/\.(xlsx?|csv)$/i.test(fileName)) return <FileSpreadsheet className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" />;
    if (/\.(txt|md)$/i.test(fileName)) return <FileText className="w-16 h-16 sm:w-24 sm:h-24 text-gray-500" />;
    if (/\.(json|js|ts|html|css)$/i.test(fileName)) return <FileJson className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-500" />;
    return <FileIcon className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground" />;
};


const DigitalAssetManager: React.FC = () => {
  const [items, setItems] = useState<FSItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingItem, setRenamingItem] = useState<FSItem | null>(null);
  const [movingItem, setMovingItem] = useState<FSItem | null>(null);
  const [previewingItem, setPreviewingItem] = useState<FSItem | null>(null);
  
  // Upload state
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Load from local storage
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('dam_items');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        setItems(initialItems);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
      setItems(initialItems);
    }
    setIsLoading(false);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('dam_items', JSON.stringify(items));
    }
  }, [items, isLoading]);

  const displayedItems = useMemo(() => {
    return items
      .filter(item => {
          const itemParentPath = item.path.includes('/') ? item.path.substring(0, item.path.lastIndexOf('/')) : '';
          return itemParentPath === currentPath;
      })
      .sort((a, b) => {
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
      });
  }, [items, currentPath]);

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const currentProgress = prev[fileName] || 0;
                const nextProgress = Math.min(100, currentProgress + Math.random() * 20);
                if (nextProgress >= 100) {
                    clearInterval(interval);
                    const newPath = currentPath ? `${currentPath}/${fileName}` : fileName;
                    const newItem: FSItem = { id: crypto.randomUUID(), name: fileName, type: 'file', path: newPath, url: URL.createObjectURL(file), size: file.size };
                    setItems(currentItems => [...currentItems, newItem]);
                    const finalProgress = { ...prev };
                    delete finalProgress[fileName];
                    return finalProgress;
                }
                return { ...prev, [fileName]: nextProgress };
            });
        }, 200);
    }

    toast({
      title: "Upload Started",
      description: `Uploading ${files.length} file(s)...`,
    });
  };
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) { toast({ title: 'Folder name is required', variant: 'destructive'}); return; }
    const newPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
    if (items.some(item => item.path === newPath)) {
        toast({ title: 'Folder already exists', variant: 'destructive' });
        return;
    }
    const newFolder: FSItem = { id: crypto.randomUUID(), name: newFolderName, type: 'folder', path: newPath };
    setItems(prev => [...prev, newFolder]);
    toast({ title: `Folder "${newFolderName}" created.` });
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };
  
  const copyLink = (item: FSItem) => {
    navigator.clipboard.writeText(item.url || window.location.href);
    toast({ title: `Share link copied for ${item.name}`});
  }

  const handleRename = () => {
    if (!renamingItem || !renamingItem.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    const newPath = renamingItem.path.includes('/') 
      ? `${renamingItem.path.substring(0, renamingItem.path.lastIndexOf('/'))}/${renamingItem.name}`
      : renamingItem.name;

    if (items.some(item => item.path === newPath && item.id !== renamingItem.id)) {
        toast({ title: 'An item with this name already exists', variant: 'destructive' });
        return;
    }

    setItems(prev => prev.map(item => item.id === renamingItem.id ? { ...item, name: renamingItem.name, path: newPath } : item));
    toast({ title: 'Renamed successfully' });
    setRenamingItem(null);
  };

  const handleMove = (destinationPath: string) => {
    if (!movingItem) return;

    const newPath = destinationPath ? `${destinationPath}/${movingItem.name}` : movingItem.name;
    if (items.some(item => item.path === newPath && item.id !== movingItem.id)) {
      toast({ title: 'An item with this name already exists in the destination', variant: 'destructive' });
      return;
    }
    
    if(movingItem.type === 'folder') {
        setItems(prev => prev.map(item => {
            if(item.path.startsWith(movingItem.path + '/')) { // It's a child
                const newChildPath = newPath + item.path.substring(movingItem.path.length);
                return { ...item, path: newChildPath };
            }
            if(item.id === movingItem.id) {
                return { ...item, path: newPath };
            }
            return item;
        }));
    } else {
        setItems(prev => prev.map(item => item.id === movingItem.id ? { ...item, path: newPath } : item));
    }

    toast({ title: `Moved "${movingItem.name}" to "${destinationPath || 'Root'}"` });
    setMovingItem(null);
  };
  
  const deleteItem = (itemToDelete: FSItem) => {
    setItems(prev => prev.filter(item => {
        if(item.id === itemToDelete.id) return false;
        if(itemToDelete.type === 'folder' && item.path.startsWith(itemToDelete.path + '/')) return false;
        return true;
    }));
    toast({ title: `Deleted ${itemToDelete.name}`, variant: "destructive" });
  }

  const FileSystemItem = ({ item }: { item: FSItem }) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card 
          className="group relative transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          onClick={() => {
            if (item.type === 'folder') setCurrentPath(item.path);
            else setPreviewingItem(item);
          }}
        >
          <div className="aspect-square flex items-center justify-center p-4 bg-muted/30 rounded-t-lg">
              {item.type === 'folder' ? <Folder className="w-16 h-16 sm:w-24 sm:h-24 text-primary"/> : getFileIcon(item.name)}
          </div>
          <div className="p-2 text-center text-sm truncate">{item.name}</div>
          
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                {item.type === 'file' && item.url && <DropdownMenuItem onClick={() => { const link = document.createElement('a'); link.href = item.url!; link.download = item.name; link.click(); }}><Download className="mr-2 h-4 w-4"/>Download</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => setMovingItem(item)}><Move className="mr-2 h-4 w-4"/>Move</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenamingItem(item)}><Edit className="mr-2 h-4 w-4"/>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyLink(item)}><LinkIcon className="mr-2 h-4 w-4"/>Copy Link</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <AlertDialog>
                  <AlertDialogTrigger asChild><DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                  <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{item.name}". If this is a folder, all its contents will also be deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem(item)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent onClick={e => e.stopPropagation()}>
          {item.type === 'file' && item.url && <ContextMenuItem onClick={() => { const link = document.createElement('a'); link.href = item.url!; link.download = item.name; link.click(); }}><Download className="mr-2 h-4 w-4"/>Download</ContextMenuItem>}
          <ContextMenuItem onClick={() => setMovingItem(item)}><Move className="mr-2 h-4 w-4"/>Move</ContextMenuItem>
          <ContextMenuItem onClick={() => setRenamingItem(item)}><Edit className="mr-2 h-4 w-4"/>Rename</ContextMenuItem>
          <ContextMenuItem onClick={() => copyLink(item)}><Share2 className="mr-2 h-4 w-4"/>Share</ContextMenuItem>
          <ContextMenuSeparator/>
          <AlertDialog>
              <AlertDialogTrigger asChild><ContextMenuItem onSelect={e => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</ContextMenuItem></AlertDialogTrigger>
              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{item.name}". If this is a folder, all its contents will also be deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteItem(item)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <div className="w-full h-full bg-card flex flex-col p-4">
      <Card className="w-full h-full mx-auto shadow-2xl flex flex-col">
        <CardHeader className="flex-row items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            {currentPath && <Button variant="ghost" size="icon" onClick={navigateUp}><ArrowLeft className="h-5 w-5"/></Button>}
            <h2 className="text-sm text-muted-foreground">/{currentPath}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsNewFolderOpen(true)}><Plus className="mr-2 h-4 w-4"/>New Folder</Button>
            <Button variant="outline" onClick={handleUploadClick}><Upload className="mr-2 h-4 w-4"/>Upload</Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden"/>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 relative overflow-y-auto">
          {isLoading ? ( <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="mt-2">Loading files...</p></div> ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedItems.map(item => <FileSystemItem key={item.id} item={item} />)}
              {Object.entries(uploadProgress).map(([name, progress]) => (
                <div key={name} className="p-2 border rounded-lg flex flex-col justify-center items-center gap-2">
                    <p className="text-xs truncate w-full text-center">{name}</p>
                    <Progress value={progress} className="h-2 w-full"/>
                    <p className="text-xs font-mono">{Math.round(progress)}%</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent><DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader><Input placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} autoFocus/><DialogFooter><Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button><Button onClick={handleCreateFolder}>Create</Button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={!!renamingItem} onOpenChange={() => setRenamingItem(null)}>
        <DialogContent><DialogHeader><DialogTitle>Rename "{renamingItem?.name}"</DialogTitle></DialogHeader><Input defaultValue={renamingItem?.name} onChange={e => setRenamingItem(r => r ? {...r, name: e.target.value} : null)} onKeyDown={e => e.key === 'Enter' && handleRename()} autoFocus/><DialogFooter><Button variant="outline" onClick={() => setRenamingItem(null)}>Cancel</Button><Button onClick={handleRename}>Save</Button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={!!movingItem} onOpenChange={() => setMovingItem(null)}>
        <DialogContent><DialogHeader><DialogTitle>Move "{movingItem?.name}"</DialogTitle></DialogHeader><p className="text-muted-foreground text-sm my-4">Select a destination folder.</p><div className="space-y-2 max-h-64 overflow-y-auto">{items.filter(i => i.type === 'folder' && i.id !== movingItem?.id && !i.path.startsWith(movingItem?.path + '/')).map(folder => (<Button key={folder.id} variant="outline" className="w-full justify-start" onClick={() => handleMove(folder.path)}><Folder className="mr-2 h-4 w-4"/>{folder.path}</Button>))}<Button variant="outline" className="w-full justify-start" onClick={() => handleMove('')}><Folder className="mr-2 h-4 w-4"/>Root</Button></div></DialogContent>
      </Dialog>
      <Dialog open={!!previewingItem} onOpenChange={() => setPreviewingItem(null)}>
         <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{previewingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex items-center justify-center bg-muted/50 rounded-b-lg overflow-hidden">
            {previewingItem && isImageFile(previewingItem.name) ? (
              <Image 
                src={previewingItem.url || 'https://picsum.photos/seed/placeholder/800/600'} 
                alt={previewingItem.name || ''} 
                width={800} 
                height={600} 
                className="max-w-full max-h-full object-contain"
              />
            ) : previewingItem && isPdfFile(previewingItem.name) && previewingItem.url ? (
                <iframe src={previewingItem.url} className="w-full h-full border-0" title={previewingItem.name} />
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                {previewingItem && getFileIcon(previewingItem.name)}
                <p>No preview available for this file type.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalAssetManager;
