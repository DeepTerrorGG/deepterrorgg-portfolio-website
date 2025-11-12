
// src/app/projects/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageTitle from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { TechStack } from '@/components/ui/tech-stack';
import { ExternalLink, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import TodoList from '@/components/projects/todo-list';
import UnitConverter from '@/components/projects/unit-converter';
import Calculator3D from '@/components/projects/calculator-3d';
import SimpleTextAnimator from '@/components/projects/simple-text-animator';
import FractalRenderer from '@/components/projects/fractal-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import PomodoroTimer from '@/components/projects/pomodoro-timer';
import PasswordGenerator from '@/components/projects/password-generator';
import BmiCalculator from '@/components/projects/bmi-calculator';
import BudgetPlanner from '@/components/projects/budget-planner';
import DraggableGallery from '@/components/projects/draggable-gallery';
import GithubProfileFinder from '@/components/projects/github-profile-finder';
import MusicVisualizer from '@/components/projects/music-visualizer';
import MarkdownEditor from '@/components/projects/markdown-editor';
import WeatherApp from '@/components/projects/weather-app';
import QuizApp from '@/components/projects/quiz-app';
import StockTracker from '@/components/projects/stock-tracker';
import Spreadsheet from '@/components/projects/spreadsheet';
import AIChatbot from '@/components/projects/ai-chatbot';
import AIStoryGenerator from '@/components/projects/ai-story-generator';
import AIRecipeGenerator from '@/components/projects/ai-recipe-generator';
import AIImageGenerator from '@/components/projects/ai-image-generator';
import CodeEditor from '@/components/projects/code-editor';

interface Technology {
  name: string;
  iconSrc: string;
  href?: string;
}

interface Project {
  id: string;
  title: string;
  imageUrls: string[];
  imageAlt: string;
  imageHint: string;
  description: string;
  longDescription?: string;
  personalNote: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Community' | 'AI';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const projectsData: Project[] = [
  {
    id: 'ai-image-generator',
    title: 'AI Image Generator',
    imageUrls: ['https://i.imgur.com/3f4lJ3v.png'],
    imageAlt: 'AI Image Generator app',
    imageHint: 'ai image generator interface',
    description: 'Create unique images from text prompts using generative AI.',
    personalNote:
      "This was my first time using a text-to-image model and it was incredible to see how the AI could interpret my text prompts and turn them into art. It's a fun way to explore creativity and AI.",
    difficulty: 'AI',
    component: <AIImageGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrls: ['https://i.imgur.com/sdJjVAd.png'],
    imageAlt: 'AI Chatbot interface',
    imageHint: 'ai chatbot interface',
    description: 'A conversational AI chatbot that remembers past interactions.',
    personalNote:
      "Building a chatbot that could hold a conversation and remember what was said earlier was a great way to learn about managing conversational state. It's a fun project that shows the power of large language models.",
    difficulty: 'AI',
    component: <AIChatbot />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-recipe-generator',
    title: 'AI Recipe Generator',
    imageUrls: ['https://i.imgur.com/cWbx8fE.png'],
    imageAlt: 'AI Recipe Generator interface',
    imageHint: 'ai recipe generator app',
    description: 'Generate creative recipes based on a list of ingredients.',
    personalNote:
      'This project combines my interests in coding and cooking. It’s amazing to see how AI can take a few ingredients and come up with a full recipe. It really shows how AI can be a tool for everyday creativity.',
    difficulty: 'AI',
    component: <AIRecipeGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-story-generator',
    title: 'AI Story Generator',
    imageUrls: ['https://i.imgur.com/1Tx3iQ9.png'],
    imageAlt: 'AI Story Generator interface',
    imageHint: 'ai story generator app',
    description: 'Create unique stories with characters and settings from your imagination.',
    personalNote:
      'I love storytelling, so building a tool that could help generate creative stories was a really fun project. It’s a great example of how AI can be used as a creative partner to spark new ideas.',
    difficulty: 'AI',
    component: <AIStoryGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'code-editor',
    title: 'AI Coding Assistant',
    imageUrls: ['https://i.imgur.com/y8V3eGo.png'],
    imageAlt: 'Code editor with AI assistant',
    imageHint: 'code editor ai assistant',
    description: 'A code editor with an integrated AI assistant that can explain, refactor, and add comments to your code.',
    personalNote: 'This was a challenging but very rewarding project. Integrating an AI that can understand and manipulate code really opened my eyes to the future of software development. It feels like building a tool from the future.',
    difficulty: 'AI',
    component: <CodeEditor />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'spreadsheet',
    title: 'Web-Based Spreadsheet',
    imageUrls: ['https://i.imgur.com/A6yNZaL.png'],
    imageAlt: 'A web-based spreadsheet application',
    imageHint: 'spreadsheet application interface',
    description: 'A simplified, in-browser spreadsheet application that supports basic formulas.',
    personalNote: 'Building this project was a deep dive into complex state management and performance optimization in React. Implementing the formula parsing and cell dependency graph was a particularly rewarding challenge.',
    difficulty: 'Advanced',
    component: <Spreadsheet />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
   {
    id: 'budget-planner',
    title: 'Interactive Budget Planner',
    imageUrls: ['https://i.imgur.com/KxJk9oU.png'],
    imageAlt: 'Interactive budget planner with charts',
    imageHint: 'budget planner dashboard',
    description: 'A dynamic budget planner with interactive charts to visualize expenses.',
    personalNote: 'Building this taught me a lot about data visualization in React. Using charts to provide instant feedback on your budget makes financial tracking much more intuitive.',
    difficulty: 'Medium',
    component: <BudgetPlanner />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Recharts', iconSrc: '/icons/recharts.svg' },
    ],
    renderImage: true,
  },
   {
    id: 'github-profile-finder',
    title: 'GitHub Profile Finder',
    imageUrls: ['https://i.imgur.com/Y4EEw5S.png'],
    imageAlt: 'GitHub profile finder interface',
    imageHint: 'github profile search',
    description: 'A tool to search for GitHub users and display their profile data and repository stats.',
    personalNote: 'This was a great project for learning how to work with external APIs. It demonstrates fetching data, handling loading and error states, and displaying the results in a clean user interface.',
    difficulty: 'Medium',
    component: <GithubProfileFinder />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'draggable-gallery',
    title: 'Draggable Image Gallery',
    imageUrls: ['https://i.imgur.com/1bA0A0m.png'],
    imageAlt: 'Image gallery with drag and drop functionality',
    imageHint: 'photo gallery organizer',
    description: 'A sortable image gallery where you can reorder images using drag-and-drop.',
    personalNote: 'Implementing drag-and-drop was a fun challenge. This project taught me about handling user interactions, managing lists with complex state, and creating a more interactive user experience.',
    difficulty: 'Medium',
    component: <DraggableGallery />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'todo-list',
    title: 'To-Do List App',
    imageUrls: ['https://i.imgur.com/k4DRQvj.png'],
    imageAlt: 'To-Do List App interface',
    imageHint: 'todo list interface',
    description: 'Simple CRUD app where users can add, edit, and delete tasks. Data is saved to local storage.',
    personalNote: "A classic project to practice state management and browser storage. It's a great way to understand the fundamentals of data persistence on the client-side.",
    difficulty: 'Easy',
    component: <TodoList />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'unit-converter',
    title: 'Universal Converter',
    imageUrls: ['https://i.imgur.com/4tNf4f0.png'],
    imageAlt: 'Unit Converter interface for various measurements',
    imageHint: 'converter app interface',
    description: 'A versatile tool to convert between various units like Temperature, Length, and Weight.',
    personalNote: 'A straightforward app that is excellent for understanding controlled components, state synchronization, and handling different calculation logic in a clean way.',
    difficulty: 'Easy',
    component: <UnitConverter />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'calculator',
    title: 'Interactive Calculator',
    imageUrls: ['https://i.imgur.com/cWI9lAG.png'],
    imageAlt: 'Interactive calculator interface',
    imageHint: 'calculator interface modern',
    description: 'A sleek, interactive calculator. Perform basic arithmetic operations and see large numbers in scientific notation.',
    longDescription: 'This project showcases a fully interactive calculator featuring a clean, modern interface. It supports basic arithmetic operations and formats very large or small numbers using scientific notation to maintain display integrity.',
    personalNote: "This was the lightest project I’ve done—just a basic calculator I built mostly for practice. It gave me a chance to play around with UI design and keep intrigued. Sometimes it’s nice to take a break from the deep stuff and just create something simple and clean.",
    difficulty: 'Easy',
    component: <Calculator3D />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'pomodoro-timer',
    title: 'Pomodoro Timer',
    imageUrls: ['https://i.imgur.com/gO1o4W0.png'],
    imageAlt: 'Pomodoro Timer interface',
    imageHint: 'pomodoro timer app',
    description: 'A classic productivity timer to manage work and break sessions using the Pomodoro Technique.',
    personalNote: 'Building this timer was a great exercise in using React hooks like useEffect and useState to manage time-based state and intervals. A simple but very practical app.',
    difficulty: 'Easy',
    component: <PomodoroTimer />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    imageUrls: ['https://i.imgur.com/2s3j4b1.png'],
    imageAlt: 'Password Generator interface',
    imageHint: 'password generator tool',
    description: 'A utility to generate strong, random passwords with customizable length and character types.',
    personalNote: 'This project was fun for working with form inputs and string manipulation. It is a small but useful tool that demonstrates handling user options to generate a specific output.',
    difficulty: 'Easy',
    component: <PasswordGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'bmi-calculator',
    title: 'BMI Calculator',
    imageUrls: ['https://i.imgur.com/eE1j9uM.png'],
    imageAlt: 'BMI Calculator interface',
    imageHint: 'health calculator app',
    description: 'A simple health tool to calculate Body Mass Index (BMI) based on height and weight.',
    personalNote: 'This project involved creating a form and performing a calculation based on user input. It was a good way to practice form handling and displaying conditional results.',
    difficulty: 'Easy',
    component: <BmiCalculator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'music-visualizer',
    title: 'Audio Visualizer',
    imageUrls: ['https://i.imgur.com/5J3c4qP.png'],
    imageAlt: 'An audio visualizer with frequency bars',
    imageHint: 'audio equalizer music',
    description: 'Upload an audio file and see it visualized in real-time on an HTML canvas.',
    personalNote: 'This project was a fantastic exploration of the Web Audio API. Getting the audio processing and canvas rendering to work in sync was a fun challenge. It combines my love for music and creative coding.',
    difficulty: 'Hard',
    component: <MusicVisualizer />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'markdown-editor',
    title: 'Live Markdown Editor',
    imageUrls: ['https://i.imgur.com/y4l5A7b.png'],
    imageAlt: 'A split-screen live markdown editor',
    imageHint: 'markdown editor live preview',
    description: 'A split-screen editor to write Markdown and see the live preview instantly.',
    personalNote: 'This was a great project for learning about text processing and state management in React. It was satisfying to build a tool that I would personally use for writing documentation.',
    difficulty: 'Hard',
    component: <MarkdownEditor />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'React Markdown', iconSrc: '/icons/react-markdown.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'text-animator',
    title: 'Simple Text Animator',
    imageUrls: ['https://i.imgur.com/bPv5f6t.png'],
    imageAlt: 'Text animation tool interface',
    imageHint: 'text animation motion graphics',
    description: 'Create simple text animations like fade in/out, blink, and typewriter effects. Preview your creations instantly.',
    longDescription: 'This tool allows you to input multiple text strings, apply various animation effects globally, and see a live preview. Choose from a list of predefined animations, adjust parameters like duration or speed.',
    personalNote: "This project is a bit more complex than the calculator, and honestly, it sounded cooler in my head when I started. It was fun to build and felt a little more purposeful, but it still ended up feeling a bit too simple for my taste. Still, it was a cool learning experience.",
    difficulty: 'Medium',
    component: <SimpleTextAnimator />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'fractal-explorer',
    title: 'Interactive Fractal Explorer',
    imageUrls: ['https://i.imgur.com/Lq50HRe.png'],
    imageAlt: 'Abstract fractal visualization',
    imageHint: 'fractal abstract math visualization',
    description: 'Dive into the infinite complexity of fractals. Explore mesmerizing patterns generated by mathematical formulas.',
    longDescription: 'This interactive tool allows you to explore the Mandelbrot set, a classic example of a fractal. You can zoom, pan, adjust iterations for detail, and switch color schemes to visualize the mathematical beauty. Higher iterations reveal more intricate patterns but require more computation.',
    personalNote: 'This one’s my favorite by far. It hits that level of complexity and uniqueness that I really enjoy. There’s something about the way fractals build beauty out of patterns and depth that just feels meaningful to me. It’s definitely not perfect, but that makes me like it even more.',
    difficulty: 'Hard',
    component: <FractalRenderer />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'weather-app',
    title: 'Weather App',
    imageUrls: ['https://i.imgur.com/J3C1g9g.png'],
    imageAlt: 'Weather app showing current conditions',
    imageHint: 'weather forecast application',
    description: 'A weather app that uses geolocation to fetch and display current local weather data.',
    personalNote: 'This project was a great exercise in working with third-party APIs and handling asynchronous data. I also learned how to use the browser\'s Geolocation API to create a more personalized user experience. It\'s a classic for a reason!',
    difficulty: 'Hard',
    component: <WeatherApp />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'quiz-app',
    title: 'Interactive Quiz App',
    imageUrls: ['https://i.imgur.com/M6L1kQc.png'],
    imageAlt: 'Interactive quiz application interface',
    imageHint: 'quiz game multiple choice',
    description: 'A fun, dynamic quiz app where users can test their knowledge on a variety of topics.',
    personalNote: 'Building this quiz app taught me a lot about managing application state and user flow. It was a fun challenge to handle scoring, question progression, and showing the final results in a clean and interactive way.',
    difficulty: 'Hard',
    component: <QuizApp />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'stock-tracker',
    title: 'Real-Time Stock Tracker',
    imageUrls: ['https://i.imgur.com/W2dK7Fk.png'],
    imageAlt: 'Stock tracker dashboard with charts',
    imageHint: 'stock market dashboard',
    description: 'A dashboard that simulates tracking stock prices with real-time data updates and charts.',
    personalNote: 'This project was an excellent way to practice handling real-time data streams and data visualization. I used a mock data feed to simulate live stock updates and displayed the information using Recharts to create an interactive dashboard.',
    difficulty: 'Hard',
    component: <StockTracker />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Recharts', iconSrc: '/icons/recharts.svg' },
    ],
    renderImage: true,
  },
];

