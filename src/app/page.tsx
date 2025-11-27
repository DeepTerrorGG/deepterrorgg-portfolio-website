
'use client';

import Link from 'next/link';
import Image from 'next/image';
import SectionContainer from '@/components/ui/section-container';
import { motion } from 'framer-motion';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, User, ArrowUp, Compass, Monitor } from 'lucide-react';
import ProjectShowcase from '@/components/home/project-showcase';
import SplineShowcase from '@/components/home/spline-showcase';
import type { Spline } from '@splinetool/react-spline';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';


const CodeEditor = dynamic(() => import('@/components/projects/code-editor'), { ssr: false });
const CollaborativeWhiteboard = dynamic(() => import('@/components/projects/collaborative-whiteboard'), { ssr: false });
const DeckBuildingRoguelike = dynamic(() => import('@/components/projects/deck-building-roguelike'), { ssr: false });
const GitHistoryVisualizer = dynamic(() => import('@/components/projects/githistory-visualizer'), { ssr: false });
const KanbanBoard = dynamic(() => import('@/components/projects/kanban-board'), { ssr: false });


const SplineModel = dynamic(
  () => import('@/components/home/spline-model'),
  { 
    ssr: false,
    loading: () => <div className="bg-muted/20 w-full h-full min-h-[500px]" />,
  }
);


const featuredProjects = [
    {
      id: 'code-editor',
      title: 'AI Coding Assistant',
      description: 'A code editor with an integrated AI assistant that can explain, refactor, and add comments to your code. A powerful tool demonstrating the future of software development.',
      component: <CodeEditor />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
        { name: 'Monaco Editor', iconSrc: '/icons/vscode.svg' },
      ],
    },
    {
      id: 'collaborative-whiteboard',
      title: 'Real-Time Collaborative Whiteboard',
      description: 'A shared digital canvas where users can draw in real-time. A complex project combining data synchronization with a custom HTML canvas rendering engine.',
      component: <CollaborativeWhiteboard />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
    },
    {
      id: 'deck-building-roguelike',
      title: 'Deck-Builder Adventure',
      description: 'A single-player card game where you build a powerful deck to battle through a procedurally generated map. A huge challenge in system and game design.',
      component: <DeckBuildingRoguelike />,
       technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
      ],
    },
     {
      id: 'githistory-visualizer',
      title: 'Git History Visualizer',
      description: 'An animated visualization that plays back a project\'s commit history, showing files as an evolving, galaxy-like node graph using D3.js.',
      component: <GitHistoryVisualizer />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'D3.js', iconSrc: '/icons/d3.svg' },
        { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
      ],
    },
    {
      id: 'kanban-board',
      title: 'Project Management Board',
      description: 'A Trello-like board with draggable cards to manage tasks. A fantastic exercise in complex state management, real-time updates, and user interaction.',
      component: <KanbanBoard />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'dnd-kit', iconSrc: '/icons/dnd-kit.svg' },
      ],
    },
];

const technologies = [
  { name: 'Next.js', href: 'https://nextjs.org/', iconSrc: '/icons/nextjs.svg' },
  { name: 'React', href: 'https://react.dev/', iconSrc: '/icons/react.svg' },
  { name: 'TypeScript', href: 'https://www.typescriptlang.org/', iconSrc: '/icons/typescript.svg' },
  { name: 'Node.js', href: 'https://nodejs.org/', iconSrc: '/icons/nodejs.svg' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com/', iconSrc: '/icons/tailwindcss.svg' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com/', iconSrc: '/icons/shadcn.svg' },
  { name: 'Framer Motion', href: 'https://www.framer.com/motion/', iconSrc: '/icons/framer.svg' },
  { name: 'Lucide Icons', href: 'https://lucide.dev/', iconSrc: '/icons/lucide.svg' },
  { name: 'React Hook Form', href: 'https://react-hook-form.com/', iconSrc: '/icons/react-hook-form.svg' },
  { name: 'Zod', href: 'https://zod.dev/', iconSrc: '/icons/zod.svg' },
  { name: 'dnd-kit', href: 'https://dndkit.com/', iconSrc: '/icons/dnd-kit.svg' },
  { name: 'Recharts', href: 'https://recharts.org/', iconSrc: '/icons/recharts.svg' },
  { name: 'D3.js', href: 'https://d3js.org/', iconSrc: '/icons/d3.svg' },
  { name: 'Genkit', href: 'https://firebase.google.com/docs/genkit', iconSrc: '/icons/genkit.svg' },
  { name: 'Google Gemini', href: 'https://deepmind.google.com/technologies/gemini/', iconSrc: '/icons/gemini.svg' },
  { name: 'Firebase', href: 'https://firebase.google.com/', iconSrc: '/icons/firebase.svg' },
  { name: 'NextAuth.js', href: 'https://next-auth.js.org/', iconSrc: '/icons/nextauth.svg' },
  { name: 'Resend', href: 'https://resend.com/', iconSrc: '/icons/resend.svg' },
  { name: 'Vercel', href: 'https://vercel.com/', iconSrc: '/icons/vercel.svg' },
  { name: '@vercel/og', href: 'https://vercel.com/docs/functions/edge-functions/og-image-generation', iconSrc: '/icons/vercel.svg' },
  { name: 'date-fns', href: 'https://date-fns.org/', iconSrc: '/icons/date-fns.svg' },
  { name: 'Spline', href: 'https://spline.design/', iconSrc: '/icons/spline.svg' },
  { name: 'Monaco Editor', href: 'https://microsoft.github.io/monaco-editor/', iconSrc: '/icons/vscode.svg' },
  { name: 'TanStack Table', href: 'https://tanstack.com/table/v8', iconSrc: '/icons/react-query.svg' },
];

