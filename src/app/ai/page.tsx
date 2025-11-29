
// src/app/ai/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageTitle from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { TechStack } from '@/components/ui/tech-stack';
import { ExternalLink, Rocket, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { logActivity } from '@/lib/logger';

// Statically import all project components
import AIVideoGenerator from '@/components/projects/ai-video-generator';
import AIChatbot from '@/components/projects/ai-chatbot';
import AIStoryGenerator from '@/components/projects/ai-story-generator';
import AIRecipeGenerator from '@/components/projects/ai-recipe-generator';
import AIImageGenerator from '@/components/projects/ai-image-generator';
import CodeEditor from '@/components/projects/code-editor';
import ThePasswordGame from '@/components/projects/the-password-game';
import AIInfinityCraft from '@/components/projects/ai-infinity-craft';
import AIPromptEnhancer from '@/components/projects/ai-prompt-enhancer';
import CodeBeautifier from '@/components/projects/code-beautifier';

interface Technology {
  name: string;
  iconSrc: string;
  href?: string;
}

interface Project {
  id: string;
  title: string;
  imageUrls: string[];
  imageAlt: string;
  imageHint: string;
  description: string;
  longDescription?: string;
  personalNote: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'AI' | 'Community' | 'Meme';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const projectsData: Project[] = [
    {
      id: 'code-beautifier',
      title: 'Code Beautifier',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'Code beautifier app for creating images of code',
      imageHint: 'code snippet image generator',
      description: 'Turn your code snippets into beautiful, shareable images.',
      personalNote: 'I\'ve always admired tools like Carbon that make sharing code on social media look great. This was my take on it, using a Next.js API route with @vercel/og to generate the final image from simple HTML.',
      difficulty: 'AI',
      component: <CodeBeautifier />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: '@vercel/og', iconSrc: '/icons/vercel.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-prompt-enhancer',
      title: 'AI Prompt Enhancer',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'AI prompt enhancer interface',
      imageHint: 'ai prompt engineering tool',
      description: 'An AI-powered tool to take your basic ideas and transform them into detailed, effective prompts for large language models.',
      personalNote: 'Crafting good prompts is an art. This tool is designed to help with that process by leveraging an AI to think about the details you might miss. It was a fun meta-project—using AI to help users use AI better!',
      difficulty: 'AI',
      component: <AIPromptEnhancer />,
      technologies: [
          { name: 'React', iconSrc: '/icons/react.svg' },
          { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
          { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-infinity-craft',
      title: 'AI Infinity Craft',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'AI Infinity Craft game interface',
      imageHint: 'crafting game alchemy',
      description: 'A creative crafting game where you combine elements to discover new ones, powered by AI.',
      personalNote: 'This project was a fascinating exploration into using AI for emergent gameplay. The AI acts as the "game engine" for discovery, leading to surprising and creative combinations. It shows how generative AI can create truly dynamic and unpredictable experiences.',
      difficulty: 'AI',
      component: <AIInfinityCraft />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-password-game',
      title: 'The AI Password Game',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'AI Password Game interface',
      imageHint: 'password game security',
      description: 'A game where you must create a password that follows an increasingly absurd set of rules, some generated by an AI.',
      personalNote: 'This was an incredibly fun project that combines complex validation logic with creative AI. It shows how AI can be used to make even a simple concept like a password field into something unpredictable and entertaining.',
      difficulty: 'AI',
      component: <ThePasswordGame />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-image-generator',
      title: 'AI Image Generator',
      imageUrls: ['https://i.imgur.com/3f4lJ3v.png'],
      imageAlt: 'AI Image Generator app',
      imageHint: 'ai image generator interface',
      description: 'Create unique images from text prompts using generative AI.',
      personalNote:
        "This was my first time using a text-to-image model and it was incredible to see how the AI could interpret my text prompts and turn them into art. It's a fun way to explore creativity and AI.",
      difficulty: 'AI',
      component: <AIImageGenerator />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-chatbot',
      title: 'AI Chatbot',
      imageUrls: ['https://i.imgur.com/sdJjVAd.png'],
      imageAlt: 'AI Chatbot interface',
      imageHint: 'ai chatbot interface',
      description: 'A conversational AI chatbot that remembers past interactions.',
      personalNote:
        "Building a chatbot that could hold a conversation and remember what was said earlier was a great way to learn about managing conversational state. It's a fun project that shows the power of large language models.",
      difficulty: 'AI',
      component: <AIChatbot />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-recipe-generator',
      title: 'AI Recipe Generator',
      imageUrls: ['https://i.imgur.com/cWbx8fE.png'],
      imageAlt: 'AI Recipe Generator interface',
      imageHint: 'ai recipe generator app',
      description: 'Generate creative recipes based on a list of ingredients.',
      personalNote:
        'This project combines my interests in coding and cooking. It’s amazing to see how AI can take a few ingredients and come up with a full recipe. It really shows how AI can be a tool for everyday creativity.',
      difficulty: 'AI',
      component: <AIRecipeGenerator />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-story-generator',
      title: 'AI Story Generator',
      imageUrls: ['https://i.imgur.com/1Tx3iQ9.png'],
      imageAlt: 'AI Story Generator interface',
      imageHint: 'ai story generator app',
      description: 'Create unique stories with characters and settings from your imagination.',
      personalNote:
        'I love storytelling, so building a tool that could help generate creative stories was a really fun project. It’s a great example of how AI can be used as a creative partner to spark new ideas.',
      difficulty: 'AI',
      component: <AIStoryGenerator />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'ai-video-generator',
      title: 'AI Video Generator',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'AI video generator interface',
      imageHint: 'ai video generator app',
      description: 'Generate short video clips from text prompts using the Veo model.',
      personalNote: 'This was an exciting project to explore the cutting-edge of generative AI. The process is asynchronous and can take time, which presented interesting UI/UX challenges for managing loading and progress states.',
      difficulty: 'AI',
      component: <AIVideoGenerator />,
      technologies: [
          { name: 'React', iconSrc: '/icons/react.svg' },
          { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
          { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
          { name: 'Google Veo', iconSrc: '/icons/gemini.svg'}
      ],
      renderImage: true,
    },
    {
      id: 'code-editor',
      title: 'AI Coding Assistant',
      imageUrls: ['https://i.imgur.com/y8V3eGo.png'],
      imageAlt: 'Code editor with AI assistant',
      imageHint: 'code editor ai assistant',
      description: 'A code editor with an integrated AI assistant that can explain, refactor, and add comments to your code.',
      personalNote: 'This was a challenging but very rewarding project. Integrating an AI that can understand and manipulate code really opened my eyes to the future of software development. It feels like building a tool from the future.',
      difficulty: 'AI',
      component: <CodeEditor />,
      technologies: [
          { name: 'React', iconSrc: '/icons/react.svg' },
          { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
          { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      ],
      renderImage: true,
    },
];

const difficultyOrder = {
  'AI': 1,
  'Advanced': 2,
  'Hard': 3,
  'Medium': 4,
  'Easy': 5,
  'Community': 6,
  'Meme': 7,
};

const allProjects = [...projectsData].sort((a, b) => {
  const diff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title);
});

const ProjectDetailContent = ({ project }: { project: Project }) => {
    const handleLaunchProject = (proj: Project) => {
        if (proj.externalLink) {
            window.open(proj.externalLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="p-4 sm:p-8 md:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">{project.title}</h2>
            <p className="text-muted-foreground text-lg mb-6">{project.description}</p>
            
            <div className="space-y-4 my-8">
              <h3 className="font-semibold text-xl text-primary">How It's Made</h3>
              <p className="text-muted-foreground leading-relaxed">{project.personalNote}</p>
            </div>

            <div className="mb-8">
                <h4 className="font-semibold text-xl text-primary mb-3">Technologies Used</h4>
                <TechStack technologies={project.technologies} />
            </div>

            {project.externalLink && (
                 <Button
                    onClick={() => handleLaunchProject(project)}
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </Button>
            )}
        </div>
    )
};


export default function AiProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0].id);
  const [mobileProject, setMobileProject] = useState<Project | null>(null);

  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  }, [selectedProjectId]);
  
  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-orange-400',
    'Advanced': 'text-red-400',
    'AI': 'text-purple-400',
    'Community': 'text-blue-400',
    'Meme': 'text-pink-400',
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setMobileProject(project);
    logActivity(`Viewed AI project: ${project.title}`);
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      {/* Mobile View: Full-screen list, dialog for details */}
      <div className="md:hidden flex flex-col h-full">
        <PageTitle subtitle="A selection of my AI-powered projects." className="!pt-6 !mb-6">
          AI Projects
        </PageTitle>
        <ScrollArea className="flex-grow">
          <ul className="space-y-2 p-4">
            {allProjects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => handleProjectSelect(project)}
                  className="w-full text-left p-4 rounded-lg transition-colors duration-200 bg-card border hover:bg-muted"
                >
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className={cn("text-xs font-medium", difficultyColors[project.difficulty])}>{project.difficulty}</p>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        {mobileProject && (
          <Dialog open={!!mobileProject} onOpenChange={(isOpen) => !isOpen && setMobileProject(null)}>
             <DialogContent className="p-0 sm:p-0 w-screen h-screen max-w-full max-h-full sm:max-w-full sm:max-h-full rounded-none sm:rounded-none flex flex-col" hideDefaultClose>
              <DialogHeader className="p-4 border-b flex-row items-center space-y-0 shrink-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Back</span>
                    </Button>
                  </DialogClose>
                  <DialogTitle className="flex-grow text-center pr-10">{mobileProject.title}</DialogTitle>
                  <DialogDescription className="sr-only">{mobileProject.description}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow min-h-0">
                {mobileProject.component}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Desktop View: Two-column layout */}
       <div className="hidden md:flex flex-row flex-grow h-[calc(100vh-80px)]">
        {/* Left Column: Project List */}
        <div className="w-1/3 max-w-sm border-r border-border flex flex-col h-full">
          <div className="p-6 border-b shrink-0">
            <PageTitle subtitle="A selection of my AI-powered projects." className="text-left !mb-0 !pt-0">
              AI Projects
            </PageTitle>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <ul className="space-y-1 p-4">
              {allProjects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => { setSelectedProjectId(project.id); logActivity(`Viewed AI project: ${project.title}`); }}
                    className={cn(
                      "w-full text-left p-3 rounded-md transition-colors duration-200",
                      selectedProjectId === project.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className={cn("text-xs", difficultyColors[project.difficulty])}>{project.difficulty}</p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>

        {/* Right Column: Project Details & Component */}
        <ScrollArea className="flex-1 w-2/3 h-full">
           <div className="animate-fade-in flex flex-col min-h-full">
              {/* Project Component Area */}
              <div className="flex-shrink-0 flex items-center justify-center relative bg-muted/20 border-b border-border min-h-[50vh]">
                  {selectedProject.component}
              </div>

              {/* Project Details Area */}
              <div className="flex-shrink-0 bg-card">
                  <ProjectDetailContent project={selectedProject} />
              </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
