
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { TimeCapsule } from './capsule-card';

interface CreateCapsuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCapsule: (capsule: Omit<TimeCapsule, 'id'>) => void;
}

export const CreateCapsuleDialog: React.FC<CreateCapsuleDialogProps> = ({ isOpen, onClose, onAddCapsule }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | undefined>();

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({ title: "Message is empty", variant: "destructive" });
      return;
    }
    if (!unlockDate) {
      toast({ title: "Unlock date is required", variant: "destructive" });
      return;
    }
    if (unlockDate <= new Date()) {
      toast({ title: "Date must be in the future", variant: "destructive" });
      return;
    }

    onAddCapsule({ message, unlockDate });
    onClose();
    setMessage('');
    setUnlockDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Time Capsule</DialogTitle>
          <DialogDescription>Write your message and set a future date to unlock it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A secret for my future self..."
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Unlock Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !unlockDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {unlockDate ? format(unlockDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={unlockDate}
                  onSelect={setUnlockDate}
                  initialFocus
                  disabled={(date) => date <= new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Capsule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
