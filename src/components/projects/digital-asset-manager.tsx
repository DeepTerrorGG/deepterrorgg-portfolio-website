
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
  url?: string; // This will now store a Base64 dataURL for images
  size?: number;
}

type UploadProgress = {
    progress: number;
    file: File;
};

interface AssetState {
    items: FSItem[];
    uploadProgress: Record<string, UploadProgress>;
}

const initialItems: FSItem[] = [
  { id: '1', name: 'Documents', type: 'folder', path: 'Documents' },
  { id: '2', name: 'Images', type: 'folder', path: 'Images' },
  { id: '5', name: 'meeting-notes.txt', type: 'file', path: 'meeting-notes.txt', url: '#', size: 2048 },
  { id: '8', name: 'Reports', type: 'folder', path: 'Documents/Reports' },
  { id: '9', name: 'Q1-report.docx', type: 'file', path: 'Documents/Reports/Q1-report.docx', url: '#', size: 54321 },
  { id: '10', name: 'budget.xlsx', type: 'file', path: 'Documents/Reports/budget.xlsx', url: '#', size: 23456 },
];
// --- END INITIAL STATE ---

const isImageFile = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
const isPdfFile = (fileName: string) => /\.(pdf)$/i.test(fileName);

const getFileIcon = (fileName: string) => {
    const iconBaseClasses = "w-16 h-16 sm:w-24 sm:h-24";
    let icon;

    if (/\.(pdf)$/i.test(fileName)) icon = <FileText className={cn(iconBaseClasses, "text-red-500")} />;
    else if (/\.(docx?)$/i.test(fileName)) icon = <FileText className={cn(iconBaseClasses, "text-blue-500")} />;
    else if (/\.(xlsx?|csv)$/i.test(fileName)) icon = <FileSpreadsheet className={cn(iconBaseClasses, "text-green-500")} />;
    else if (/\.(txt|md)$/i.test(fileName)) icon = <FileText className={cn(iconBaseClasses, "text-gray-500")} />;
    else if (/\.(json|js|ts|html|css)$/i.test(fileName)) icon = <FileJson className={cn(iconBaseClasses, "text-yellow-500")} />;
    else icon = <FileIcon className={cn(iconBaseClasses, "text-muted-foreground")} />;
    
    return (
        <div className="flex flex-col items-center justify-center text-center">
            {icon}
            <p className="mt-2 text-xs text-muted-foreground w-full max-w-[96px] sm:max-w-[128px] truncate">{fileName}</p>
        </div>
    );
};


