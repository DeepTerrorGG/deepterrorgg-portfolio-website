
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `AI Generation: ${featureName}`,
          description: `One-time payment for using the ${featureName} feature.`,
          amount: amount.toFixed(2),
        }),
      });

      if (response.status === 402) {
        const data = await response.json();
        setCharge(data);
      } else if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment charge.');
      } else {
         // This case shouldn't happen with a 402 flow, but as a fallback
        throw new Error('Unexpected response from server.');
      }

    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
      setPaymentStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // When the dialog opens, create a new charge.
  useEffect(() => {
    if (isOpen) {
      createCharge();
    }
  }, [isOpen]);

  // SIMULATION: In a real app, you'd use webhooks or polling to confirm payment.
  // Here, we'll just confirm it after they've visited the payment page.
  const handleProceedToPayment = () => {
    if (!charge?.hosted_url) return;
    window.open(charge.hosted_url, '_blank');
    // Simulate a successful payment after a delay
    setPaymentStatus('paid');
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 1500);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Generating payment invoice...</p>
        </div>
      );
    }
    
     if (paymentStatus === 'paid') {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-bold">Payment Received!</h3>
            <p className="text-muted-foreground">Your AI generation will begin shortly.</p>
        </div>
      );
    }

    if (charge) {
      return (
        <>
          <DialogDescription>
            To use the {featureName} feature, a one-time payment of ${amount.toFixed(2)} is required. Please proceed to complete the transaction with Coinbase.
          </DialogDescription>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">You will be redirected to Coinbase Commerce to complete your payment securely.</p>
          </div>
        </>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
            <p className="text-destructive text-center">Could not create a payment charge. Please ensure your API keys are configured correctly or try again later.</p>
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProceedToPayment} disabled={!charge || isLoading || paymentStatus === 'paid'}>
            Pay with Coinbase <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
