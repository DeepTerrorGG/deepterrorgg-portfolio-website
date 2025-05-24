
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SectionContainer from '@/components/ui/section-container';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <SectionContainer className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <AlertTriangle className="w-16 h-16 text-primary mb-4" aria-hidden="true" />
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/">Go Back to Homepage</Link>
      </Button>
    </SectionContainer>
  );
}
