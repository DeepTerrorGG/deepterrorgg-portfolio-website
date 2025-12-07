
'use client';

import React from 'react';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import Link from 'next/link';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';

// Placeholder data for your open source projects
const openSourceProjects = [
  {
    name: 'Project 1',
    description: 'A brief description of what this open source project does and its goals.',
    repoUrl: 'https://github.com/DeepTerrorGG/your-repo-1',
    language: 'TypeScript',
    stars: 10,
  },
  {
    name: 'Project 2',
    description: 'Another cool open source project that solves a particular problem.',
    repoUrl: 'https://github.com/DeepTerrorGG/your-repo-2',
    language: 'Python',
    stars: 25,
  },
  // Add more projects here
];

export default function OpenSourcePage() {
  return (
    <AnimateOnScroll className="container mx-auto px-4 sm:px-6 lg:px-8">
      <PageTitle subtitle="A collection of my open source projects on GitHub.">
        Open Source Contributions
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {openSourceProjects.map((project) => (
          <Card key={project.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Language: {project.language}</span>
                <span>Stars: {project.stars}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </AnimateOnScroll>
  );
}
