
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Wifi } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import anime from 'animejs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import PreloadingLink from '@/components/ui/preloading-link';
import { logActivity } from '@/lib/logger';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artworks', label: 'Artworks' },
  { href: '/startup', label: 'Startup' },
  { href: '/projects', label: 'Projects' },
  { href: '/ai', label: 'AI' },
  { href: '/about', label: 'About Me' },
  { href: '/contact', label: 'Contact' },
];


const AnimatedNavLink = ({ href, label, isActive }: { href: string; label: string; isActive: boolean; }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    anime.remove(e.currentTarget.querySelectorAll('.letter'));
    anime({
      targets: e.currentTarget.querySelectorAll('.letter'),
      translateY: [5, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 500,
      delay: anime.stagger(30)
    });
  };

  return (
    <PreloadingLink
      href={href}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'relative px-4 py-2 text-sm font-medium text-foreground/70 transition-colors duration-300 hover:text-foreground',
        isActive && 'text-foreground'
      )}
    >
      <span className="flex">
        {label.split('').map((letter, index) => (
          <span key={index} className="letter inline-block" style={{ whiteSpace: 'pre' }}>
            {letter}
          </span>
        ))}
      </span>
       {isActive && (
        <div
          className="absolute inset-x-2 bottom-0 h-0.5 bg-primary"
          aria-hidden="true"
        />
      )}
    </PreloadingLink>
  );
}


export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    // Log page navigation
    const pageName = navLinks.find(link => link.href === pathname)?.label || 'Page';
    if (pathname !== '/') {
        logActivity(`Navigated to ${pageName}`);
    }
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Logo */}
            <PreloadingLink href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                DeepTerrorGG
              </span>
            </PreloadingLink>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 p-1">
              {navLinks.map((link) => (
                <AnimatedNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={pathname === link.href}
                />
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
                              'block px-4 py-3 rounded-md text-lg font-medium transition-colors',
                              pathname === link.href
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {link.label}
                          </PreloadingLink>
                        </SheetClose>
                      ))}
                    </nav>
                     <div className="p-6 border-t border-border mt-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} DeepTerrorGG</span>
                            <div className="flex items-center gap-1 text-green-400">
                                <Wifi className="h-4 w-4" />
                                <span className="text-xs">Online</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
  );
}