const splineModels = [
    { url: 'https://prod.spline.design/FfjWOhoEErL5Sia2/scene.splinecode', title: 'Cyberpunk Room' },
    { url: 'https://prod.spline.design/Oy8cFTtrLNL36Qll/scene.splinecode', title: 'Cozy Living Room' },
    { url: 'https://prod.spline.design/qC2WtYn7OhOcS8L0/scene.splinecode', title: 'Abstract Shapes' },
    { url: 'https://prod.spline.design/3SU82luCTBxFgmZk/scene.splinecode', title: 'Gaming Setup' },
    { url: 'https://prod.spline.design/o9RKr9qFSINlT6QX/scene.splinecode', title: 'Floating Orb' },
    { url: 'https://prod.spline.design/PpzeXZ2jGbRYbcYD/scene.splinecode', title: 'Magic Crystal' },
    { url: 'https://prod.spline.design/aHUMGNLXv2zxvysr/scene.splinecode', title: 'Voxel World' },
    { url: 'https://prod.spline.design/eAZWQJSADsfRaSlh/scene.splinecode', title: 'Retro Computer' },
];

const ScrollingTechRow = ({ items, direction = 'left' }: { items: typeof technologies, direction?: 'left' | 'right' }) => (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scrolling-${direction}`}>
            {items.map((tech) => (
            <li key={tech.name} className="flex-shrink-0">
                <Link href={tech.href} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-12">
                    <Image src={tech.iconSrc} alt={tech.name} fill sizes="48px" className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                </Link>
            </li>
            ))}
        </ul>
        <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scrolling-${direction}`} aria-hidden="true">
            {items.map((tech) => (
            <li key={tech.name + '-clone'} className="flex-shrink-0">
                 <Link href={tech.href} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-12">
                    <Image src={tech.iconSrc} alt={tech.name} fill sizes="48px" className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                </Link>
            </li>
            ))}
        </ul>
  </div>
);


export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const footerLinks = [
    { name: 'Contact', icon: <Mail className="h-5 w-5" />, href: '/contact' },
    { name: 'About', icon: <User className="h-5 w-5" />, href: '/about' },
    { name: 'Back to Top', icon: <ArrowUp className="h-5 w-5" />, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];

  function onSplineLoad(spline: Spline) {
    const obj = spline.findObjectByName('Gameboy');
    if (obj) {
      // Start the animation by name
      spline.emitEvent('mouseDown', obj.name);
    }
  }
  
  return (
    <>
      <div className="flex flex-col flex-grow bg-background">
        {/* Hero Section */}
        <AnimateOnScroll className="text-center h-[calc(100vh-80px)] min-h-[700px] flex flex-col justify-center items-center bg-grid-pattern relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="z-10">
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              <Image
                src="https://i.imgur.com/TsFpBse.png"
                alt="User avatar"
                width={160}
                height={160}
                className="rounded-full border-4 border-primary shadow-xl object-cover mx-auto filter saturate-125"
                data-ai-hint="avatar illustration"
                priority
              />
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              AI/Software Engineer
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
            >
              Exploring the intersection of code, emotion, and imagination. I build web applications and create digital art that tells a story.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              <Button asChild size="lg">
                <Link href="/projects">
                  View My Work <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  Get In Touch <Mail className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </AnimateOnScroll>
        
        {/* Featured Projects Section */}
        <SectionContainer id="featured-work" className="!py-24 md:!py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Projects</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">A curated selection of my projects, showcasing a blend of technical skill and creative vision.</p>
          </div>
          <ProjectShowcase projects={featuredProjects} />
        </SectionContainer>
        
        {/* Call to Action Section */}
        <SectionContainer id="contact-cta" className="!pt-0">
          <div className="text-center p-8 md:p-12">
             <h2 className="text-3xl md:text-4xl font-bold text-primary">Have a Project in Mind?</h2>
             <p className="text-muted-foreground mt-3 max-w-xl mx-auto">I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Let's create something amazing together.</p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/contact">
                  Contact Me <Mail className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          </div>
        </SectionContainer>

         {/* Skills Section */}
        <SectionContainer id="skills">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Skills & Expertise</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">The tools and technologies I use to bring ideas to life.</p>
          </div>
          <div className="space-y-8">
              <ScrollingTechRow items={technologies.slice(0, Math.ceil(technologies.length / 2))} />
              <ScrollingTechRow items={technologies.slice(Math.ceil(technologies.length / 2))} direction="right" />
          </div>
          <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link href="/about">
                  View All Skills <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </SectionContainer>

        {/* 3D Model Showcase */}
         <SectionContainer id="spline-showcase">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">3D Model Showcase</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">A collection of my 3D creations. Use the arrows to navigate.</p>
          </div>
          {isMounted && (
            <div className="hidden md:block">
              <SplineShowcase models={splineModels} />
            </div>
          )}
          <div className="block md:hidden">
            <Card className="border-border bg-card">
              <CardContent className="p-6 text-center">
                <Monitor className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground">3D Showcase Available on Desktop</h3>
                <p className="text-muted-foreground mt-2">
                  This interactive 3D model showcase is best experienced on a larger screen. Please view this page on a desktop or laptop to explore the models.
                </p>
              </CardContent>
            </Card>
          </div>
        </SectionContainer>
      </div>
      <footer className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">You've reached the edge of this world.</h2>
          <p className="text-muted-foreground mb-8">What will you do now?</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ArrowUp className="mr-2 h-4 w-4" /> Return to Top
            </Button>
            <Button asChild>
              <Link href="/projects">
                <Compass className="mr-2 h-4 w-4" /> Explore More
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-12">
            &copy; {new Date().getFullYear()} DeepTerrorGG. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

    

    




    