
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  featureName: string;
  amount: number;
}

interface ChargeResponse {
  hosted_url: string;
  code: string;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  featureName,
  amount,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [charge, setCharge] = useState<ChargeResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending');

  const createCharge = async () => {
    setIsLoading(true);
    setPaymentStatus('pending');
    setCharge(null);
    try {
      const response = await fetch('/api/create-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Unlock: ${featureName}`,
          description: `One-time payment to access the ${featureName} feature.`,
          amount: amount.toFixed(2),
        }),
      });

      if (response.status === 402) {
        const chargeData: ChargeResponse = await response.json();
        setCharge(chargeData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create charge. Status: ${response.status}`);
      }

    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message || "Could not initiate payment process.",
        variant: 'destructive',
      });
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      createCharge();
    }
  }, [isOpen]);

  const handleProceedToPayment = () => {
    if (!charge?.hosted_url) return;
    
    // Open the actual Coinbase checkout page in a new tab
    window.open(charge.hosted_url, '_blank', 'noopener,noreferrer');
    
    // For this demo, we'll assume the payment is successful after a delay
    toast({
        title: 'Redirected to Payment',
        description: 'Once payment is complete, you can use the feature. We will simulate success in a moment.'
    });

    setPaymentStatus('paid');
    setTimeout(() => {
      onConfirm();
      onClose();
       toast({
        title: 'Payment Confirmed!',
        description: 'Your access has been granted for this session.'
      });
    }, 2500); // Wait a bit before "confirming"
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to payment service...</p>
        </div>
      );
    }
    
     if (paymentStatus === 'paid') {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-bold">Payment "Confirmed"!</h3>
            <p className="text-muted-foreground">Unlocking feature...</p>
        </div>
      );
    }

    if (charge) {
      return (
        <>
          <DialogDescription>
            To use the {featureName} feature, a one-time payment of ${amount.toFixed(2)} is required via Coinbase Commerce.
          </DialogDescription>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Click below to proceed to the secure checkout page.</p>
          </div>
        </>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
            <p className="text-destructive text-center">Could not create a payment charge. Please ensure the Coinbase API key is configured on the server and try again.</p>
        </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payment Required
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={paymentStatus === 'paid'}>
            Cancel
          </Button>
          <Button onClick={handleProceedToPayment} disabled={!charge || isLoading || paymentStatus === 'paid'}>
            <ExternalLink className="mr-2 h-4 w-4"/>
            Proceed to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
