
'use client';

import Link from 'next/link';
import Image from 'next/image';
import SectionContainer from '@/components/ui/section-container';
import { motion } from 'framer-motion';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, User, ArrowUpToLine, Github, Linkedin, Code, Star, Send, Loader2, Compass, Monitor } from 'lucide-react';
import SplineShowcase from '@/components/home/spline-showcase';
import type Spline from '@splinetool/react-spline';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import React, { useState, useEffect, useRef } from 'react';
import PreloadingLink from '@/components/ui/preloading-link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { TechStack } from '@/components/ui/tech-stack';
import AnimatedHeader from '@/components/home/AnimatedHeader';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DirectMessageSchema, type DirectMessageSchemaType, type DirectMessageFormState } from '@/app/contact/schema';

const SplineModel = React.lazy(
  () => import('@/components/home/spline-model')
);


const featuredProjects = [
    {
      id: 'genkit-starter',
      title: 'Genkit Next.js Starter',
      description: 'A production-ready starter template for building AI-powered applications with Next.js and Google\'s Genkit.',
      longDescription: 'This template provides a comprehensive starting point for developers looking to integrate Google\'s generative AI framework, Genkit, with a modern Next.js application. It includes setup for server-side flows, client-side hooks, and examples of streaming responses, structured output, and tool use, helping developers bypass boilerplate and start building features immediately.',
      technologies: [
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      ],
      language: 'TypeScript',
      stars: 152,
    },
    {
      id: 'firebase-ui',
      title: 'Firebase UI for React',
      description: 'A set of reusable and accessible React components for building user interfaces that interact with Firebase services.',
      longDescription: 'This project simplifies Firebase integration in React applications by providing pre-built components for authentication, Firestore data display, and file uploads. The goal is to provide a headless, customizable component library that handles the backend logic, allowing developers to focus on their application\'s unique UI/UX.',
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      ],
      language: 'TypeScript',
      stars: 88,
    },
    {
      id: 'portfolio-template',
      title: 'Portfolio Template',
      description: 'The very same code that powers this portfolio website. Built to be easily customizable and showcase personal projects.',
      longDescription: 'This project is a complete portfolio solution for developers and creatives. It features a modular design, easy content updates via mock data files, and a modern tech stack including Next.js, Framer Motion, and shadcn/ui. The goal is to provide a beautiful, performant, and easily-customizable template for showcasing personal projects and skills.',
      technologies: [
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
        { name: 'shadcn/ui', iconSrc: '/icons/shadcn.svg' },
      ],
       language: 'TypeScript',
      stars: 215,
    },
     {
      id: 'cli-boilerplate',
      title: 'CLI Tool Boilerplate',
      description: 'A boilerplate for creating powerful, type-safe command-line tools with Node.js and TypeScript.',
      longDescription: 'This starter kit includes argument parsing, command routing, colorized output, and automated testing setup. It helps developers quickly bootstrap a new CLI project, focusing on logic rather than setup. Includes examples for fetching data from an API and interacting with the local file system.',
      technologies: [
        { name: 'Node.js', iconSrc: '/icons/nodejs.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      ],
      language: 'TypeScript',
      stars: 42,
    },
];

const technologies = [
  { name: 'Next.js', href: 'https://nextjs.org/', iconSrc: '/icons/nextjs.svg' },
  { name: 'React', href: 'https://react.dev/', iconSrc: '/icons/react.svg' },
  { name: 'TypeScript', href: 'https://www.typescriptlang.org/', iconSrc: '/icons/typescript.svg' },
  { name: 'Node.js', href: 'https://nodejs.org/', iconSrc: '/icons/nodejs.svg' },
  { name: 'Tailwind CSS', href: 'https://tailwindcss.com/', iconSrc: '/icons/tailwindcss.svg' },
  { name: 'shadcn/ui', href: 'https://ui.shadcn.com/', iconSrc: '/icons/shadcn.svg' },
  { name: 'Framer Motion', href: 'https://www.framer.com/motion/', iconSrc: '/icons/framer.svg' },
  { name: 'Lucide', href: 'https://lucide.dev/', iconSrc: '/icons/lucide.svg' },
  { name: 'React Hook Form', href: 'https://react-hook-form.com/', iconSrc: '/icons/react-hook-form.svg' },
  { name: 'Zod', href: 'https://zod.dev/', iconSrc: '/icons/zod.svg' },
  { name: 'dnd-kit', href: 'https://dndkit.com/', iconSrc: '/icons/dnd-kit.svg' },
  { name: 'Recharts', href: 'https://recharts.org/', iconSrc: '/icons/recharts.svg' },
  { name: 'D3.js', href: 'https://d3js.org/', iconSrc: '/icons/d3.svg' },
  { name: 'Genkit', href: 'https://firebase.google.com/docs/genkit', iconSrc: '/icons/genkit.svg' },
  { name: 'Google Gemini', href: 'https://deepmind.google.com/technologies/gemini/', iconSrc: '/icons/gemini.svg' },
  { name: 'Firebase', href: 'https://firebase.google.com/', iconSrc: '/icons/firebase.svg' },
  { name: 'NextAuth.js', href: 'https://next-auth.js.org/', iconSrc: '/icons/nextauth.svg' },
  { name: 'Resend', href: 'https://resend.com/', iconSrc: '/icons/resend.svg' },
  { name: 'Vercel', href: 'https://vercel.com/', iconSrc: '/icons/vercel.svg' },
  { name: '@vercel/og', href: 'https://vercel.com/docs/functions/edge-functions/og-image-generation', iconSrc: '/icons/vercel.svg' },
  { name: 'date-fns', href: 'https://date-fns.org/', iconSrc: '/icons/date-fns.svg' },
  { name: 'Spline', href: 'https://spline.design/', iconSrc: '/icons/spline.svg' },
  { name: 'Monaco Editor', href: 'https://microsoft.github.io/monaco-editor/', iconSrc: '/icons/vscode.svg' },
  { name: 'TanStack Table', href: 'https://tanstack.com/table/v8', iconSrc: '/icons/react-query.svg' },
];

const splineModels = [
    { url: 'https://prod.spline.design/FfjWOhoEErL5Sia2/scene.splinecode', title: 'Cyberpunk Room' },
    { url: 'https://prod.spline.design/Oy8cFTtrLNL36Qll/scene.splinecode', title: 'Cozy Living Room' },
    { url: 'https://prod.spline.design/qC2WtYn7OhOcS8L0/scene.splinecode', title: 'Abstract Shapes' },
    { url: 'https://prod.spline.design/3SU82luCTBxFgmZk/scene.splinecode', title: 'Gaming Setup' },
    { url: 'https://prod.spline.design/o9RKr9qFSINlT6QX/scene.splinecode', title: 'Floating Orb' },
    { url: 'https://prod.spline.design/PpzeXZ2jGbRYbcYD/scene.splinecode', title: 'Magic Crystal' },
    { url: 'https://prod.spline.design/aHUMGNLXv2zxvysr/scene.splinecode', title: 'Voxel World' },
    { url: 'https://prod.spline.design/eAZWQJSADsfRaSlh/scene.splinecode', title: 'Retro Computer' },
];

const ScrollingTechRow = ({ items, direction = 'left' }: { items: typeof technologies, direction?: 'left' | 'right' }) => (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scrolling-${direction}`}>
            {items.map((tech) => (
            <li key={tech.name} className="flex-shrink-0">
                <Link href={tech.href} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-12">
                    <Image src={tech.iconSrc} alt={tech.name} fill sizes="48px" className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                </Link>
            </li>
            ))}
        </ul>
        <ul className={`flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-scrolling-${direction}`} aria-hidden="true">
            {items.map((tech) => (
            <li key={tech.name + '-clone'} className="flex-shrink-0">
                 <Link href={tech.href} target="_blank" rel="noopener noreferrer" className="relative block h-12 w-12">
                    <Image src={tech.iconSrc} alt={tech.name} fill sizes="48px" className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                </Link>
            </li>
            ))}
        </ul>
  </div>
);


export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { toast } = useToast();
  const form = useForm<DirectMessageSchemaType>({
    resolver: zodResolver(DirectMessageSchema),
    defaultValues: {
      email: '',
      message: '',
    },
  });

  const onSubmit: SubmitHandler<DirectMessageSchemaType> = async (data) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: DirectMessageFormState = await response.json();
      if (response.ok && result.success) {
        toast({ title: 'Message Sent!', description: result.message, variant: 'default' });
        form.reset();
      } else {
        toast({ title: 'Error', description: result.message || 'An error occurred.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  };


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!api) {
      return
    }
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


  const footerLinks = [
    { name: 'Contact', icon: <Mail className="h-5 w-5" />, href: '/contact' },
    { name: 'About', icon: <User className="h-5 w-5" />, href: '/about' },
    { name: 'Back to Top', icon: <ArrowUpToLine className="h-5 w-5" />, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];

  function onSplineLoad(spline: Spline) {
    const obj = spline.findObjectByName('Gameboy');
    if (obj) {
      // Start the animation by name
      spline.emitEvent('mouseDown', obj.name);
    }
  }
  
  return (
    <>
      <div className="flex flex-col flex-grow bg-background">
        {/* Hero Section */}
        <div className="text-center h-[calc(100vh-80px)] min-h-[700px] flex flex-col justify-center items-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="z-10">
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              <Image
                src="https://i.imgur.com/TsFpBse.png"
                alt="User avatar"
                width={160}
                height={160}
                className="rounded-full border-4 border-primary shadow-xl object-cover mx-auto filter saturate-125"
                data-ai-hint="avatar illustration"
                priority
              />
            </motion.div>
            <AnimatedHeader text="AI/Fullstack Engineer" />
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
            >
              Exploring the intersection of code, emotion, and imagination. I build web applications and create digital art that tells a story.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              <Button asChild size="lg">
                <PreloadingLink href="/projects">
                  View My Work <ArrowRight className="ml-2 h-5 w-5" />
                </PreloadingLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <PreloadingLink href="/contact">
                  Get In Touch <Mail className="ml-2 h-5 w-5" />
                </PreloadingLink>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Artwork Section */}
        <AnimateOnScroll>
          <SectionContainer className="!py-16 md:!py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center group">
                    <h2 className="text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors duration-300">
                      <span className="animated-gradient-text">THE PORTFOLIO</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                      A curated collection of over 50 interactive projects, from AI applications to complex web systems.
                    </p>
                    <Button asChild variant="outline" className="mt-6 rounded-full px-6">
                        <PreloadingLink href="/projects">
                            VIEW PROJECTS <ArrowRight className="ml-2 h-4 w-4"/>
                        </PreloadingLink>
                    </Button>
                    <div className="mt-8">
                      <Image src="/images/anthology.png" alt="Anthology series characters" width={600} height={600} className="w-full h-auto" />
                    </div>
                </div>
                <div className="text-center group">
                    <h2 className="text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors duration-300">
                      <span className="animated-gradient-text">THE ARTWORKS</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                      A gallery of personal artworks and creative pieces inspired by digital art and emotion.
                    </p>
                     <Button asChild variant="outline" className="mt-6 rounded-full px-6">
                        <PreloadingLink href="/artworks">
                           VIEW GALLERY <ArrowRight className="ml-2 h-4 w-4"/>
                        </PreloadingLink>
                    </Button>
                    <div className="mt-8">
                       <Image src="/images/azuki.png" alt="Azuki character" width={600} height={600} className="w-full h-auto" />
                    </div>
                </div>
            </div>
          </SectionContainer>
        </AnimateOnScroll>
        
        {/* Featured Projects Section */}
        <AnimateOnScroll>
          <SectionContainer id="featured-work" className="!py-24 md:!py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Featured Projects</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">A curated selection of my projects, showcasing a blend of technical skill and creative vision.</p>
            </div>
            {isMounted && (
              <Carousel
                  setApi={setApi}
                  plugins={[autoplayPlugin.current]}
                  className="w-full"
                  opts={{ loop: true }}
                  onMouseEnter={autoplayPlugin.current.stop}
                  onMouseLeave={autoplayPlugin.current.reset}
                >
                <CarouselContent>
                  {featuredProjects.map((project) => (
                    <CarouselItem key={project.id}>
                      <div className="p-1">
                        <Card className="bg-[#0d1117]/80 border-border/30 text-slate-300 font-mono shadow-2xl transition-all duration-500 h-full flex flex-col min-h-[480px]">
                          {/* Terminal Header */}
                          <CardHeader className="flex flex-row items-center gap-2 p-3 border-b border-border/30 bg-black/50">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <p className="text-sm text-slate-400 truncate">{project.title}</p>
                          </CardHeader>
                          
                          <CardContent className="p-6 space-y-4 flex-grow">
                            <div>
                              <p className="text-primary flex items-center">
                                <span className="text-cyan-400 mr-2">~/opensource</span>
                                <span className="text-yellow-400">&gt;</span>
                                <span className="ml-2 text-primary font-bold">{project.title}</span>
                              </p>
                              <p className="text-slate-400 text-sm mt-1">{project.description}</p>
                            </div>
                            
                            <div>
                              <p className="flex items-center text-yellow-400">
                                <span>&gt;</span>
                                <span className="ml-2 text-slate-300">cat README.md</span>
                              </p>
                              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-border/30">
                                {project.longDescription}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-sm pt-2">
                              <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">&gt;</span>
                                  <Code className="h-4 w-4 text-primary" />
                                  <span>{project.language}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span>{project.stars.toLocaleString()} stars</span>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-6 pt-0 mt-auto">
                            <Button asChild className="group/btn w-full sm:w-auto bg-primary/10 border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                              <PreloadingLink href={`/opensource`}>
                                <Github className="mr-2 h-4 w-4" />
                                ./view_on_github.sh
                                <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                              </PreloadingLink>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-60px] top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80" />
                <CarouselNext className="absolute right-[-60px] top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80" />
              </Carousel>
            )}
             <div className="flex justify-center gap-2 mt-8">
              {featuredProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className="p-1 relative h-2 w-8 rounded-full bg-muted/50 transition-colors hover:bg-primary/50"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {current === index && (
                    <motion.div
                      layoutId="carousel-indicator"
                      className="absolute inset-0 h-full w-full bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </SectionContainer>
        </AnimateOnScroll>
        
        {/* Call to Action Section */}
        <AnimateOnScroll>
          <SectionContainer id="contact-cta" className="!pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left p-8 md:p-12 flex flex-col justify-center h-full">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Have a Project in Mind?</h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto lg:mx-0">I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Let's create something amazing together.</p>
              </div>
              <div className="group [perspective:1000px]">
                <Card className="bg-[#0d1117]/80 border-border/30 text-slate-300 font-mono shadow-2xl transition-all duration-500 group-hover:[transform:rotateY(2deg)_rotateX(5deg)]">
                  <CardHeader className="flex flex-row items-center gap-2 p-3 border-b border-border/30 bg-black/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-sm text-slate-400">./contact.sh</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <p><span className="text-primary mr-2">&gt;</span><span className="text-slate-300">email=</span></p>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} className="bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-300 pl-8" />
                              </FormControl>
                              <FormMessage className="pl-8" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <p><span className="text-primary mr-2">&gt;</span><span className="text-slate-300">message=</span></p>
                              <FormControl>
                                <Textarea placeholder="Your message here..." {...field} className="bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-300 pl-8 min-h-[60px]" />
                              </FormControl>
                              <FormMessage className="pl-8" />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting} className="group/btn w-full bg-primary/10 border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                          send-message
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SectionContainer>
        </AnimateOnScroll>

         {/* Skills Section */}
        <AnimateOnScroll>
          <SectionContainer id="skills">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Skills & Expertise</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">The tools and technologies I use to bring ideas to life.</p>
            </div>
            <div className="space-y-8">
                <ScrollingTechRow items={technologies.slice(0, Math.ceil(technologies.length / 2))} />
                <ScrollingTechRow items={technologies.slice(Math.ceil(technologies.length / 2))} direction="right" />
            </div>
            <div className="text-center mt-12">
                <Button asChild size="lg">
                  <PreloadingLink href="/about">
                    View All Skills <ArrowRight className="ml-2 h-4 w-4" />
                  </PreloadingLink>
                </Button>
              </div>
          </SectionContainer>
        </AnimateOnScroll>

        {/* 3D Model Showcase */}
        <AnimateOnScroll>
          <SectionContainer id="spline-showcase">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">3D Model Showcase</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">A collection of my 3D creations. Use the arrows to navigate.</p>
            </div>
            {isMounted && (
              <React.Suspense fallback={<div className="bg-muted/20 w-full h-full min-h-[500px]" />}>
                <div className="hidden md:block">
                  <SplineShowcase models={splineModels} />
                </div>
              </React.Suspense>
            )}
            <div className="block md:hidden">
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <Monitor className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">3D Showcase Available on Desktop</h3>
                  <p className="text-muted-foreground mt-2">
                    This interactive 3D model showcase is best experienced on a larger screen. Please view this page on a desktop or laptop to explore the models.
                  </p>
                </CardContent>
              </Card>
            </div>
          </SectionContainer>
        </AnimateOnScroll>
      </div>
      <footer className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">You've reached the edge of this world.</h2>
          <p className="text-muted-foreground mb-12">What will you do now?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="h-full">
              <Card 
                className="h-full bg-card/50 hover:bg-card/80 border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <CardContent className="p-6 text-center">
                  <ArrowUpToLine className="h-10 w-10 mx-auto text-primary mb-3"/>
                  <h3 className="text-xl font-semibold">Return to Top</h3>
                  <p className="text-sm text-muted-foreground mt-1">Start again from the beginning.</p>
                </CardContent>
              </Card>
            </motion.div>
             <motion.div whileHover={{ y: -5, scale: 1.02 }} className="h-full">
              <PreloadingLink href="/projects" className="h-full block">
                 <Card className="h-full bg-primary/10 hover:bg-primary/20 border-primary/20 hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Compass className="h-10 w-10 mx-auto text-primary mb-3"/>
                    <h3 className="text-xl font-semibold">Explore More</h3>
                    <p className="text-sm text-muted-foreground mt-1">Discover other projects and demos.</p>
                  </CardContent>
                </Card>
              </PreloadingLink>
            </motion.div>
          </div>
          <div className="mt-16 flex justify-center gap-6">
            <Link href="https://github.com/DeepTerrorGG" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-muted/50">
                <Github className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-muted/50">
                <Linkedin className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </Link>
            <Link href="mailto:example@gmail.com">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-muted/50">
                <Mail className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">Email</span>
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} DeepTerrorGG. All Rights Reserved.
          </p>
        </div>
      </footer>
       <style jsx global>{`
        .animated-gradient-text {
          background: linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--primary)), hsl(var(--foreground)));
          background-size: 200% auto;
          color: transparent;
          background-clip: text;
          -webkit-background-clip: text;
          transition: background-position 0.5s ease-in-out;
        }
        .group:hover .animated-gradient-text {
          animation: gradient-animation 2s linear infinite;
        }
        @keyframes gradient-animation {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </>
  );
}
