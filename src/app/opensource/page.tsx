'use client';

import React from 'react';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Star, Code, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';
import { cn } from '@/lib/utils';

const openSourceProjects = [
  {
    name: 'Genkit Next.js Starter',
    description: 'A production-ready starter template for building AI-powered applications with Next.js and Google\'s Genkit.',
    longDescription: 'This template provides a comprehensive starting point for developers looking to integrate Google\'s generative AI framework, Genkit, with a modern Next.js application. It includes setup for server-side flows, client-side hooks, and examples of streaming responses, structured output, and tool use, helping developers bypass boilerplate and start building features immediately.',
    repoUrl: 'https://github.com/DeepTerrorGG/genkit-nextjs-starter',
    language: 'TypeScript',
    stars: 152,
    gridClass: 'md:col-span-2 md:row-span-1'
  },
  {
    name: 'Firebase UI for React',
    description: 'A set of reusable and accessible React components for building user interfaces that interact with Firebase services.',
    longDescription: 'This project simplifies Firebase integration in React applications by providing pre-built components for authentication, Firestore data display, and file uploads. The goal is to provide a headless, customizable component library that handles the backend logic, allowing developers to focus on their application\'s unique UI/UX.',
    repoUrl: 'https://github.com/DeepTerrorGG/firebase-ui-react',
    language: 'TypeScript',
    stars: 88,
    gridClass: 'md:col-span-1 md:row-span-1'
  },
  {
    name: 'Portfolio Template',
    description: 'The very same code that powers this portfolio website. Built to be easily customizable.',
    longDescription: 'This project is a complete portfolio solution for developers and creatives. It features a modular design, easy content updates via mock data files, and a modern tech stack including Next.js, Framer Motion, and shadcn/ui. The goal is to provide a beautiful, performant, and easily-customizable template for showcasing personal projects and skills.',
    repoUrl: 'https://github.com/DeepTerrorGG/nextjs-portfolio-template',
    language: 'TypeScript',
    stars: 215,
    gridClass: 'md:col-span-1 md:row-span-1'
  },
   {
    name: 'CLI Tool Boilerplate',
    description: 'A boilerplate for creating powerful, type-safe command-line tools with Node.js and TypeScript.',
    longDescription: 'This starter kit includes argument parsing, command routing, colorized output, and automated testing setup. It helps developers quickly bootstrap a new CLI project, focusing on logic rather than setup. Includes examples for fetching data from an API and interacting with the local file system.',
    repoUrl: 'https://github.com/DeepTerrorGG/ts-cli-boilerplate',
    language: 'TypeScript',
    stars: 42,
    gridClass: 'md:col-span-2 md:row-span-1'
  },
];

const TerminalCard = ({ project, className }: { project: typeof openSourceProjects[0], className?: string }) => (
  <div className={cn("group [perspective:1000px] h-full", className)}>
    <Card className="bg-[#0d1117]/80 border-border/30 text-slate-300 font-mono shadow-2xl transition-all duration-500 h-full flex flex-col">
      {/* Terminal Header */}
      <CardHeader className="flex flex-row items-center gap-2 p-3 border-b border-border/30 bg-black/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <p className="text-sm text-slate-400 truncate">{project.name}</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4 flex-grow">
        <div>
          <p className="text-primary flex items-center">
            <span className="text-cyan-400 mr-2">~/opensource</span>
            <span className="text-yellow-400">&gt;</span>
            <span className="ml-2 text-primary font-bold">{project.name}</span>
          </p>
          <p className="text-slate-400 text-sm mt-1">{project.description}</p>
        </div>
        
        <div>
          <p className="flex items-center text-yellow-400">
            <span>&gt;</span>
            <span className="ml-2 text-slate-300">cat README.md</span>
          </p>
          <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-border/30">
            {project.longDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm pt-2">
          <div className="flex items-center gap-2">
              <span className="text-yellow-400">&gt;</span>
              <Code className="h-4 w-4 text-primary" />
              <span>{project.language}</span>
          </div>
          <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{project.stars.toLocaleString()} stars</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 mt-auto">
        <Button asChild className="group/btn w-full sm:w-auto bg-primary/10 border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" />
            ./view_on_github.sh
            <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  </div>
);

export default function OpenSourcePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      <PageTitle subtitle="A collection of my open source projects on GitHub. Feel free to explore, contribute, or use them in your own work.">
        Open Source
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {openSourceProjects.map((project, index) => (
           <AnimateOnScroll key={project.name} delay={index * 0.1} className={project.gridClass}>
            <TerminalCard project={project} className="h-full" />
           </AnimateOnScroll>
        ))}
      </div>
    </div>
  );
}
