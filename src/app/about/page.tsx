// src/app/about/page.tsx
'use client';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Code, Database, Layers, Component as TechComponentIcon, Gamepad2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { TechBadge } from '@/components/ui/tech-badge';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SplineViewer = dynamic(() => import('@/components/ui/spline-viewer'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[450px] md:h-full rounded-lg" />,
});

interface Technology {
  name: string;
  href: string;
  iconSrc: string;
}

interface TechCategory {
  name: string;
  icon: React.ReactNode;
  technologies: Technology[];
}

const technologyCategories: TechCategory[] = [
  {
    name: 'Frontend',
    icon: <Layers className="mr-3 h-6 w-6 text-primary" />,
    technologies: [
      { name: 'React', href: 'https://react.dev/', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', href: 'https://nextjs.org/', iconSrc: '/icons/nextjs.svg' },
      { name: 'Tailwind CSS', href: 'https://tailwindcss.com/', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Webflow', href: 'https://webflow.com/', iconSrc: '/icons/webflow.svg' },
      { name: 'Framer', href: 'https://www.framer.com/', iconSrc: '/icons/framer.svg' },
    ],
  },
  {
    name: 'Backend & Languages',
    icon: <Code className="mr-3 h-6 w-6 text-primary" />,
    technologies: [
      { name: 'Node.js', href: 'https://nodejs.org/', iconSrc: '/icons/nodejs.svg' },
      { name: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', iconSrc: '/icons/javascript.svg' },
      { name: 'TypeScript', href: 'https://www.typescriptlang.org/', iconSrc: '/icons/typescript.svg' },
      { name: 'C#', href: 'https://docs.microsoft.com/en-us/dotnet/csharp/', iconSrc: '/icons/csharp.svg' },
      { name: 'C++', href: 'https://isocpp.org/', iconSrc: '/icons/cplusplus.svg' },
      { name: 'Python', href: 'https://www.python.org/', iconSrc: '/icons/python.svg' },
      { name: 'Java', href: 'https://www.java.com/', iconSrc: '/icons/java.svg' },
    ],
  },
  {
    name: 'Databases & DevOps',
    icon: <Database className="mr-3 h-6 w-6 text-primary" />,
    technologies: [
      { name: 'MySQL', href: 'https://www.mysql.com/', iconSrc: '/icons/mysql.svg' },
      { name: 'Docker', href: 'https://www.docker.com/', iconSrc: '/icons/docker.svg' },
      { name: 'Vercel', href: 'https://vercel.com/', iconSrc: '/icons/vercel.svg' },
      { name: 'Pterodactyl', href: 'https://pterodactyl.io/', iconSrc: '/icons/pterodactyl.svg' },
    ],
  },
  {
    name: 'Libraries & Services',
    icon: <TechComponentIcon className="mr-3 h-6 w-6 text-primary" />,
    technologies: [
      { name: 'Firebase', href: 'https://firebase.google.com/', iconSrc: '/icons/firebase.svg' },
      { name: 'Firebase Auth', href: 'https://firebase.google.com/docs/auth', iconSrc: '/icons/firebase-auth.svg' },
      { name: 'Firebase Database', href: 'https://firebase.google.com/docs/database', iconSrc: '/icons/firebase-database.svg' },
      { name: 'Discord.js', href: 'https://discord.js.org/', iconSrc: '/icons/discordjs.svg' },
    ],
  },
];

export default function AboutPage() {
  return (
    <SectionContainer>
      <PageTitle subtitle="A glimpse into my creative journey, skills, and passions.">
        About Me
      </PageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="bg-card border-border h-full flex flex-col">
            <CardHeader className="p-0 relative aspect-square w-full">
              <Image
                src="https://i.imgur.com/wcHgOHv.png"
                alt="Profile picture"
                fill
                sizes="(max-width: 1023px) 100vw, 33vw"
                className="rounded-t-lg object-cover"
                data-ai-hint="artist profile"
                priority
              />
            </CardHeader>
            <CardContent className="pt-4 text-center flex-grow flex flex-col justify-center">
              <CardTitle className="text-2xl text-primary">DeepTerrorGG</CardTitle>
              <p className="text-muted-foreground mt-1">Programer &amp; Digital Artist</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full flex flex-col">
            <CardHeader className="flex items-center justify-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl text-foreground">
                <Brain aria-hidden="true" className="text-primary h-6 w-6" />
                My Story &amp; Beyond
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 md:space-y-6 text-base md:text-lg lg:text-xl leading-relaxed flex-grow">
              <p>
                I’m DeepTerrorGG, a developer and digital artist exploring where code, emotion, and imagination meet. My journey into art didn’t start with a plan; it started with a feeling, sparked by the style and honest energy of artist <Link href="https://www.tiktok.com/@hinxycrybaby" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@hinxycrybaby</Link>. That inspiration is what pushed me to start creating on my own.
              </p>
              <p>
                For me, art isn’t just about visuals—it’s about expression. It’s how I work through thoughts, how I grow, and how I turn feelings into something you can see. Every project is a step toward becoming better, not just technically, but as a person. I’m learning, reflecting, and creating from a place that feels honest.
              </p>
              <p>
                Besides coding and design, I’m drawn to games and anything with a strong aesthetic vibe. Those things shape how I see the world, and they help me add emotion, atmosphere, and personality to the things I build.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
       <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-6 flex items-center justify-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" />
          My Gaming World
        </h2>
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Gaming is more than just a hobby for me; it's a source of inspiration and a world of endless creativity. This interactive 3D model represents my passion for the aesthetics and design that make games so immersive.
        </p>
        <Card className="bg-card border-border overflow-hidden aspect-video">
          <SplineViewer sceneUrl="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode" />
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          My Technology Stack
        </h2>

        <div className="space-y-10">
          {technologyCategories.map((category) => (
            <div key={category.name}>
              <h3 className="flex items-center text-2xl font-semibold text-foreground mb-6">
                {category.icon}
                {category.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.technologies.map((tech) => (
                  <TechBadge
                    key={tech.name} 
                    name={tech.name} 
                    href={tech.href} 
                    iconSrc={tech.iconSrc} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
