
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Trash2, Clock } from 'lucide-react';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import * as CryptoJS from 'crypto-js';

export interface TimeCapsule {
  id: string;
  encryptedMessage: string;
  unlockDate: Date;
  // `uid` might not be on the client-side object, but is essential for rules
}

interface CapsuleCardProps {
  capsule: TimeCapsule;
  onDelete: (id: string) => void;
}

export const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onDelete }) => {
  const { toast } = useToast();
  const [isLocked, setIsLocked] = useState(new Date() < capsule.unlockDate);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [password, setPassword] = useState('');

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

  const handleDecrypt = () => {
    if (!password) {
      toast({ title: "Password required", variant: "destructive" });
      return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(capsule.encryptedMessage, password);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (!originalText) {
        throw new Error("Decryption failed. Invalid password or corrupted data.");
      }
      setDecryptedMessage(originalText);
    } catch (e) {
      toast({ title: "Decryption Failed", description: (e as Error).message, variant: "destructive" });
    }
  };


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
        ) : decryptedMessage ? (
           <p className="text-lg italic">"{decryptedMessage}"</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">Enter password to decrypt message:</p>
            <div className="flex gap-2">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDecrypt()} />
              <Button onClick={handleDecrypt}>Decrypt</Button>
            </div>
          </div>
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
