// src/app/startup/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { TechStack } from '@/components/ui/tech-stack';
import SectionContainer from '@/components/ui/section-container';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [scale, setScale] = useState<(number | undefined)[]>([]);

    const handleScale = useCallback((api: CarouselApi) => {
      if (!api) return;
      const newScale = api.scrollSnapList().map((_, index) => {
        const diff = Math.abs(index - api.selectedScrollSnap());
        if (diff === 0) return 1;
        if (diff === 1) return 0.8;
        return 0.6;
      });
      setScale(newScale);
    }, []);

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
    handleScale(api);
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
      handleScale(api);
    })
    api.on("reInit", handleScale);
  }, [api, handleScale])

  return (
    <SectionContainer>
      <PageTitle
        subtitle={communityProject.description}
      >
        {communityProject.title}
      </PageTitle>

      <div className="flex flex-col items-center gap-8 md:gap-12">
        {/* Image Carousel */}
        <div className="w-full max-w-5xl">
         <Carousel setApi={setApi} className="w-full group" opts={{ loop: true }}>
            <CarouselContent>
                {communityProject.imageUrls.map((url, index) => (
                    <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3 flex items-center justify-center">
                        <motion.div 
                            className="w-full h-full"
                            animate={{ 
                                scale: scale[index],
                                opacity: scale[index] === 1 ? 1 : 0.5,
                            }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                            <Card className="overflow-hidden shadow-lg transform-style-3d group-hover:scale-[1.02] transition-transform duration-500">
                                <CardContent className="p-0 aspect-video relative">
                                    <Image
                                        src={url}
                                        alt={`${communityProject.imageAlt} - Image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className={cn(
                                            "object-cover transition-all duration-300",
                                            index !== current && 'opacity-50 group-hover:opacity-75'
                                        )}
                                        data-ai-hint={communityProject.imageHint}
                                        priority={index <= 2}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80 transition-opacity opacity-0 group-hover:opacity-100" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 bg-background/50 hover:bg-background/80 transition-opacity opacity-0 group-hover:opacity-100" />
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
