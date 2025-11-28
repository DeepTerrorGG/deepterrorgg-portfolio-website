
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';

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
  const auth = useAuth();
  const user = auth?.currentUser;
  
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const rootPath = useMemo(() => {
    return user ? `user_files/${user.uid}` : '';
  }, [user]);

  const fetchItems = useCallback(async (currentRootPath: string) => {
    const fullPath = currentPath ? `${currentRootPath}/${currentPath}` : currentRootPath;
    setIsLoading(true);

    try {
      const storage = getStorage();
      const listRef = ref(storage, fullPath);
      const res = await listAll(listRef);

      const folders: FolderItem[] = res.prefixes.map(folderRef => ({
        name: folderRef.name,
        type: 'folder',
        path: folderRef.fullPath.substring(currentRootPath.length > 0 ? currentRootPath.length + 1 : 0),
      }));
      
      const files: FileItem[] = await Promise.all(res.items.map(async itemRef => {
        if(itemRef.name === '.placeholder') return null;
        const metadata = await itemRef.getMetadata();
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          type: 'file' as const,
          path: itemRef.fullPath.substring(currentRootPath.length > 0 ? currentRootPath.length + 1 : 0),
          url,
          size: metadata.size,
        };
      }));

      setItems([...folders, ...files.filter((f): f is FileItem => f !== null)]);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error fetching files', variant: 'destructive' });
    }
    setIsLoading(false);
  }, [currentPath, toast]);

  // Effect for signing in and fetching initial data
  useEffect(() => {
    if (auth && !user) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        toast({ title: 'Authentication Failed', description: 'Could not sign in anonymously.', variant: 'destructive' });
        setIsLoading(false);
      });
    } else if (user && rootPath) {
      fetchItems(rootPath);
    } else {
        setIsLoading(true); // Waiting for auth
    }
  }, [user, rootPath, auth, fetchItems, toast]);


  const handleUpload = (files: FileList) => {
    if (!files || !rootPath) return;
    const fullCurrentPath = currentPath ? `${rootPath}/${currentPath}` : rootPath;
    const storage = getStorage();

    Array.from(files).forEach(file => {
      const filePath = `${fullCurrentPath}/${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploadProgress(prev => ({...prev, [file.name]: 0}));

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
          fetchItems(rootPath); // Refetch after upload
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
    if (!newFolderName.trim() || !rootPath) { toast({ title: 'Folder name is required', variant: 'destructive'}); return; }
    const fullCurrentPath = currentPath ? `${rootPath}/${currentPath}` : rootPath;
    
    const folderPath = `${fullCurrentPath}/${newFolderName}/`;
    const placeholderPath = `${folderPath}.placeholder`;

    const storage = getStorage();
    const storageRef = ref(storage, placeholderPath);
    try {
        await uploadBytesResumable(storageRef, new Blob(['']));
        fetchItems(rootPath);
        toast({ title: `Folder "${newFolderName}" created`});
    } catch(e) {
        console.error(e);
        toast({ title: 'Error creating folder', variant: 'destructive'});
    }
    setIsNewFolderOpen(false);
    setNewFolderName('');
  }

  const deleteItem = async (item: AssetItem) => {
    if(!rootPath) return;
    const storage = getStorage();
    const fullItemPath = `${rootPath}/${item.path}`;

    if(item.type === 'file') {
        await deleteObject(ref(storage, fullItemPath));
    } else {
        const listRef = ref(storage, fullItemPath);
        const res = await listAll(listRef);
        // This is a simplified version, it won't delete nested folders for this demo.
        await Promise.all(res.items.map(itemRef => deleteObject(itemRef)));
        // Delete the placeholder to "delete" the folder
        const placeholderRef = ref(storage, `${fullItemPath}/.placeholder`);
        try { await deleteObject(placeholderRef) } catch(e) { /* ignore */ }
    }
    fetchItems(rootPath);
    toast({ title: `Deleted "${item.name}"`, variant: "destructive"});
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
            <Button onClick={() => setIsNewFolderOpen(true)} disabled={!user}><Plus className="mr-2 h-4 w-4"/>New Folder</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!user}><Upload className="mr-2 h-4 w-4"/>Upload</Button>
            <input type="file" ref={fileInputRef} onChange={e => e.target.files && handleUpload(e.target.files)} multiple className="hidden"/>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 relative overflow-y-auto">
          {isLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2">{user ? "Loading files..." : "Authenticating..."}</p>
            </div>
          ) : (
            items.length > 0 || Object.keys(uploadProgress).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map(item => (
                    <Card key={item.path} className="group relative transition-all hover:shadow-lg hover:-translate-y-1">
                      <div className="aspect-square flex items-center justify-center p-4 bg-muted/30 rounded-t-lg cursor-pointer" onClick={() => item.type === 'folder' && handleFolderClick(item.path)}>
                          {item.type === 'folder' ? <Folder className="w-16 h-16 text-primary"/> : <File className="w-16 h-16 text-muted-foreground"/>}
                      </div>
                      <div className="p-2 text-center text-sm truncate">{item.name}</div>
                      <div className="absolute top-1 right-1">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                  {item.type==='file' && <DropdownMenuItem onSelect={() => {navigator.clipboard.writeText((item as FileItem).url); toast({title: "Link Copied!"})}}><LinkIcon className="mr-2 h-4 w-4"/>Copy Link</DropdownMenuItem>}
                                  {item.type==='file' && <DropdownMenuItem onSelect={() => window.open((item as FileItem).url, '_blank')}><Download className="mr-2 h-4 w-4"/>Download</DropdownMenuItem>}
                                  <DropdownMenuItem onSelect={() => deleteItem(item)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                  <AnimatePresence>
                  {Object.entries(uploadProgress).map(([name, progress]) => (
                     <motion.div key={name} initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0, scale: 0.8}} className="group relative border rounded-lg flex flex-col">
                        <div className="aspect-square flex flex-col items-center justify-center p-4 bg-muted/30 rounded-t-lg">
                            <Loader2 className="w-16 h-16 text-primary animate-spin"/>
                        </div>
                        <div className="p-2 text-sm truncate text-center flex-grow">{name}</div>
                        <Progress value={progress} className="w-full h-1 rounded-b-lg"/>
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
                <Button variant="outline" onClick={() => {setIsNewFolderOpen(false); setNewFolderName('');}}>Cancel</Button>
                <Button onClick={createFolder}>Create</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalAssetManager;

    