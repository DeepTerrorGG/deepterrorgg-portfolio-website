
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlameKindling, Menu } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-center md:justify-center relative">
          
          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-300 hover:text-foreground',
                  'after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 after:ease-out-cubic hover:after:w-full hover:after:left-0',
                  pathname === link.href && 'text-foreground after:w-full after:left-0'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation - Burger menu remains on the right */}
          <div className="md:hidden flex-1 flex justify-end">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-border p-0 w-full max-w-xs sm:max-w-sm">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle>
                     <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <FlameKindling aria-hidden="true" className="h-7 w-7 text-primary" />
                      <span className="text-lg font-bold text-foreground">
                        Navigation
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <nav className="flex-grow p-6 space-y-2">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'block px-3 py-3 rounded-md text-base font-medium transition-colors',
                            pathname === link.href
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
