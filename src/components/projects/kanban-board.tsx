'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Loader2, X, Clock, User, Tag, Calendar as CalendarIcon, Trash2, Settings, Palette } from 'lucide-react';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, query, orderBy, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


// --- MOCK DATA & TYPES ---

const mockTeam = [
    { uid: 'u1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { uid: 'u2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
    { uid: 'u3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
    { uid: 'u4', name: 'Diana', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
];

type TaskCategory = {
  id: string;
  label: string;
  color: string;
};

type Task = {
  id: string;
  content: string;
  order: number;
  assignedTo?: string;
  dueDate?: Timestamp;
  timeEstimate?: number;
  category?: string; // Storing category ID
};

type Column = {
  id: string;
  title: string;
  order: number;
  tasks?: Task[];
};

// --- COMPONENT ---

const KanbanBoard: React.FC = () => {
  const { toast } = useToast();
  const firestore = useFirestore();

  // --- STATE MANAGEMENT ---
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<{ task: Task; fromColId: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  
  const [isRenamingCol, setIsRenamingCol] = useState<{ id: string; name: string } | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingTask, setEditingTask] = useState<Task & { colId: string } | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#808080');

  // --- DATA FETCHING ---
  const columnsQuery = useMemoFirebase(() => query(collection(firestore, 'kanban-columns'), orderBy('order')), [firestore]);
  const { data: columnsData, isLoading: isLoadingColumns } = useCollection<Column>(columnsQuery);
  
  const categoriesQuery = useMemoFirebase(() => query(collection(firestore, 'kanban-categories'), orderBy('label')), [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<TaskCategory>(categoriesQuery);

  const useTasksForColumns = (cols: Column[] | null) => {
    const [tasks, setTasks] = useState<Record<string, Task[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cols || !firestore) {
            setLoading(false);
            return;
        };
        const unsubscribes = cols.map(col => {
            const taskQuery = query(collection(firestore, `kanban-columns/${col.id}/tasks`), orderBy('order'));
            return onSnapshot(taskQuery, snapshot => {
                const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
                setTasks(prevTasks => ({ ...prevTasks, [col.id]: tasksData }));
            });
        });
        setLoading(false);
        return () => { unsubscribes.forEach(unsub => unsub()); };
    }, [cols, firestore]);

    return { tasks, loading };
  };

  const { tasks: tasksByColumn, loading: isLoadingTasks } = useTasksForColumns(columnsData);

  const columns = useMemo(() => {
    return columnsData?.map(col => ({ ...col, tasks: tasksByColumn[col.id] || [] }))
  }, [columnsData, tasksByColumn]);


  // --- HANDLERS ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task, fromColId: string) => {
    setDraggedItem({ task, fromColId });
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, colId: string) => { e.preventDefault(); setDragOverCol(colId); };
  const handleDragLeave = () => setDragOverCol(null);
  const handleDragEnd = () => { setDraggedItem(null); setDragOverCol(null); }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, toColId: string) => {
    e.preventDefault();
    if (!draggedItem) return;
  
    const { task, fromColId } = draggedItem;
    
    if (fromColId === toColId) {
        setDraggedItem(null); setDragOverCol(null);
        return;
    }

    const fromColRef = collection(firestore, `kanban-columns/${fromColId}/tasks`);
    const toColRef = collection(firestore, `kanban-columns/${toColId}/tasks`);
    
    const newOrder = (columns?.find(c => c.id === toColId)?.tasks.length || 0);
    const { id, ...taskData } = task;

    const batch = writeBatch(firestore);
    batch.delete(doc(fromColRef, id));
    batch.set(doc(toColRef, id), { ...taskData, order: newOrder });
    
    try {
      await batch.commit();
      toast({ title: "Task Moved", description: `"${task.content}" moved successfully.` });
    } catch (error) {
      console.error("Error moving task:", error);
      toast({ title: "Error", description: "Could not move the task.", variant: "destructive" });
    }
    handleDragEnd();
  };
  
  const handleAddTask = (columnId: string) => {
    const content = newTaskContent[columnId]?.trim();
    if (!content) { toast({ title: "Task content is empty", variant: "destructive" }); return; }
    const order = columns?.find(c => c.id === columnId)?.tasks.length || 0;
    const taskColRef = collection(firestore, `kanban-columns/${columnId}/tasks`);
    addDocumentNonBlocking(taskColRef, { content, order, createdAt: serverTimestamp(), category: categories?.[0]?.id || 'feature' });
    setNewTaskContent(prev => ({ ...prev, [columnId]: '' }));
    setAddingTaskTo(null);
  };
  
  const handleUpdateTask = () => {
    if(!editingTask) return;
    const { colId, id, ...taskData } = editingTask;
    // Firestore does not like undefined values
    const cleanTaskData = Object.fromEntries(Object.entries(taskData).filter(([_, v]) => v !== undefined));
    const taskDocRef = doc(firestore, `kanban-columns/${colId}/tasks/${id}`);
    updateDocumentNonBlocking(taskDocRef, cleanTaskData);
    toast({ title: "Task Updated" });
    setEditingTask(null);
  }

  const handleDeleteTask = (taskId: string, columnId: string) => {
    const taskDocRef = doc(firestore, `kanban-columns/${columnId}/tasks/${taskId}`);
    deleteDocumentNonBlocking(taskDocRef);
    toast({ title: "Task Deleted", variant: "destructive" });
    setEditingTask(null);
  };

  const handleAddColumn = () => {
    if(!newColumnName.trim()){ toast({ title: "Column name cannot be empty", variant: "destructive" }); return; }
    const order = columns?.length || 0;
    addDocumentNonBlocking(collection(firestore, 'kanban-columns'), { title: newColumnName, order, createdAt: serverTimestamp() });
    setNewColumnName('');
    setIsAddingColumn(false);
  };
  
  const handleRenameColumn = () => {
    if(!isRenamingCol || !isRenamingCol.name.trim()) { toast({ title: "Column name cannot be empty", variant: "destructive" }); return; }
    const colDocRef = doc(firestore, 'kanban-columns', isRenamingCol.id);
    updateDocumentNonBlocking(colDocRef, { title: isRenamingCol.name });
    setIsRenamingCol(null);
  }

  const handleDeleteColumn = (columnId: string) => {
    const colDocRef = doc(firestore, 'kanban-columns', columnId);
    // Note: This does not delete subcollections in Firestore. For a production app, a cloud function would be needed.
    deleteDocumentNonBlocking(colDocRef);
    toast({ title: "Column Deleted", variant: "destructive" });
  }

  const handleAddCategory = () => {
    if(!newCategoryLabel.trim()){ toast({ title: "Category label cannot be empty", variant: "destructive" }); return; }
    addDocumentNonBlocking(collection(firestore, 'kanban-categories'), { label: newCategoryLabel, color: newCategoryColor });
    setNewCategoryLabel('');
    setNewCategoryColor('#808080');
  }

  const handleDeleteCategory = (categoryId: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'kanban-categories', categoryId));
  }

  // --- RENDER ---

  if (isLoadingColumns || isLoadingTasks) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Projects...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
       <div className="flex justify-end mb-4">
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
            </Button>
        </div>
      <ScrollArea className="flex-grow w-full" orientation="horizontal">
        <div className="flex gap-6 pb-4 h-full items-start">
          {columns?.map(column => (
            <Card
              key={column.id}
              className={cn("w-80 flex-shrink-0 flex flex-col max-h-full bg-muted/40", dragOverCol === column.id && "ring-2 ring-primary")}
              onDragOver={(e) => handleDragOver(e, column.id)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, column.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-lg text-foreground">{column.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-5 w-5"/></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setIsRenamingCol({id: column.id, name: column.title})}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteColumn(column.id)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <ScrollArea className="flex-grow">
                <CardContent className="p-3 space-y-3">
                  {column.tasks?.map(task => {
                    const assignee = mockTeam.find(m => m.uid === task.assignedTo);
                    const category = categories?.find(c => c.id === task.category);
                    return (
                        <Card
                            key={task.id} draggable onDragStart={(e) => handleDragStart(e, task, column.id)} onDragEnd={handleDragEnd}
                            className={cn("p-3 shadow-sm border bg-card cursor-grab active:cursor-grabbing", draggedItem?.task.id === task.id && 'opacity-50')}
                            onClick={() => setEditingTask({...task, colId: column.id})}
                        >
                            {category && <Badge className="text-xs mb-2 text-white" style={{backgroundColor: category.color}}>{category.label}</Badge>}
                            <p className="text-sm text-foreground mb-2">{task.content}</p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    {task.timeEstimate && <div className="flex items-center gap-1"><Clock className="h-3 w-3"/><span>{task.timeEstimate}h</span></div>}
                                    {task.dueDate && <div className="flex items-center gap-1"><CalendarIcon className="h-3 w-3"/><span>{format(task.dueDate.toDate(), 'MMM d')}</span></div>}
                                </div>
                                {assignee && (
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={assignee.avatar} alt={assignee.name}/>
                                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </Card>
                    )
                  })}
                  {dragOverCol === column.id && draggedItem && draggedItem.fromColId !== column.id && (
                    <div className="h-24 rounded-lg bg-primary/10 border-2 border-dashed border-primary"/>
                  )}
                </CardContent>
              </ScrollArea>
              <div className="p-3 border-t">
                {addingTaskTo === column.id ? (
                  <div className="space-y-2">
                    <Textarea placeholder="Enter a title for this card..." value={newTaskContent[column.id] || ''} onChange={e => setNewTaskContent(prev => ({ ...prev, [column.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddTask(column.id))} autoFocus />
                    <div className="flex items-center gap-2"><Button onClick={() => handleAddTask(column.id)}>Add card</Button><Button variant="ghost" size="icon" onClick={() => setAddingTaskTo(null)}><X className="h-4 w-4"/></Button></div>
                  </div>
                ) : ( <Button variant="ghost" className="w-full justify-start" onClick={() => setAddingTaskTo(column.id)}><Plus className="mr-2 h-4 w-4" /> Add a card</Button> )}
              </div>
            </Card>
          ))}
          <div className="w-80 flex-shrink-0">
              {isAddingColumn ? (
                <div className="p-2 bg-muted/60 rounded-lg space-y-2">
                  <Input placeholder="Enter column title..." value={newColumnName} onChange={e => setNewColumnName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddColumn()} autoFocus />
                  <div className="flex items-center gap-2"><Button onClick={handleAddColumn}>Add column</Button><Button variant="ghost" size="icon" onClick={() => setIsAddingColumn(false)}><X className="h-4 w-4"/></Button></div>
                </div>
              ) : ( <Button variant="ghost" className="w-full justify-start bg-primary/10 hover:bg-primary/20" onClick={() => setIsAddingColumn(true)}><Plus className="mr-2 h-4 w-4" /> Add another column</Button> )}
          </div>
        </div>
      </ScrollArea>
      
      {isRenamingCol && (
          <Dialog open={!!isRenamingCol} onOpenChange={() => setIsRenamingCol(null)}>
            <DialogContent><DialogHeader><DialogTitle>Rename Column</DialogTitle></DialogHeader>
                <Input defaultValue={isRenamingCol.name} onChange={e => setIsRenamingCol({...isRenamingCol, name: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleRenameColumn()}/>
                <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleRenameColumn}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      {editingTask && (
          <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea value={editingTask.content} onChange={e => setEditingTask({...editingTask, content: e.target.value})} autoFocus className="col-span-full" />
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <Label>Assignee</Label>
                          <Select value={editingTask.assignedTo} onValueChange={(uid) => setEditingTask({...editingTask, assignedTo: uid})}>
                              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                              <SelectContent>
                                {mockTeam.map(user => <SelectItem key={user.uid} value={user.uid}>{user.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div>
                          <Label>Category</Label>
                           <Select value={editingTask.category} onValueChange={(cat) => setEditingTask({...editingTask, category: cat as any})}>
                              <SelectTrigger><SelectValue placeholder="Select category"/></SelectTrigger>
                              <SelectContent>
                                {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                       <div>
                          <Label>Time Estimate (h)</Label>
                          <Input type="number" value={editingTask.timeEstimate || ''} onChange={e => setEditingTask({...editingTask, timeEstimate: parseInt(e.target.value) || undefined})} />
                      </div>
                      <div>
                          <Label>Due Date</Label>
                          <Popover>
                              <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editingTask.dueDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{editingTask.dueDate ? format(editingTask.dueDate.toDate(), 'PPP') : <span>Pick a date</span>}</Button></PopoverTrigger>
                              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editingTask.dueDate?.toDate()} onSelect={(date) => setEditingTask({...editingTask, dueDate: date ? Timestamp.fromDate(date) : undefined})} initialFocus /></PopoverContent>
                          </Popover>
                      </div>
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" className="mr-auto text-destructive hover:text-destructive" onClick={() => handleDeleteTask(editingTask.id, editingTask.colId)}><Trash2 className="mr-2 h-4 w-4"/>Delete Task</Button>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateTask}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Board Settings</DialogTitle></DialogHeader>
            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="categories"><Palette className="mr-2 h-4 w-4"/>Manage Categories</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="mt-4">
                   <div className="space-y-2">
                       <Label>Current Categories</Label>
                       <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                           {isLoadingCategories ? <Loader2 className="animate-spin"/> : categories?.map(cat => (
                               <div key={cat.id} className="flex items-center justify-between p-1 rounded bg-muted/50">
                                   <div className="flex items-center gap-2">
                                       <div className="h-4 w-4 rounded-full" style={{backgroundColor: cat.color}}/>
                                       <span>{cat.label}</span>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                               </div>
                           ))}
                       </div>
                   </div>
                   <div className="mt-4 space-y-2">
                       <Label>Add New Category</Label>
                       <div className="flex gap-2">
                           <Input placeholder="Category label" value={newCategoryLabel} onChange={e => setNewCategoryLabel(e.target.value)}/>
                           <Input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-16 p-1"/>
                           <Button onClick={handleAddCategory}>Add</Button>
                       </div>
                   </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
      </Dialog>

    </div>
  );
};
export default KanbanBoard;
