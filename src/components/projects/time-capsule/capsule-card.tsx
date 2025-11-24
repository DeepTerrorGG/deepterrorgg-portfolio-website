
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Trash2, Clock } from 'lucide-react';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface TimeCapsule {
  id: string;
  message: string;
  unlockDate: Date;
}

interface CapsuleCardProps {
  capsule: TimeCapsule;
  onDelete: (id: string) => void;
}

export const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onDelete }) => {
  const [isLocked, setIsLocked] = useState(new Date() < capsule.unlockDate);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!isLocked) {
      setTimeRemaining('Unlocked!');
      return;
    }

    const interval = setInterval(() => {
      const remaining = differenceInSeconds(capsule.unlockDate, new Date());
      if (remaining <= 0) {
        setIsLocked(false);
        setTimeRemaining('Unlocked!');
        clearInterval(interval);
      } else {
        setTimeRemaining(formatDistanceToNow(capsule.unlockDate, { addSuffix: true }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [capsule.unlockDate, isLocked]);

  return (
    <Card className={cn(
        "flex flex-col relative overflow-hidden transition-all",
        isLocked ? "border-primary/20 bg-muted/30" : "bg-card"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isLocked ? <Lock className="text-primary h-4 w-4" /> : <Unlock className="text-green-400 h-4 w-4" />}
          Time Capsule
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-6 text-center">
        {isLocked ? (
          <div className="flex flex-col items-center gap-2 backdrop-blur-sm p-4 rounded-lg">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="font-semibold text-lg">LOCKED</p>
            <p className="text-sm text-muted-foreground">Unlocks {timeRemaining}</p>
          </div>
        ) : (
          <p className="text-lg italic">"{capsule.message}"</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end p-2 border-t">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this time capsule. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(capsule.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
