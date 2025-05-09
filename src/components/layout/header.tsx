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
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <FlameKindling className="h-8 w-8 text-primary group-hover:animate-pulse" />
            <span className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              DeepTerrorGG
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out',
                  'hover:bg-accent hover:text-accent-foreground hover:shadow-lg',
                  pathname === link.href
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'text-foreground/80 hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
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
                      <FlameKindling className="h-7 w-7 text-primary" />
                      <span className="text-lg font-bold text-foreground">
                        DeepTerrorGG Menu
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