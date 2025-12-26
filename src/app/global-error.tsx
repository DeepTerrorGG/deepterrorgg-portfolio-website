'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button component exists

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body className="flex h-screen w-full flex-col items-center justify-center bg-black text-white px-4 text-center font-sans">
                <h2 className="text-4xl font-bold mb-4 text-red-500">Critical System Failure</h2>
                <p className="text-gray-400 mb-8 max-w-md text-lg">
                    A critical error prevented the application from loading.
                </p>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                >
                    Reload Application
                </button>
            </body>
        </html>
    );
}
