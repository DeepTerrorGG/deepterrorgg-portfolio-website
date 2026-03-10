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
import { ExternalLink, CheckCircle, Database, Server, Code, Layout } from 'lucide-react';
import { TechStack } from '@/components/ui/tech-stack';
import SectionContainer from '@/components/ui/section-container';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const communityProject = {
  id: 'silent-horizon',
  title: 'Silent Horizon Community Project',
  imageUrls: [
    '/sh1.jpg',
    '/sh2.jpg',
    '/sh3.jpg',
  ],
  imageAlt: 'Silent Horizon Minecraft Server',
  imageHint: 'minecraft landscape castle',
  description: 'A large-scale community project I managed and developed from the ground up.',
  role: 'Lead Software Engineer & Project Manager',
  highlights: [
    {
      category: "Leadership & Management",
      icon: <CheckCircle className="h-5 w-5 text-purple-400" />,
      points: [
        "Team Leadership: Directed a cross-functional team of 10+ developers and moderators.",
        "Recruitment & HR: Built a custom staff application system and scaled the team.",
        "Operations: Managed community relations, translating user feedback into roadmaps."
      ]
    },
    {
      category: "Technical Architecture",
      icon: <Server className="h-5 w-5 text-blue-400" />,
      points: [
        "Backend Engineering (Java): Developed custom server-side plugins for gameplay logic and economy.",
        "Full Stack Web Integration: Built a React/Next.js community website with a custom backend.",
        "Infrastructure: Configured Linux (Ubuntu) VPS environments, ensuring 99.9% uptime."
      ]
    }
  ],
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

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
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
      if (diff === 1) return 0.85;
      return 0.7;
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <SectionContainer className="relative z-10 pt-24 pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center max-w-6xl mx-auto"
        >

          {/* Header Section */}
          <motion.div variants={fadeInUp} className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              {communityProject.role}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground/50 pb-2">
              {communityProject.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {communityProject.description}
            </p>
          </motion.div>

          {/* 3D Carousel Section */}
          <motion.div variants={fadeInUp} className="w-full mb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-3xl rounded-full" />
            <Carousel setApi={setApi} className="w-full relative" opts={{ loop: true, align: "center" }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {communityProject.imageUrls.map((url, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-[85%] md:basis-[60%] lg:basis-[50%]">
                    <div className="p-1 h-full py-8 text-center" style={{ perspective: '1000px' }}>
                      <motion.div
                        className="relative h-full w-full mx-auto"
                        animate={{
                          scale: scale[index] ?? 1,
                          opacity: (scale[index] ?? 1) === 1 ? 1 : 0.4,
                          rotateY: index === current ? 0 : index < current ? 15 : -15,
                          z: index === current ? 50 : 0
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1.2 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Card className={cn(
                          "overflow-hidden border-white/10 bg-black/50 backdrop-blur-md transition-all duration-500",
                          index === current ? "shadow-2xl shadow-primary/20 ring-1 ring-primary/30" : "shadow-none"
                        )}>
                          <CardContent className="p-2 aspect-[16/9] relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent mix-blend-overlay z-10 rounded-md pointer-events-none" />
                            <Image
                              src={url}
                              alt={`${communityProject.imageAlt} - Preview ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 50vw"
                              className="object-cover rounded-md"
                              priority={index === 0 || index === 1 || index === communityProject.imageUrls.length - 1}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center gap-4 mt-8">
                <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-12 w-12 rounded-full border-white/10 bg-background/50 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all backdrop-blur-md" />

                {/* Pagination Dots */}
                <div className="flex gap-2 mx-4">
                  {communityProject.imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => api?.scrollTo(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        current === idx ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-12 w-12 rounded-full border-white/10 bg-background/50 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all backdrop-blur-md" />
              </div>
            </Carousel>
          </motion.div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">

            {/* Main Content (Highlights) */}
            <div className="lg:col-span-8 space-y-8">
              <motion.div variants={fadeInUp} className="group flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Layout className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Project Highlights</h2>
              </motion.div>

              <div className="grid gap-6">
                {communityProject.highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    className="p-6 md:p-8 rounded-2xl glass-card border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent group-hover:from-primary transition-all duration-500" />
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-full bg-background border border-border">
                        {highlight.icon}
                      </div>
                      <h3 className="text-xl font-semibold">{highlight.category}</h3>
                    </div>
                    <ul className="space-y-4">
                      {highlight.points.map((point, index) => {
                        const [title, details] = point.split(':');
                        return (
                          <li key={index} className="flex items-start">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2.5 mr-4 flex-shrink-0" />
                            <p className="text-muted-foreground leading-relaxed">
                              {details ? (
                                <>
                                  <strong className="text-foreground font-medium">{title}:</strong>{details}
                                </>
                              ) : (
                                point
                              )}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar (Tech Stack & Links) */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div variants={fadeInUp} className="sticky top-24 space-y-8">

                {/* Tech Stack Card */}
                <div className="p-6 md:p-8 rounded-2xl glass-card border border-white/5 bg-gradient-to-b from-background/50 to-background/80 shadow-xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Technologies Used</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {communityProject.technologies.map((tech) => (
                      <div key={tech.name} className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-colors group/tech">
                        <div className="h-10 w-10 relative mb-2 opacity-80 group-hover/tech:opacity-100 group-hover/tech:scale-110 transition-all duration-300">
                          <Image src={tech.iconSrc} alt={tech.name} fill className="object-contain" />
                        </div>
                        <span className="text-[10px] md:text-xs text-muted-foreground group-hover/tech:text-primary transition-colors text-center font-medium">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Card */}
                {communityProject.externalLink && (
                  <div className="p-6 md:p-8 rounded-2xl glass-card border border-primary/20 bg-primary/5 flex flex-col items-center text-center">
                    <h3 className="text-lg font-semibold mb-2">Explore the Server</h3>
                    <p className="text-sm text-muted-foreground mb-6">Connect to the live community and see the infrastructure in action.</p>
                    <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group/btn rounded-full">
                      <a href={communityProject.externalLink} target="_blank" rel="noopener noreferrer">
                        Visit Live Site
                        <ExternalLink className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                )}

              </motion.div>
            </div>

          </div>
        </motion.div>
      </SectionContainer>
    </div>
  );
}

