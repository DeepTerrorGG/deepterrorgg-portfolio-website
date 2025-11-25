
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
import { ExternalLink } from 'lucide-react';
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
  description: 'A large-scale Balkan Minecraft server community with Survival, Skyblock, and Prison modes. Open for everyone to join and play.',
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
};


export default function StartupPage() {
  return (
    <SectionContainer>
      <PageTitle
        subtitle="A case study of a large-scale community project I managed and developed."
      >
        {communityProject.title}
      </PageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Image Carousel */}
        <div className="w-full">
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

        {/* Right Column: Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Description</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {communityProject.description}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">My Role & Experience</h2>
            <blockquote className="border-l-4 border-border pl-4 py-2 my-4">
              <p className="text-muted-foreground italic text-lg leading-relaxed">
                {communityProject.personalNote}
              </p>
            </blockquote>
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
