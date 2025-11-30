
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CreateCapsuleDialog } from './time-capsule/create-capsule-dialog';
import { CapsuleCard } from './time-capsule/capsule-card';
import type { TimeCapsule } from './time-capsule/capsule-card';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, Timestamp, doc } from 'firebase/firestore';

const TimeCapsuleProject: React.FC = () => {
  const firestore = useFirestore();
  
  const capsulesQuery = useMemoFirebase(
    () => {
        if (!firestore) return null;
        return query(collection(firestore, 'timeCapsules'));
    },
    [firestore]
  );
  const { data: capsulesData, isLoading: isLoadingCapsules } = useCollection<Omit<TimeCapsule, 'unlockDate'> & { unlockDate: Timestamp }>(capsulesQuery);

  const capsules: TimeCapsule[] = React.useMemo(() => {
    if (!capsulesData) return [];
    return capsulesData.map(c => ({
      ...c,
      unlockDate: c.unlockDate.toDate(),
    }));
  }, [capsulesData]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleAddCapsule = (capsule: { encryptedMessage: string; unlockDate: Date; }) => {
    if (!firestore) return;
    const capsuleColRef = collection(firestore, 'timeCapsules');
    addDocumentNonBlocking(capsuleColRef, capsule);
  };
  
  const handleDeleteCapsule = (id: string) => {
    if (!firestore) return;
    const capsuleDocRef = doc(firestore, 'timeCapsules', id);
    deleteDocumentNonBlocking(capsuleDocRef);
  };
  
  const renderContent = () => {
    if (isLoadingCapsules) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading time capsules...
            </div>
        )
    }

    if (capsules.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No time capsules yet. Create one to get started!</p>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map(capsule => (
            <CapsuleCard key={capsule.id} capsule={capsule} onDelete={handleDeleteCapsule} />
            ))}
        </div>
    )
  }

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
            {renderContent()}
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
