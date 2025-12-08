
// src/app/about/page.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Code, Rocket, Lock, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      { name: 'Wikimedia API', href: 'https://api.wikimedia.org/wiki/Main_Page', iconSrc: '/icons/wikimedia.svg' },
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

const featuredWork = [
  {
    category: "Distributed Computing & Systems",
    icon: <Rocket className="h-6 w-6 text-primary" />,
    projects: [
      { name: "Distributed Fractal Explorer", description: "Architected a browser-based distributed computing network using WebSockets and Binary Streams. It orchestrates visitor browsers to act as parallel compute nodes." },
      { name: "Real-Time Log Ingestor", description: "Engineered a high-throughput Big Data pipeline using Redis Streams and ClickHouse to handle massive traffic spikes without data loss." },
    ]
  },
  {
    category: "Fintech & Security",
    icon: <Lock className="h-6 w-6 text-primary" />,
    projects: [
      { name: "Payment Ledger Simulation", description: "Built a double-entry bookkeeping engine ensuring ACID compliance and financial data integrity through pessimistic locking and idempotency checks." },
      { name: "Infrastructure Management", description: "Extensive experience managing Minecraft (MCP) infrastructure, analyzing game logic, and hardening Linux servers against attacks." },
    ]
  },
  {
    category: "AI & Automation",
    icon: <Bot className="h-6 w-6 text-primary" />,
    projects: [
      { name: "AI Agentic Workflows", description: "Developed intelligent extraction engines that convert unstructured DOM elements into strictly typed JSON schemas using LLMs (Gemini/OpenAI) and Zod." },
      { name: "Dynamic API Generation", description: "Created meta-programming tools that auto-generate REST endpoints based on user-defined metadata." },
    ]
  }
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
        <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-8">
              <Image
                src="https://i.imgur.com/TsFpBse.png"
                alt="DeepTerrorGG Avatar"
                width={128}
                height={128}
                className="rounded-full border-4 border-primary shadow-lg mx-auto"
                priority
              />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">DeepTerrorGG</motion.h1>
            <motion.h2 variants={itemVariants} className="text-xl md:text-2xl text-primary font-medium mb-6">Full Stack Engineer | Systems Architect | AI Integration Specialist</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-foreground/80 leading-relaxed max-w-3xl mx-auto">
                In an era of digital noise, identity is performance. I believe code should speak louder than appearances. I am a Full Stack Engineer and Systems Architect who operates at the intersection of high-performance software, distributed computing, and low-level system configuration.
            </motion.p>
             <motion.p variants={itemVariants} className="text-lg text-foreground/80 leading-relaxed max-w-3xl mx-auto mt-4">
                I don’t just build web applications; I architect the environments they run on. My workflow is heavily influenced by cybersecurity distributions (Kali Linux / BlackArch), instilling a security-first mindset in every system I engineer. Whether I am behind a screen in Serbia or acting as a node in a distributed network, the quality of the architecture remains the constant.
            </motion.p>
        </motion.div>
      </SectionContainer>
      
      {/* Core Engineering Philosophy */}
      <SectionContainer className="!py-0">
        <Card className="bg-card/50 border-border/50">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-3xl text-foreground">
                    <Brain aria-hidden="true" className="text-primary h-8 w-8" />
                    Core Engineering Philosophy
                </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg leading-relaxed max-w-4xl mx-auto text-center">
                <p>
                    I specialize in bridging the gap between kernel-level configuration and high-performance user interfaces. I focus on building systems that are scalable, secure, and architecturally sound from the ground up.
                </p>
            </CardContent>
        </Card>
      </SectionContainer>

      {/* Featured Architectural Work Section */}
      <SectionContainer>
        <div className="text-center mb-12">
            <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                <Code aria-hidden="true" className="text-primary h-8 w-8" />
                Featured Architectural Work
            </h2>
             <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">My portfolio focuses on complex engineering challenges rather than simple CRUD applications.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredWork.map((category) => (
                <motion.div key={category.category} variants={itemVariants}>
                    <Card className="h-full bg-card/80">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                {category.icon}
                                {category.category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {category.projects.map((project) => (
                                <div key={project.name}>
                                    <h4 className="font-semibold">{project.name}</h4>
                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
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