const communityProject: Project = {
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
  description: 'A Balkan Minecraft server community project with Survival, Skyblock, and Prison modes. Open for everyone to join and play.',
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
  renderImage: true,
};

const difficultyOrder = {
  'Easy': 1,
  'Medium': 2,
  'Hard': 3,
  'Advanced': 4,
  'AI': 5,
  'Community': 6,
};

const allProjects = [...projectsData, communityProject].sort((a, b) => {
  const diff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title);
});

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0].id);

  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  }, [selectedProjectId]);

  const handleLaunchProject = (project: Project) => {
    if (project.externalLink) {
      window.open(project.externalLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-orange-400',
    'Advanced': 'text-red-400',
    'AI': 'text-purple-400',
    'Community': 'text-blue-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:h-[calc(100vh-80px)]">
      {/* Left Column: Project List */}
      <div className="md:col-span-4 lg:col-span-3 border-r border-border h-full relative">
        <ScrollArea className="h-full">
          <div className="p-6">
            <PageTitle subtitle="A selection of my creative and technical endeavors." className="text-left !mb-6 !pt-0">
              My Projects
            </PageTitle>
            <ul className="space-y-1">
              {allProjects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-md transition-colors duration-200",
                      selectedProjectId === project.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className={cn("text-xs", difficultyColors[project.difficulty])}>{project.difficulty}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Project Details */}
      <div className="md:col-span-8 lg:col-span-9 h-full relative">
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            {selectedProject.component && !selectedProject.externalLink ? (
              <div className="flex-grow flex flex-col">
                {selectedProject.component}
              </div>
            ) : (
              <div className="p-4 sm:p-8 md:p-12 animate-fade-in" key={selectedProject.id}>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 bg-card">
                  <Image
                    src={selectedProject.imageUrls[0]}
                    alt={selectedProject.imageAlt}
                    fill
                    sizes="(max-width: 767px) 100vw, 60vw"
                    className="object-cover"
                    data-ai-hint={selectedProject.imageHint}
                    priority
                  />
                </div>

                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold text-foreground mb-4">{selectedProject.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{selectedProject.description}</p>
                  
                  <blockquote className="border-l-4 border-primary pl-4 py-2 my-6">
                    <p className="text-muted-foreground italic">{selectedProject.personalNote}</p>
                  </blockquote>

                  <div className="mb-8">
                    <h4 className="font-semibold text-foreground mb-3">Technologies Used</h4>
                    <TechStack technologies={selectedProject.technologies} />
                  </div>
                  
                  <Button
                    onClick={() => handleLaunchProject(selectedProject)}
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

    