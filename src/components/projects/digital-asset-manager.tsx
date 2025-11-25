
'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Folder, File, Upload, Plus, MoreVertical, Trash2, Link as LinkIcon, Edit, Loader2, ArrowLeft, Download, X, Share2
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
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';

interface FileItem {
  name: string;
  type: 'file';
  path: string;
  url: string;
  size: number;
}

interface FolderItem {
  name: string;
  type: 'folder';
  path: string;
}

type AssetItem = FileItem | FolderItem;

const DigitalAssetManager: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const storage = getStorage();
      const listRef = ref(storage, currentPath);
      const res = await listAll(listRef);

      const folders: FolderItem[] = res.prefixes.map(folderRef => ({
        name: folderRef.name,
        type: 'folder',
        path: folderRef.fullPath,
      }));
      
      const files: FileItem[] = await Promise.all(res.items.map(async itemRef => {
        const metadata = await itemRef.getMetadata();
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          type: 'file' as const,
          path: itemRef.fullPath,
          url,
          size: metadata.size,
        };
      }));

      setItems([...folders, ...files]);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error fetching files', variant: 'destructive' });
    }
    setIsLoading(false);
  }, [currentPath, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleUpload = (files: FileList) => {
    if (!files) return;
    const storage = getStorage();

    Array.from(files).forEach(file => {
      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({...prev, [file.name]: progress}));
        },
        (error) => {
          console.error(error);
          toast({ title: `Upload failed for ${file.name}`, variant: 'destructive'});
          setUploadProgress(prev => { const newProg = {...prev}; delete newProg[file.name]; return newProg; });
        },
        () => {
          fetchItems();
          toast({ title: 'Upload complete', description: `${file.name} has been uploaded.`});
          setTimeout(() => {
            setUploadProgress(prev => { const newProg = {...prev}; delete newProg[file.name]; return newProg; });
          }, 2000);
        }
      );
    });
  };

  const handleFolderClick = (path: string) => setCurrentPath(path);

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };
  
  const createFolder = async () => {
    if (!newFolderName.trim()) { toast({ title: 'Folder name is required', variant: 'destructive'}); return; }
    
    // In Firebase Storage, folders are created by uploading a "placeholder" file.
    // A zero-byte file is a common approach.
    const folderPath = currentPath ? `${currentPath}/${newFolderName}/` : `${newFolderName}/`;
    const placeholderPath = `${folderPath}.placeholder`;

    const storage = getStorage();
    const storageRef = ref(storage, placeholderPath);
    try {
        await uploadBytesResumable(storageRef, new Blob());
        fetchItems();
        toast({ title: `Folder "${newFolderName}" created`});
    } catch(e) {
        console.error(e);
        toast({ title: 'Error creating folder', variant: 'destructive'});
    }
    setIsNewFolderOpen(false);
    setNewFolderName('');
  }

  const deleteItem = async (item: AssetItem) => {
    const storage = getStorage();
    if(item.type === 'file') {
        await deleteObject(ref(storage, item.path));
    } else { // Folder
        const listRef = ref(storage, item.path);
        const res = await listAll(listRef);
        await Promise.all(res.items.map(itemRef => deleteObject(itemRef)));
        // Also need to delete subfolders recursively, simplified for this demo
    }
    fetchItems();
    toast({ title: `Deleted "${item.name}"`, variant: 'destructive'});
  }
  
  const formatBytes = (bytes: number, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

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
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Upload</Button>
            <input type="file" ref={fileInputRef} onChange={e => handleUpload(e.target.files!)} multiple className="hidden"/>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 relative overflow-y-auto">
          {isLoading ? (
             <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            items.length > 0 || Object.keys(uploadProgress).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map(item => (
                    <Card key={item.path} className="group relative transition-all hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square flex items-center justify-center p-4 bg-muted/30 rounded-t-lg" onClick={() => item.type === 'folder' && handleFolderClick(item.path)}>
                          {item.type === 'folder' ? <Folder className="w-16 h-16 text-primary"/> : <File className="w-16 h-16 text-muted-foreground"/>}
                      </div>
                      <div className="p-2 text-center text-sm truncate">{item.name}</div>
                      <div className="absolute top-1 right-1">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  {item.type==='file' && <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(item.url)}><LinkIcon className="mr-2 h-4 w-4"/>Copy Link</DropdownMenuItem>}
                                  {item.type==='file' && <DropdownMenuItem onSelect={() => window.open(item.url, '_blank')}><Download className="mr-2 h-4 w-4"/>Download</DropdownMenuItem>}
                                  <DropdownMenuItem onSelect={() => deleteItem(item)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                  <AnimatePresence>
                  {Object.entries(uploadProgress).map(([name, progress]) => (
                     <motion.div key={name} initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, scale: 0.8}} className="group relative border rounded-lg">
                        <div className="aspect-square flex flex-col items-center justify-center p-4 bg-muted/30 rounded-t-lg">
                            <Loader2 className="w-16 h-16 text-primary animate-spin"/>
                        </div>
                        <div className="p-2 text-sm truncate text-center">{name}</div>
                        <Progress value={progress} className="w-full h-1 rounded-none rounded-b-lg"/>
                      </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
            ) : (
                <div className="text-center text-muted-foreground pt-16">This folder is empty.</div>
            )
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
            <Input placeholder="Folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createFolder()}/>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
                <Button onClick={createFolder}>Create</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalAssetManager;
