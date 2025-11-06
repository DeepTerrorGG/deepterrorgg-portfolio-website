// src/app/projects/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FractalRenderer from '@/components/projects/fractal-renderer';
import Calculator3D from '@/components/projects/calculator-3d';
import SimpleTextAnimator from '@/components/projects/simple-text-animator';
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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Community' | 'Advanced';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const projectsData: Project[] = [
    {
    id: 'todo-list',
    title: 'To-Do List App',
    imageUrls: ['https://placehold.co/600x400/000000/808080/png?text=To-Do+List'],
    imageAlt: 'To-Do List App interface',
    imageHint: 'todo list interface',
    description: 'Simple CRUD app where users can add, edit, and delete tasks. Data is saved to local storage.',
    personalNote: "A classic project to practice state management and browser storage. It's a great way to understand the fundamentals of data persistence on the client-side.",
    difficulty: 'Easy',
    component: <TodoList />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
    ],
    renderImage: false,
  },
  {
    id: 'unit-converter',
    title: 'Universal Converter',
    imageUrls: ['https://placehold.co/600x400/000000/808080/png?text=Unit+Converter'],
    imageAlt: 'Unit Converter interface for various measurements',
    imageHint: 'converter app interface',
    description: 'A versatile tool to convert between various units like Temperature, Length, and Weight.',
    personalNote: 'A straightforward app that is excellent for understanding controlled components, state synchronization, and handling different calculation logic in a clean way.',
    difficulty: 'Easy',
    component: <UnitConverter />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
    ],
    renderImage: false,
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
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'tic-tac-toe',
    title: 'Real-Time Multiplayer Game',
    imageUrls: ['https://placehold.co/600x400/000000/808080/png?text=Tic-Tac-Toe'],
    imageAlt: 'Tic-Tac-Toe multiplayer game',
    imageHint: 'tic tac toe game',
    description: 'A classic Tic-Tac-Toe game with real-time multiplayer support using Firebase.',
    personalNote: "This project was a great introduction to real-time databases and handling concurrent user interactions. It's a simple concept but has a surprising amount of depth when you factor in the networking.",
    difficulty: 'Advanced',
    component: <TicTacToe />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase-color.svg' },
    ],
    renderImage: false,
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
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
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
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
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
      { name: 'Java', iconSrc: '/icons/java-color.svg' },
      { name: 'Pterodactyl', iconSrc: '/icons/pterodactyl.svg' },
      { name: 'MySQL', iconSrc: '/icons/mysql-color.svg' },
      { name: 'Docker', iconSrc: '/icons/docker-color.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase-color.svg' },
      { name: 'React', iconSrc: '/icons/react-color.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript-color.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss-color.svg' },
  ],
  renderImage: true,
};

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getDifficultyBadgeVariant = (difficulty: Project['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'default';
      case 'Medium': return 'secondary';
      case 'Hard': return 'destructive';
      case 'Advanced': return 'destructive';
      case 'Community': return 'outline';
      default: return 'outline';
    }
  };

  const ProjectCardContent = ({ project, onClick }: { project: Project, onClick?: () => void }) => (
    <Card
      onClick={onClick}
      className={cn(
        "bg-[#111] border-[#333] rounded-lg overflow-hidden flex flex-col h-full group",
        onClick && "cursor-pointer transition-all duration-300 hover:border-primary"
      )}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={onClick ? `Open project: ${project.title}` : project.title}
    >
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-black flex items-center justify-center overflow-hidden">
          {project.renderImage ? (
            <Image
              src={project.imageUrls[0]}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              data-ai-hint={project.imageHint}
              priority={project.id !== 'silent-horizon'}
            />
          ) : (
            <h3 className="text-3xl font-bold text-gray-400">{project.title.replace(' App', '')}</h3>
          )}
        </div>
      </CardHeader>
      <div className="border-t border-[#333] p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{project.title}</h4>
          <Badge variant={getDifficultyBadgeVariant(project.difficulty)} className="ml-2 shrink-0 !text-white" style={{backgroundColor: '#008080'}}>
            {project.difficulty}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 flex-grow">{project.description}</p>
        <blockquote className="mt-4 border-l-2 border-gray-500 pl-3">
          <p className="text-sm text-gray-400 italic">{project.personalNote}</p>
        </blockquote>
      </div>
      <CardFooter className="p-4 pt-4 border-t border-[#333]">
        <TechStack technologies={project.technologies} />
      </CardFooter>
    </Card>
  );

  const ProjectCard = ({ project }: { project: Project }) => {
    if (project.externalLink) {
      return (
        <Link href={project.externalLink} target="_blank" rel="noopener noreferrer" className="contents">
          <ProjectCardContent project={project} />
        </Link>
      );
    }
    
    if (project.component) {
      return <ProjectCardContent project={project} onClick={() => setSelectedProject(project)} />;
    }

    return <ProjectCardContent project={project} />;
  };

  return (
    <>
      <SectionContainer>
        <PageTitle subtitle="Explore a selection of my creative and technical projects. Click a project to learn more or visit the site.">
          My Projects
        </PageTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-border/50">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4 flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            Community Startups
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto text-center mb-12">
            Beyond personal projects, I've also managed larger, community-driven ventures. Here's a look at one of them.
          </p>

          <Card className="bg-[#111] border-[#333] rounded-lg overflow-hidden flex flex-col md:flex-row">
              <div className="relative md:w-1/2 lg:w-3/5 xl:w-2/3 h-64 md:h-auto">
                  <Image 
                      src={communityProject.imageUrls[0]} 
                      alt={communityProject.imageAlt} 
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full"
                      data-ai-hint={communityProject.imageHint}
                      priority
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 60vw, 67vw"
                  />
              </div>
            
              <div className="p-6 flex flex-col flex-grow md:w-1/2 lg:w-2/5 xl:w-1/3">
                  <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl md:text-2xl font-semibold text-white">{communityProject.title}</h4>
                      <Badge variant={getDifficultyBadgeVariant(communityProject.difficulty)} className="ml-3 shrink-0 !text-white" style={{backgroundColor: '#008080'}}>
                      {communityProject.difficulty}
                      </Badge>
                  </div>
                  <p className="text-sm md:text-base text-gray-400 mb-4">{communityProject.description}</p>
                  <blockquote className="text-sm md:text-base text-gray-400 font-normal mb-6 border-l-2 border-gray-500 pl-4 italic">{communityProject.personalNote}</blockquote>
                  <CardFooter className="p-0 mt-auto flex-col items-start gap-4">
                      <TechStack technologies={communityProject.technologies} />
                      <Button asChild variant="outline" className="w-full" >
                          <Link href={communityProject.externalLink || '#'}>
                              <ExternalLink className="mr-2 h-4 w-4" /> Visit Site
                          </Link>
                      </Button>
                  </CardFooter>
              </div>
          </Card>
        </div>
      </SectionContainer>
       {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={(isOpen) => !isOpen && setSelectedProject(null)}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{selectedProject.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-auto">
              {selectedProject.component}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
