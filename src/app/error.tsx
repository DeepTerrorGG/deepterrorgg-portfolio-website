'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                An unexpected error has occurred. We apologize for the inconvenience.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go Home
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
            {error.digest && (
                <p className="mt-8 text-xs text-muted-foreground font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
