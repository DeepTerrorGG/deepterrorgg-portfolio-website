'use client';

import React, { type ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PreloadingLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

/**
 * A custom Link component that aggressively preloads the destination page on mouse hover.
 * This can make navigation feel instantaneous for users.
 */
export default function PreloadingLink({
  children,
  href,
  className,
  ...props
}: PreloadingLinkProps) {
  const router = useRouter();

  const handleMouseEnter = () => {
    // useRouter().prefetch() is the imperative API for preloading a route
    router.prefetch(href.toString());
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
}
