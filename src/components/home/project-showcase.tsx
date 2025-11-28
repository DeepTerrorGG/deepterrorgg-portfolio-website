
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';
import { TechStack } from '@/components/ui/tech-stack';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import CodeEditor from '@/components/projects/code-editor';
import CollaborativeWhiteboard from '@/components/projects/collaborative-whiteboard';
import DeckBuildingRoguelike from '@/components/projects/deck-building-roguelike';
import GitHistoryVisualizer from '@/components/projects/githistory-visualizer';
import KanbanBoard from '@/components/projects/kanban-board';
import PreloadingLink from '@/components/ui/preloading-link';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageHint?: string;
  technologies: { name: string; iconSrc: string }[];
}

interface ProjectShowcaseProps {
  projects: Project[];
}

const ProjectComponentMap: Record<string, React.ReactNode> = {
  'code-editor': <CodeEditor />,
  'collaborative-whiteboard': <CollaborativeWhiteboard />,
  'deck-building-roguelike': <DeckBuildingRoguelike />,
  'githistory-visualizer': <GitHistoryVisualizer />,
  'kanban-board': <KanbanBoard />,
};

const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects }) => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{ loop: true }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {projects.map((project) => (
          <CarouselItem key={project.id}>
            <div className="p-1">
              <Card className="flex flex-col md:flex-row overflow-hidden h-full min-h-[480px] transform-style-3d transition-transform duration-500 ease-in-out">
                <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-card">
                  <div className="w-full h-full min-h-[300px] md:min-h-full flex items-center justify-center bg-muted/30 p-8">
                     {ProjectComponentMap[project.id] || (
                       <div className="text-center">
                          <Compass className="h-16 w-16 text-primary mx-auto mb-4"/>
                          <h3 className="text-xl font-bold">Explore this Project</h3>
                          <p className="text-muted-foreground mt-2">
                              This is an interactive demo. Click the button to explore it on the projects page.
                          </p>
                      </div>
                     )}
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col p-6 sm:p-8 justify-center">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl lg:text-3xl text-primary">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow mb-6">
                    <p className="text-muted-foreground">{project.description}</p>
                  </CardContent>
                  <CardFooter className="p-0 flex flex-col items-center gap-4">
                    <TechStack technologies={project.technologies} />
                    <Button asChild variant="outline" className="mt-4">
                      <PreloadingLink href={`/projects`}>
                        Explore Project <ArrowRight className="ml-2 h-4 w-4" />
                      </PreloadingLink>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/80" />
      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/80" />
    </Carousel>
  );
};

export default ProjectShowcase;

    
