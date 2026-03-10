'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Code, Rocket, Lock, Bot, Terminal } from 'lucide-react';
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
            { name: 'shadcn/ui', href: 'https://ui.shadcn.com/', iconSrc: '/icons/spline-white.svg' },
            { name: 'Framer Motion', href: 'https://www.framer.com/motion/', iconSrc: '/icons/framer.svg' },
            { name: 'Lucide Icons', href: 'https://lucide.dev/', iconSrc: '/icons/lucide.svg' },
            { name: 'Spline', href: 'https://spline.design/', iconSrc: '/icons/spline-white.svg' },
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
            { name: 'Spotify API', href: 'https://developer.spotify.com/documentation/web-api', iconSrc: '/icons/spotify.svg' },
            { name: 'GitHub API', href: 'https://docs.github.com/en/rest', iconSrc: '/icons/github-white.svg' },
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
            { name: 'Web Speech API', href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API', iconSrc: '/icons/mic.svg' },
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


export default function AboutView() {
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
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12">
            {/* Hero Section */}
            <SectionContainer className="!pt-12 !pb-16 md:!pt-16 md:!pb-24">
                <motion.div
                    className="text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="mb-8 relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <Image
                            src="https://i.imgur.com/TsFpBse.png"
                            alt="DeepTerrorGG Avatar"
                            width={144}
                            height={144}
                            className="rounded-full border border-[#333] shadow-2xl relative z-10"
                            priority
                        />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
                        DeepTerror<span className="text-primary">GG</span>
                    </motion.h1>
                    <motion.h2 variants={itemVariants} className="text-xl md:text-2xl text-[#888] font-mono mb-8">
                        &gt; Full Stack Engineer | Systems Architect
                    </motion.h2>
                    <motion.div variants={itemVariants} className="text-lg text-[#aaa] leading-relaxed max-w-3xl mx-auto space-y-4">
                        <p>
                            I build highly scalable, distributed systems and intelligent applications. My focus lies at the intersection of robust backend architecture and seamless, polished user experiences.
                        </p>
                        <p>
                            With a strong emphasis on security, automation, and AI integration, I specialize in transforming complex business logic into performant, maintainable codebases using modern technologies like Next.js, Node.js, and generative AI frameworks.
                        </p>
                    </motion.div>
                </motion.div>
            </SectionContainer>

            {/* Core Engineering Philosophy */}
            <SectionContainer className="!py-0 mb-32">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <Card className="bg-[#050505] border-[#1f1f1f] shadow-2xl relative overflow-hidden group">
                        {/* Glowing orb in the background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                        {/* Terminal Header */}
                        <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-4 w-4 text-[#555]" />
                                <p className="text-xs font-semibold text-[#888] tracking-widest uppercase">philosophy.sh</p>
                            </div>
                            <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/50"></div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 md:p-12 relative z-10">
                            <div className="flex items-center justify-center gap-4 mb-8">
                                <Brain aria-hidden="true" className="text-primary h-8 w-8 animate-pulse" />
                                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                                    Core Engineering Philosophy
                                </h2>
                            </div>
                            <div className="text-[#999] text-lg leading-relaxed text-center max-w-4xl mx-auto space-y-4">
                                <p className="font-mono text-sm mb-4 text-[#666] flex justify-center items-center gap-2">
                                    <span className="text-primary">~</span> ./execute_mindset.sh
                                </p>
                                <p>
                                    My approach to software engineering prioritizes <strong className="text-[#e2e2e2] font-semibold border-b border-primary/30 pb-0.5">scalability from day one</strong> and <strong className="text-[#e2e2e2] font-semibold border-b border-primary/30 pb-0.5">uncompromising security</strong>. I believe in writing code that is not only functional but also highly observable and self-healing.
                                </p>
                                <p>
                                    Whether designing a high-throughput data pipeline or integrating LLMs into a production flow, the end goal is always a resilient, developer-friendly architecture that delivers flawless user experiences without technical debt.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </SectionContainer>

            {/* Featured Architectural Work Section */}
            <SectionContainer className="mb-32">
                <motion.div
                    className="text-center mb-16"
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <h2 className="flex items-center justify-center gap-3 text-3xl font-bold text-white mb-4">
                        <Code aria-hidden="true" className="text-primary h-8 w-8" />
                        Featured Architectural Work
                    </h2>
                    <p className="text-[#888] mt-3 max-w-2xl mx-auto text-lg">My portfolio focuses on complex engineering challenges rather than simple CRUD applications.</p>
                </motion.div>

                <motion.div
                    className="flex flex-col gap-16 md:gap-24 max-w-5xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {featuredWork.map((category) => (
                        <motion.div key={category.category} variants={itemVariants} className="flex flex-col md:flex-row gap-8 md:gap-16 group/section">
                            {/* Category Header (Left Column) */}
                            <div className="md:w-1/3 flex-shrink-0">
                                <div className="sticky top-32">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 rounded-xl bg-[#111] border border-[#222] text-[#888] group-hover/section:border-primary/40 group-hover/section:bg-primary/10 group-hover/section:text-primary transition-all duration-500 shadow-inner">
                                            {React.cloneElement(category.icon as React.ReactElement, { className: "h-6 w-6" })}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">
                                            {category.category}
                                        </h3>
                                    </div>
                                    <div className="w-12 h-[2px] bg-[#222] group-hover/section:bg-primary/50 group-hover/section:w-full transition-all duration-700 ease-in-out" />
                                </div>
                            </div>

                            {/* Projects List (Right Column) */}
                            <div className="md:w-2/3 flex flex-col gap-10">
                                {category.projects.map((project, index) => (
                                    <div key={project.name} className="relative group/proj">
                                        <div className="pl-6 md:pl-8 border-l border-[#222] group-hover/proj:border-primary/30 transition-colors duration-500">
                                            {/* Animated accent dot on hover */}
                                            <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-[#333] group-hover/proj:bg-primary transition-all duration-300 group-hover/proj:shadow-[0_0_12px_rgba(var(--primary),0.8)]" />

                                            <h4 className="text-[18px] font-semibold text-[#f0f0f0] mb-3 group-hover/proj:text-primary transition-colors duration-300 flex items-center gap-3">
                                                {project.name}
                                            </h4>
                                            <p className="text-[15px] text-[#888] leading-relaxed group-hover/proj:text-[#aaa] transition-colors duration-300">
                                                {project.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </SectionContainer>

            {/* Technology Stack Section */}
            <SectionContainer>
                <div className="text-center mb-12">
                    <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-white mb-4">
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
