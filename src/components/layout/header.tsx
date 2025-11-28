
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Wifi } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import PreloadingLink from '@/components/ui/preloading-link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/startup', label: 'Startup' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai', label: 'AI' },
  { href: '/cms', label: 'CMS' },
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact' },
];


export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [hoveredPath, setHoveredPath] = useState(pathname);

  useEffect(() => {
    setHoveredPath(pathname);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          
          {/* Logo */}
          <PreloadingLink href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            
            <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              DeepTerrorGG
            </span>
          </PreloadingLink>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-1 p-1 rounded-full">
            {navLinks.map((link) => (
              <PreloadingLink
                key={link.href}
                href={link.href}
                onMouseOver={() => setHoveredPath(link.href)}
                onMouseLeave={() => setHoveredPath(pathname)}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-300 hover:text-foreground',
                  pathname === link.href && 'text-foreground'
                )}
              >
                {link.label}
                 {link.href === hoveredPath && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-full w-full bg-muted rounded-full -z-10"
                    layoutId="navbar"
                    aria-hidden="true"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </PreloadingLink>
            ))}
          </nav>

          {/* Mobile Navigation - Burger menu */}
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
                     <PreloadingLink href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="text-lg font-bold text-foreground">
                        Navigation
                      </span>
                    </PreloadingLink>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <nav className="flex-grow p-6 space-y-2">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <PreloadingLink
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
                        </PreloadingLink>
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
