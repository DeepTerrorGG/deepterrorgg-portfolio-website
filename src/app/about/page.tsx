
// src/app/about/page.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechBadge } from '@/components/ui/tech-badge';
import SectionContainer from '@/components/ui/section-container';

interface Technology {
  name: string;
  href: string;
  iconSrc: string;
}

const techCategories = [
  {
    title: 'Core Stack',
    technologies: [
      { name: 'Next.js', href: 'https://nextjs.org/', iconSrc: '/icons/nextjs.svg' },
      { name: 'React', href: 'https://react.dev/', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', href: 'https://www.typescriptlang.org/', iconSrc: '/icons/typescript.svg' },
      { name: 'Node.js', href: 'https://nodejs.org/', iconSrc: '/icons/nodejs.svg' },
      { name: 'Tailwind CSS', href: 'https://tailwindcss.com/', iconSrc: '/icons/tailwindcss.svg' },
    ],
  },
  {
    title: 'UI & Animation',
    technologies: [
      { name: 'shadcn/ui', href: 'https://ui.shadcn.com/', iconSrc: '/icons/shadcn.svg' },
      { name: 'Framer Motion', href: 'https://www.framer.com/motion/', iconSrc: '/icons/framer.svg' },
      { name: 'Lucide Icons', href: 'https://lucide.dev/', iconSrc: '/icons/lucide.svg' },
      { name: 'Spline', href: 'https://spline.design/', iconSrc: '/icons/spline.svg' },
      { name: 'Recharts', href: 'https://recharts.org/', iconSrc: '/icons/recharts.svg' },
      { name: 'D3.js', href: 'https://d3js.org/', iconSrc: '/icons/d3.svg' },
    ],
  },
   {
    title: 'Libraries & Utilities',
    technologies: [
      { name: 'React Hook Form', href: 'https://react-hook-form.com/', iconSrc: '/icons/react-hook-form.svg' },
      { name: 'Zod', href: 'https://zod.dev/', iconSrc: '/icons/zod.svg' },
      { name: 'dnd-kit', href: 'https://dndkit.com/', iconSrc: '/icons/dnd-kit.svg' },
      { name: 'TanStack Table', href: 'https://tanstack.com/table/v8', iconSrc: '/icons/react-query.svg' },
      { name: 'Monaco Editor', href: 'https://microsoft.github.io/monaco-editor/', iconSrc: '/icons/vscode.svg' },
      { name: 'React Markdown', href: 'https://github.com/remarkjs/react-markdown', iconSrc: '/icons/react-markdown.svg' },
      { name: 'date-fns', href: 'https://date-fns.org/', iconSrc: '/icons/date-fns.svg' },
      { name: 'Faker.js', href: 'https://fakerjs.dev/', iconSrc: '/icons/faker.svg' },
      { name: 'crypto-js', href: 'https://github.com/brix/crypto-js', iconSrc: '/icons/crypto-js.svg' },
    ],
  },
  {
    title: 'AI, Backend & Services',
    technologies: [
      { name: 'Genkit', href: 'https://firebase.google.com/docs/genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'Google Gemini', href: 'https://deepmind.google.com/technologies/gemini/', iconSrc: '/icons/gemini.svg' },
      { name: 'Firebase', href: 'https://firebase.google.com/', iconSrc: '/icons/firebase.svg' },
      { name: 'NextAuth.js', href: 'https://next-auth.js.org/', iconSrc: '/icons/nextauth.svg' },
      { name: 'Resend', href: 'https://resend.com/', iconSrc: '/icons/resend.svg' },
      { name: 'Vercel', href: 'https://vercel.com/', iconSrc: '/icons/vercel.svg' },
      { name: '@vercel/og', href: 'https://vercel.com/docs/functions/edge-functions/og-image-generation', iconSrc: '/icons/vercel.svg' },
      { name: 'Spotify API', href: 'https://developer.spotify.com/documentation/web-api', iconSrc: '/icons/spotify.svg' },
      { name: 'GitHub API', href: 'https://docs.github.com/en/rest', iconSrc: '/icons/github.svg' },
      { name: 'Coinbase API', href: 'https://commerce.coinbase.com/docs/api/', iconSrc: '/icons/coinbase.svg' },
      { name: 'Piston API', href: 'https://github.com/engineer-man/piston', iconSrc: '/icons/piston.svg' },
      { name: 'OpenWeatherMap API', href: 'https://openweathermap.org/api', iconSrc: '/icons/openweathermap.svg' },
      { name: 'Wikimedia API', href: 'https://api.wikimedia.org/wiki/Main_Page', iconSrc: '/icons/wikipedia.svg' },
      { name: 'thum.io API', href: 'https://www.thum.io/', iconSrc: '/icons/thum-io.svg' },
    ],
  },
   {
    title: 'Browser & Niche Tech',
    technologies: [
      { name: 'Web Speech API', href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API', iconSrc: '/icons/webaudio.svg' },
      { name: 'Web Audio API', href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', iconSrc: '/icons/webaudio.svg' },
      { name: 'HTML5 Canvas', href: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API', iconSrc: '/icons/html5.svg' },
      { name: 'DOSBox', href: 'https://www.dosbox.com/', iconSrc: '/icons/dosbox.svg' },
    ],
  },
];


export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <SectionContainer className="!pt-12 !pb-16 md:!pt-16 md:!pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <motion.div 
                className="md:col-span-4 lg:col-span-5 relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <Image
                    src="https://i.imgur.com/wcHgOHv.png"
                    alt="Profile picture of a figure in ornate armor"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain object-center"
                    data-ai-hint="artist profile"
                    priority
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
            <motion.div 
                className="md:col-span-8 lg:col-span-7"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.p variants={itemVariants} className="text-primary font-semibold text-lg mb-2">About Me</motion.p>
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">DeepTerrorGG</motion.h1>
                <motion.h2 variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground font-medium mb-6">Programmer & Digital Artist</motion.h2>
                <motion.p variants={itemVariants} className="text-lg text-foreground/80 leading-relaxed">
                    A developer and digital artist exploring where code, emotion, and imagination meet. I’m driven by the honest energy of creators and the challenge of turning feelings into something tangible, whether it's through a line of code or a stroke of a digital brush.
                </motion.p>
            </motion.div>
        </div>
      </SectionContainer>
      
      {/* My Story Section */}
      <SectionContainer>
        <Card className="bg-card/50 border-border/50">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-3xl text-foreground">
                    <Brain aria-hidden="true" className="text-primary h-8 w-8" />
                    My Story
                </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg leading-relaxed max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <p>
                    My journey into art didn’t start with a plan; it started with a feeling, sparked by the style and honest energy of artist <Link href="https://www.tiktok.com/@hinxycrybaby" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">@hinxycrybaby</Link>. That inspiration is what pushed me to start creating on my own.
                </p>
                <p>
                    For me, art isn’t just about visuals—it’s about expression. It’s how I work through thoughts, how I grow, and how I turn feelings into something you can see. Every project is a step toward becoming better, not just technically, but as a person.
                </p>
                 <p className="md:col-span-2">
                    Besides coding and design, I’m drawn to games and anything with a strong aesthetic vibe. Those things shape how I see the world, and they help me add emotion, atmosphere, and personality to the things I build. I’m learning, reflecting, and creating from a place that feels honest.
                </p>
            </CardContent>
        </Card>
      </SectionContainer>

      {/* Technology Stack Section */}
      <SectionContainer>
        <div className="text-center mb-12">
            <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                <Code aria-hidden="true" className="text-primary h-8 w-8" />
                This Project's Technology Stack
            </h2>
        </div>
        <div className="space-y-12">
          {techCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-2xl font-semibold text-foreground mb-6">{category.title}</h3>
              <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
              >
                {category.technologies.map((tech) => (
                  <motion.div key={tech.name} variants={itemVariants}>
                    <TechBadge
                      name={tech.name} 
                      href={tech.href} 
                      iconSrc={tech.iconSrc} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