const DigitalAssetManager: React.FC = () => {
  const [assetState, setAssetState] = useState<AssetState>({ items: initialItems, uploadProgress: {} });
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
  
  // Load from local storage
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('dam_items_v2'); // Use a new key to avoid conflicts
      const items = storedItems ? JSON.parse(storedItems) : initialItems;
      setAssetState({ items, uploadProgress: {} });
    } catch (e) {
      console.error("Failed to load from local storage", e);
      setAssetState({ items: initialItems, uploadProgress: {} });
    }
    setIsLoading(false);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('dam_items_v2', JSON.stringify(assetState.items));
    }
  }, [assetState.items, isLoading]);
  
    // UNIFIED UPLOAD EFFECT
  useEffect(() => {
    if (Object.keys(assetState.uploadProgress).length === 0) return;

    const interval = setInterval(() => {
      setAssetState(prev => {
        const newProgress = { ...prev.uploadProgress };
        const newItems = [...prev.items];
        let hasChanges = false;
        
        for (const fileName in newProgress) {
          hasChanges = true;
          const current = newProgress[fileName];
          const nextProgress = Math.min(100, current.progress + Math.random() * 30);
          
          if (nextProgress >= 100) {
            const file = current.file;
            const newPath = currentPath ? `${currentPath}/${fileName}` : fileName;
            const reader = new FileReader();
            
            reader.onload = (readEvent) => {
              const newFileItem: FSItem = {
                id: crypto.randomUUID(),
                name: fileName,
                type: 'file',
                path: newPath,
                url: readEvent.target?.result as string,
                size: file.size
              };
              
              setAssetState(currentState => {
                  const updatedProgress = { ...currentState.uploadProgress };
                  delete updatedProgress[fileName];
                  return {
                      items: [...currentState.items, newFileItem],
                      uploadProgress: updatedProgress,
                  }
              });
            };
            reader.readAsDataURL(file);
            // This is async, so we just remove it from the progress to be updated
            delete newProgress[fileName];

          } else {
            newProgress[fileName] = { ...current, progress: nextProgress };
          }
        }
        
        if (!hasChanges) {
          clearInterval(interval);
        }
        
        return { ...prev, uploadProgress: newProgress };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [assetState.uploadProgress, currentPath]);
  
  const displayedItems = useMemo(() => {
    return assetState.items
      .filter(item => {
          const itemParentPath = item.path.includes('/') ? item.path.substring(0, item.path.lastIndexOf('/')) : '';
          return itemParentPath === currentPath;
      })
      .sort((a, b) => {
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
      });
  }, [assetState.items, currentPath]);

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setAssetState(prev => {
        const newUploads: Record<string, UploadProgress> = {};
        let filesToUploadCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;
            
            const pathToCheck = currentPath ? `${currentPath}/${fileName}` : fileName;
            if (prev.items.some(item => item.path === pathToCheck) || prev.uploadProgress[fileName]) {
                toast({ title: "File already exists", description: `"${fileName}" is already in this folder or upload queue.`, variant: "destructive" });
                continue;
            }
            newUploads[fileName] = { progress: 0, file: file };
            filesToUploadCount++;
        }

        if (filesToUploadCount > 0) {
            toast({
              title: "Upload Started",
              description: `Uploading ${filesToUploadCount} file(s)...`,
            });
        }
        return { ...prev, uploadProgress: { ...prev.uploadProgress, ...newUploads } };
    });
  };
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) { toast({ title: 'Folder name is required', variant: 'destructive'}); return; }
    const newPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;
    if (assetState.items.some(item => item.path === newPath)) {
        toast({ title: 'Folder already exists', variant: 'destructive' });
        return;
    }
    const newFolder: FSItem = { id: crypto.randomUUID(), name: newFolderName, type: 'folder', path: newPath };
    setAssetState(prev => ({...prev, items: [...prev.items, newFolder]}));
    toast({ title: `Folder "${newFolderName}" created.` });
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };
  
  const copyLink = (item: FSItem) => {
    navigator.clipboard.writeText(item.url || window.location.href);
    toast({ title: `Share link copied for ${item.name}`});
  }

  const handleRename = () => {
    if (!renamingItem) return;
    const newName = renamingItem.name.trim();
    if (!newName) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    
    const parentPath = renamingItem.path.includes('/') ? renamingItem.path.substring(0, renamingItem.path.lastIndexOf('/')) : '';
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (assetState.items.some(item => item.path === newPath && item.id !== renamingItem.id)) {
        toast({ title: 'An item with this name already exists', variant: 'destructive' });
        return;
    }

    const isFolder = renamingItem.type === 'folder';

    setAssetState(prev => ({...prev, items: prev.items.map(item => {
        if (isFolder && item.path.startsWith(renamingItem.path + '/')) {
             const newChildPath = newPath + item.path.substring(renamingItem.path.length);
             return { ...item, path: newChildPath };
        }
        if (item.id === renamingItem.id) {
            return { ...item, name: newName, path: newPath };
        }
        return item;
    })}));

    toast({ title: 'Renamed successfully' });
    setRenamingItem(null);
  };
  
  const handleMove = (destinationPath: string) => {
    if (!movingItem) return;

    const newPath = destinationPath ? `${destinationPath}/${movingItem.name}` : movingItem.name;
    if (assetState.items.some(item => item.path === newPath && item.id !== movingItem.id)) {
      toast({ title: 'An item with this name already exists in the destination', variant: 'destructive' });
      return;
    }
    
    if(movingItem.type === 'folder') {
        setAssetState(prev => ({...prev, items: prev.items.map(item => {
            if(item.path.startsWith(movingItem.path + '/')) {
                const newChildPath = newPath + item.path.substring(movingItem.path.length);
                return { ...item, path: newChildPath };
            }
            if(item.id === movingItem.id) {
                return { ...item, path: newPath };
            }
            return item;
        })}));
    } else {
        setAssetState(prev => ({...prev, items: prev.items.map(item => item.id === movingItem.id ? { ...item, path: newPath } : item)}));
    }

    toast({ title: `Moved "${movingItem.name}" to "${destinationPath || 'Root'}"` });
    setMovingItem(null);
  };
  
  const deleteItem = (itemToDelete: FSItem) => {
    setAssetState(prev => ({...prev, items: prev.items.filter(item => {
        if(item.id === itemToDelete.id) return false;
        if(itemToDelete.type === 'folder' && item.path.startsWith(itemToDelete.path + '/')) return false;
        return true;
    })}));
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
          <div className="aspect-square flex items-center justify-center p-4 bg-muted/30 rounded-t-lg overflow-hidden">
              {item.type === 'folder' ? <Folder className="w-16 h-16 sm:w-24 sm:h-24 text-primary"/> : 
                isImageFile(item.name) && item.url ? <Image src={item.url} alt={item.name} width={96} height={96} className="w-full h-full object-cover"/> : getFileIcon(item.name)}
          </div>
          <div className="p-2 text-center text-sm truncate">{item.name}</div>
          
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                {item.type === 'file' && item.url && <DropdownMenuItem onClick={() => { const link = document.createElement('a'); link.href = item.url!; link.download = item.name; link.click(); }}><Download className="mr-2 h-4 w-4"/>Download</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => setMovingItem(item)}><Move className="mr-2 h-4 w-4"/>Move</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenamingItem({ ...item })}><Edit className="mr-2 h-4 w-4"/>Rename</DropdownMenuItem>
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
          <ContextMenuItem onClick={() => setRenamingItem({ ...item })}><Edit className="mr-2 h-4 w-4"/>Rename</ContextMenuItem>
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
              {Object.entries(assetState.uploadProgress).map(([name, { progress }]) => (
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
        <DialogContent><DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
        <Input placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateFolder()} autoFocus/>
        <DialogFooter><Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button><Button onClick={handleCreateFolder}>Create</Button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={!!renamingItem} onOpenChange={v => !v && setRenamingItem(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Rename "{renamingItem?.path.split('/').pop()}"</DialogTitle></DialogHeader>
            <Input 
                value={renamingItem?.name || ''} 
                onChange={(e) => setRenamingItem(prev => prev ? {...prev, name: e.target.value} : null)} 
                onKeyDown={e => e.key === 'Enter' && handleRename()} 
                autoFocus
            />
            <DialogFooter><Button variant="outline" onClick={() => setRenamingItem(null)}>Cancel</Button><Button onClick={handleRename}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!movingItem} onOpenChange={() => setMovingItem(null)}>
        <DialogContent><DialogHeader><DialogTitle>Move "{movingItem?.name}"</DialogTitle></DialogHeader><p className="text-muted-foreground text-sm my-4">Select a destination folder.</p><div className="space-y-2 max-h-64 overflow-y-auto">{assetState.items.filter(i => i.type === 'folder' && i.id !== movingItem?.id && !i.path.startsWith(movingItem?.path + '/')).map(folder => (<Button key={folder.id} variant="outline" className="w-full justify-start" onClick={() => handleMove(folder.path)}><Folder className="mr-2 h-4 w-4"/>{folder.path}</Button>))}<Button variant="outline" className="w-full justify-start" onClick={() => handleMove('')}><Folder className="mr-2 h-4 w-4"/>Root</Button></div></DialogContent>
      </Dialog>
      <Dialog open={!!previewingItem} onOpenChange={v => !v && setPreviewingItem(null)}>
         <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 sm:rounded-lg overflow-hidden bg-muted/80 backdrop-blur-sm border-border">
          <DialogHeader className="p-4 border-b flex-row justify-between items-center">
            <DialogTitle>{previewingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex items-center justify-center overflow-hidden p-4">
            {previewingItem && isImageFile(previewingItem.name) && previewingItem.url ? (
              <Image 
                src={previewingItem.url} 
                alt="Image preview"
                width={800} 
                height={600} 
                className="max-w-full max-h-full object-contain"
              />
            ) : previewingItem && isPdfFile(previewingItem.name) && previewingItem.url && previewingItem.url !== '#' ? (
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
