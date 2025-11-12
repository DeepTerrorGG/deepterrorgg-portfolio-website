// src/components/projects/todo-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Save, Calendar as CalendarIcon, GripVertical, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
}

const priorityConfig = {
  high: { label: 'High', color: 'border-red-500' },
  medium: { label: 'Medium', color: 'border-yellow-500' },
  low: { label: 'Low', color: 'border-blue-500' },
};

const TodoList: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load tasks from local storage on initial render
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todo-tasks-v2');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks, (key, value) => {
          if (key === 'dueDate' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        });
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Failed to parse tasks from localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not load saved tasks.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('todo-tasks-v2', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not save tasks.',
        variant: 'destructive',
      });
    }
  }, [tasks, toast]);

  const handleAddTask = () => {
    if (input.trim() === '') {
      toast({
        title: 'Empty Task',
        description: 'Please enter some text for your task.',
        variant: 'destructive',
      });
      return;
    }
    const newTask: Task = {
      id: Date.now(),
      text: input,
      completed: false,
      priority: 'medium',
    };
    setTasks([...tasks, newTask]);
    setInput('');
    toast({
      title: 'Task Added',
      description: `"${input}" has been added to your list.`,
    });
  };

  const handleUpdateTask = (id: number, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };
  
  const handleDeleteTask = (id: number) => {
    const taskToDelete = tasks.find(task => task.id === id);
    setTasks(tasks.filter(task => task.id !== id));
    if (taskToDelete) {
      toast({
        title: 'Task Deleted',
        description: `"${taskToDelete.text}" has been removed.`,
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const handleSaveEdit = (id: number) => {
    if (editingText.trim() === '') {
      toast({
        title: 'Empty Task',
        description: 'Task text cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    handleUpdateTask(id, { text: editingText });
    setEditingTaskId(null);
    setEditingText('');
    toast({
      title: 'Task Updated',
      description: 'Your task has been successfully updated.',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (editingTaskId !== null) {
        handleSaveEdit(editingTaskId);
      } else {
        handleAddTask();
      }
    }
  };
  
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0; // Keep original order for same-completed status
    });
  }, [tasks]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">My To-Do List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="flex-grow"
              aria-label="New task input"
            />
            <Button onClick={handleAddTask} aria-label="Add Task">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[50vh] border rounded-md">
            {tasks.length > 0 ? (
              <ul className="p-2 space-y-2">
                {sortedTasks.map(task => (
                  <li
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors border-l-4",
                      task.completed ? 'bg-muted/30' : 'bg-card',
                      priorityConfig[task.priority].color
                    )}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleUpdateTask(task.id, { completed: !task.completed })}
                      aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <div className='flex-grow'>
                      {editingTaskId === task.id ? (
                        <Input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          onBlur={() => handleSaveEdit(task.id)}
                          autoFocus
                          className="flex-grow h-8"
                          aria-label="Edit task input"
                        />
                      ) : (
                        <label
                          htmlFor={`task-${task.id}`}
                          className={cn(
                            "flex-grow cursor-pointer",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.text}
                        </label>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{format(task.dueDate, 'PPp')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><CalendarIcon className="h-4 w-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={task.dueDate}
                            onSelect={(date) => handleUpdateTask(task.id, { dueDate: date })}
                            initialFocus
                          />
                           <div className="p-2 border-t">
                            <Input type="time"
                              defaultValue={task.dueDate ? format(task.dueDate, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newDate = task.dueDate || new Date();
                                newDate.setHours(hours, minutes);
                                handleUpdateTask(task.id, { dueDate: newDate });
                              }}
                            />
                           </div>
                        </PopoverContent>
                      </Popover>

                      <Select value={task.priority} onValueChange={(p: Priority) => handleUpdateTask(task.id, { priority: p })}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>

                      {editingTaskId !== task.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} aria-label="Edit task" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} aria-label="Delete task" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks yet. Add one to get started!
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoList;
