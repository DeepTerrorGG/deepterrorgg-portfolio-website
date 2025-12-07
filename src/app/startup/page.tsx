// src/app/startup/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { TechStack } from '@/components/ui/tech-stack';
import SectionContainer from '@/components/ui/section-container';

const communityProject = {
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
  description: 'A case study of a large-scale community project I managed and developed.',
  role: 'Lead Software Engineer & Project Manager',
  highlights: {
    "Leadership & Management": [
      "Team Leadership: Directed a cross-functional team of 10+ developers and moderators (ages 18-25). Successfully managed the project for 1.5 years despite being the youngest member, demonstrating high maturity and conflict resolution skills.",
      "Recruitment & HR: Built a custom staff application system and conducted interviews to scale the team.",
      "Operations: Managed community relations, ban appeals, and feature requests, translating user feedback into technical roadmaps."
    ],
    "Technical Architecture": [
      "Backend Engineering (Java): Developed custom server-side plugins to handle gameplay logic, economy systems, and data persistence.",
      "Full Stack Web Integration: Built a separate React/Next.js website for the community, featuring a custom backend for staff applications and user statistics.",
      "Infrastructure: Configured and maintained Linux (Ubuntu) VPS environments, ensuring 99.9% uptime and handling DDoS mitigation."
    ]
  },
  difficulty: 'Community',
  externalLink: 'https://silent-horizon.com/',
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
};


export default function StartupPage() {
  return (
    <SectionContainer>
      <PageTitle
        subtitle={communityProject.description}
      >
        {communityProject.title}
      </PageTitle>

      <div className="flex flex-col items-center gap-8 md:gap-12">
        {/* Image Carousel */}
        <div className="w-full max-w-4xl">
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {communityProject.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-video relative">
                      <Image
                        src={url}
                        alt={`${communityProject.imageAlt} - Image ${index + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        data-ai-hint={communityProject.imageHint}
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80" />
          </Carousel>
        </div>

        {/* Details Section */}
        <div className="w-full max-w-4xl flex flex-col space-y-6 items-center text-center">
          
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">{communityProject.role}</h2>
            {Object.entries(communityProject.highlights).map(([category, points]) => (
                <div key={category} className="mt-4 text-left">
                    <h3 className="text-xl font-semibold mb-3 text-center">{category}</h3>
                    <ul className="space-y-2">
                        {points.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                                <span className="text-muted-foreground">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Technology Stack</h3>
            <TechStack technologies={communityProject.technologies} />
          </div>

          {communityProject.externalLink && (
            <div className="pt-4">
              <Button asChild size="lg">
                <a href={communityProject.externalLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Visit Live Site
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
