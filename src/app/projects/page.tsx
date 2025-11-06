// src/app/projects/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Button } from '@/components/ui/button';
import { TechStack } from '@/components/ui/tech-stack';
import { ExternalLink, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TodoList from '@/components/projects/todo-list';
import UnitConverter from '@/components/projects/unit-converter';
import TicTacToe from '@/components/projects/tic-tac-toe';
import Calculator3D from '@/components/projects/calculator-3d';
import SimpleTextAnimator from '@/components/projects/simple-text-animator';
import FractalRenderer from '@/components/projects/fractal-renderer';
import Chatbot from '@/components/projects/chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Community';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const projectsData: Project[] = [
    {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrls: ['https://i.imgur.com/sdJjVAd.png'],
    imageAlt: 'AI Chatbot interface',
    imageHint: 'ai chatbot interface',
    description: 'A conversational AI chatbot powered by Google\'s Gemini model through Genkit.',
    personalNote: "This was a fun project to explore the capabilities of large language models. It's built with Genkit, which makes it easy to create and manage AI flows.",
    difficulty: 'Medium',
    component: <Chatbot />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'Gemini', iconSrc: '/icons/gemini.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'todo-list',
    title: 'To-Do List App',
    imageUrls: ['https://i.imgur.com/k4DRQvj.png'],
    imageAlt: 'To-Do List App interface',
    imageHint: 'todo list interface',
    description: 'Simple CRUD app where users can add, edit, and delete tasks. Data is saved to local storage.',
    personalNote: "A classic project to practice state management and browser storage. It's a great way to understand the fundamentals of data persistence on the client-side.",
    difficulty: 'Easy',
    component: <TodoList />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'unit-converter',
    title: 'Universal Converter',
    imageUrls: ['https://i.imgur.com/4tNf4f0.png'],
    imageAlt: 'Unit Converter interface for various measurements',
    imageHint: 'converter app interface',
    description: 'A versatile tool to convert between various units like Temperature, Length, and Weight.',
    personalNote: 'A straightforward app that is excellent for understanding controlled components, state synchronization, and handling different calculation logic in a clean way.',
    difficulty: 'Easy',
    component: <UnitConverter />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'calculator',
    title: 'Interactive Calculator',
    imageUrls: ['https://i.imgur.com/cWI9lAG.png'],
    imageAlt: 'Interactive calculator interface',
    imageHint: 'calculator interface modern',
    description: 'A sleek, interactive calculator. Perform basic arithmetic operations and see large numbers in scientific notation.',
    longDescription: 'This project showcases a fully interactive calculator featuring a clean, modern interface. It supports basic arithmetic operations and formats very large or small numbers using scientific notation to maintain display integrity.',
    personalNote: "This was the lightest project I’ve done—just a basic calculator I built mostly for practice. It gave me a chance to play around with UI design and keep intrigued. Sometimes it’s nice to take a break from the deep stuff and just create something simple and clean.",
    difficulty: 'Easy',
    component: <Calculator3D />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'tic-tac-toe',
    title: 'Real-Time Multiplayer Game',
    imageUrls: ['https://i.imgur.com/3V3bO8H.png'],
    imageAlt: 'Tic-Tac-Toe multiplayer game',
    imageHint: 'tic tac toe game',
    description: 'A classic Tic-Tac-Toe game with real-time multiplayer support using Firebase.',
    personalNote: "This project was a great introduction to real-time databases and handling concurrent user interactions. It's a simple concept but has a surprising amount of depth when you factor in the networking.",
    difficulty: 'Advanced',
    component: <TicTacToe />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'text-animator',
    title: 'Simple Text Animator',
    imageUrls: ['https://i.imgur.com/bPv5f6t.png'],
    imageAlt: 'Text animation tool interface',
    imageHint: 'text animation motion graphics',
    description: 'Create simple text animations like fade in/out, blink, and typewriter effects. Preview your creations instantly.',
    longDescription: 'This tool allows you to input multiple text strings, apply various animation effects globally, and see a live preview. Choose from a list of predefined animations, adjust parameters like duration or speed.',
    personalNote: "This project is a bit more complex than the calculator, and honestly, it sounded cooler in my head when I started. It was fun to build and felt a little more purposeful, but it still ended up feeling a bit too simple for my taste. Still, it was a cool learning experience.",
    difficulty: 'Medium',
    component: <SimpleTextAnimator />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'fractal-explorer',
    title: 'Interactive Fractal Explorer',
    imageUrls: ['https://i.imgur.com/Lq50HRe.png'],
    imageAlt: 'Abstract fractal visualization',
    imageHint: 'fractal abstract math visualization',
    description: 'Dive into the infinite complexity of fractals. Explore mesmerizing patterns generated by mathematical formulas.',
    longDescription: 'This interactive tool allows you to explore the Mandelbrot set, a classic example of a fractal. You can zoom, pan, adjust iterations for detail, and switch color schemes to visualize the mathematical beauty. Higher iterations reveal more intricate patterns but require more computation.',
    personalNote: 'This one’s my favorite by far. It hits that level of complexity and uniqueness that I really enjoy. There’s something about the way fractals build beauty out of patterns and depth that just feels meaningful to me. It’s definitely not perfect, but that makes me like it even more.',
    difficulty: 'Hard',
    component: <FractalRenderer />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
];

const communityProject: Project = {
  id: 'silent-horizon',
  title: 'Silent Horizon Community Project',
  imageUrls: [
    '/sh1.jpg',
    '/sh2.jpg',
    '/sh3.jpg',
    '/sh4.jpg',
    '/sh5.jpg',
    '/sh6.jpg',
    '/sh7.jpg',
    '/sh8.jpg',
    '/sh9.jpg',
  ],
  imageAlt: 'Silent Horizon Minecraft Server',
  imageHint: 'minecraft landscape castle',
  description: 'A Balkan Minecraft server community project with Survival, Skyblock, and Prison modes. Open for everyone to join and play.',
  difficulty: 'Community',
  externalLink: 'https://silent-horizon.com/',
  personalNote: "This project challenged me in ways I didn’t expect, as it was mostly done for friends. While it's a cool project that has a lot to offer, it can also be incredibly draining. Managing a team of 10 staff members, keeping the community engaged, and rolling out regular events and updates is a huge undertaking. It was a massive learning experience in community management, but it's not where my personal passion lies.",
  technologies: [
      { name: 'Java', iconSrc: '/icons/java.svg' },
      { name: 'Pterodactyl', iconSrc: '/icons/pterodactyl.svg' },
      { name: 'MySQL', iconSrc: '/icons/mysql.svg' },
      { name: 'Docker', iconSrc: '/icons/docker.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
  ],
  renderImage: true,
};

const allProjects = [...projectsData, communityProject];

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0].id);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  }, [selectedProjectId]);

  const handleOpenModal = (project: Project) => {
    if (project.component) {
      setModalProject(project);
    } else if (project.externalLink) {
      window.open(project.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-orange-400',
    'Advanced': 'text-red-400',
    'Community': 'text-blue-400',
  };

  return (
    <>
      <SectionContainer className="!py-0 md:!py-0">
        <div className="grid grid-cols-1 md:grid-cols-12 md:h-[calc(100vh-80px)]">
          {/* Left Column: Project List */}
          <div className="md:col-span-4 lg:col-span-3 border-r border-border h-full relative">
            <ScrollArea className="h-full">
              <div className="p-6">
                <PageTitle subtitle="A selection of my creative and technical endeavors." className="text-left !mb-6">
                  My Projects
                </PageTitle>
                <ul className="space-y-1">
                  {allProjects.map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => setSelectedProjectId(project.id)}
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
              </div>
            </ScrollArea>
          </div>

          {/* Right Column: Project Details */}
          <div className="md:col-span-8 lg:col-span-9 h-full">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-8 md:p-12 animate-fade-in" key={selectedProject.id}>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 bg-card">
                  {selectedProject.renderImage ? (
                      <Image
                        src={selectedProject.imageUrls[0]}
                        alt={selectedProject.imageAlt}
                        fill
                        sizes="(max-width: 767px) 100vw, 60vw"
                        className="object-cover"
                        data-ai-hint={selectedProject.imageHint}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <h3 className="text-3xl font-bold text-muted-foreground">{selectedProject.title.replace(' App', '')}</h3>
                      </div>
                    )}
                </div>

                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold text-foreground mb-4">{selectedProject.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{selectedProject.description}</p>
                  
                  <blockquote className="border-l-4 border-primary pl-4 py-2 my-6">
                    <p className="text-muted-foreground italic">{selectedProject.personalNote}</p>
                  </blockquote>

                  <div className="mb-8">
                    <h4 className="font-semibold text-foreground mb-3">Technologies Used</h4>
                    <TechStack technologies={selectedProject.technologies} />
                  </div>
                  
                  <Button
                    onClick={() => handleOpenModal(selectedProject)}
                    className="w-full sm:w-auto"
                  >
                    {selectedProject.component ? <Rocket className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                    {selectedProject.component ? 'Launch Project' : 'Visit Site'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </SectionContainer>
      
      {modalProject && (
        <Dialog open={!!modalProject} onOpenChange={(isOpen) => !isOpen && setModalProject(null)}>
          <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{modalProject.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-auto bg-background">
              {modalProject.component}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
