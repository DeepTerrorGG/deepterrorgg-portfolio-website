'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  featureName: string;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  featureName,
}) => {
  const handleBuyCredits = () => {
    // In a real app, this would redirect to a payment processor.
    // Here, we'll just simulate a successful "purchase" and close the dialog.
    window.open('https://www.x402.org/', '_blank');
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Credits Required
          </DialogTitle>
          <DialogDescription>
            {`Using the ${featureName} feature consumes AI credits. Please purchase a credit pack to continue.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-4xl font-bold">$5.00</p>
          <p className="text-muted-foreground">for 100 AI Credits</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBuyCredits}>
            Buy Credits <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
