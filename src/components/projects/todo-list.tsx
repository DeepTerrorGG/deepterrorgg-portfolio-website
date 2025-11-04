// src/components/projects/todo-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load tasks from local storage on initial render
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todo-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
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
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
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
    };
    setTasks([...tasks, newTask]);
    setInput('');
    toast({
      title: 'Task Added',
      description: `"${input}" has been added to your list.`,
    });
  };

  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
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
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editingText } : task
      )
    );
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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto shadow-2xl">
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
          <ScrollArea className="h-[40vh] border rounded-md p-2">
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map(task => (
                  <li
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md transition-colors",
                      task.completed ? 'bg-muted/50' : 'bg-card'
                    )}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
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
                    <div className="flex gap-1">
                      {editingTaskId === task.id ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(task.id)}
                          aria-label="Save task"
                          className="h-8 w-8"
                        >
                          <Save className="h-4 w-4 text-primary" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                          aria-label="Edit task"
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="Delete task"
                        className="h-8 w-8"
                      >
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
