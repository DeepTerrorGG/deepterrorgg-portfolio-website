// src/app/opensource/page.tsx
'use client';

import React from 'react';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Star, Code, ArrowRight, Terminal } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const TerminalCard = ({ project, className }: { project: typeof openSourceProjects[0], className?: string }) => (
  <motion.div variants={itemVariants} className={cn("group h-full", className)}>
    <Card className="bg-[#050505] border-[#1f1f1f] text-[#a0a0a0] font-mono shadow-xl transition-all duration-500 h-full flex flex-col hover:border-[#333333] hover:shadow-2xl hover:shadow-black overflow-hidden relative">

      {/* Subtle top glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#444] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Terminal Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b border-[#1f1f1f] bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-semibold text-[#888] tracking-widest uppercase">{project.name}</p>
        </div>
        <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 flex-grow relative z-10">
        <div>
          <p className="flex items-start mb-2">
            <span className="text-[#333] mr-3 select-none">~</span>
            <span className="text-[#e2e2e2] font-medium leading-relaxed">{project.description}</span>
          </p>
        </div>

        <div>
          <p className="flex items-center text-[#555] mb-3 text-sm">
            <span className="mr-2">&gt;</span>
            <span>cat README.md</span>
          </p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#222]" />
            <p className="text-[#888] text-sm leading-relaxed pl-5 py-1">
              {project.longDescription}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-4 border-t border-[#111]">
          <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-sm border border-[#1f1f1f]">
            <Code className="h-3.5 w-3.5 text-[#666]" />
            <span className="text-[#aaa]">{project.language}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 rounded-sm border border-[#1f1f1f]">
            <Star className="h-3.5 w-3.5 text-[#666]" />
            <span className="text-[#aaa]">{project.stars.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 mt-auto relative z-10">
        <Button asChild className="group/btn w-full sm:w-auto bg-[#111] border border-[#222] text-[#ccc] hover:bg-[#1a1a1a] hover:text-white hover:border-[#444] transition-all duration-300 rounded-sm">
          <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100" />
            <span className="font-mono text-xs tracking-wider">VIEW_SOURCE</span>
            <ArrowRight className="ml-2 h-3 w-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
          </Link>
        </Button>
      </CardFooter>

    </Card>
  </motion.div>
);

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-[#000] relative overflow-hidden py-12">
      {/* Subtle background noise/texture (optional, using generic radial gradient for depth) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageTitle
            subtitle="A collection of my open source projects on GitHub. Feel free to explore, contribute, or use them in your own work."
            className="mb-16"
          >
            <span className="text-white">Open</span> <span className="text-[#666]">Source</span>
          </PageTitle>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {openSourceProjects.map((project) => (
            <TerminalCard key={project.name} project={project} className={project.gridClass} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
