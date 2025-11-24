
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateCapsuleDialog } from './time-capsule/create-capsule-dialog';
import { CapsuleCard } from './time-capsule/capsule-card';
import type { TimeCapsule } from './time-capsule/capsule-card';

const TimeCapsuleProject: React.FC = () => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>(() => {
    // For demonstration, let's create some initial capsules
    const now = new Date();
    return [
      { id: '1', message: 'This is an unlocked message from the past!', unlockDate: new Date(now.getTime() - 10000) },
      { id: '2', message: 'This one unlocks in 15 seconds.', unlockDate: new Date(now.getTime() + 15000) },
      { id: '3', message: 'A secret for next year.', unlockDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()) },
    ];
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleAddCapsule = (capsule: Omit<TimeCapsule, 'id'>) => {
    setCapsules(prev => [...prev, { ...capsule, id: Date.now().toString() }]);
  };
  
  const handleDeleteCapsule = (id: string) => {
    setCapsules(prev => prev.filter(c => c.id !== id));
  };


  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-7xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Digital Time Capsule</CardTitle>
              <CardDescription>Leave a message for the future. It will be encrypted and unreadable until the unlock date.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4"/>
              Create Capsule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          {capsules.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No time capsules yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map(capsule => (
                <CapsuleCard key={capsule.id} capsule={capsule} onDelete={handleDeleteCapsule} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateCapsuleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAddCapsule={handleAddCapsule}
      />
    </div>
  );
};

export default TimeCapsuleProject;
