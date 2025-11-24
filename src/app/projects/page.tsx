
// src/app/projects/page.tsx
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PageTitle from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { TechStack } from '@/components/ui/tech-stack';
import { ExternalLink, Rocket, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { DoomIcon } from '@/components/icons/doom';

// Dynamically import all project components
const TodoList = dynamic(() => import('@/components/projects/todo-list'), { loading: () => <ProjectLoader /> });
const UnitConverter = dynamic(() => import('@/components/projects/unit-converter'), { loading: () => <ProjectLoader /> });
const Calculator3D = dynamic(() => import('@/components/projects/calculator-3d'), { loading: () => <ProjectLoader /> });
const SimpleTextAnimator = dynamic(() => import('@/components/projects/simple-text-animator'), { loading: () => <ProjectLoader /> });
const FractalRenderer = dynamic(() => import('@/components/projects/fractal-renderer'), { loading: () => <ProjectLoader /> });
const PomodoroTimer = dynamic(() => import('@/components/projects/pomodoro-timer'), { loading: () => <ProjectLoader /> });
const PasswordGenerator = dynamic(() => import('@/components/projects/password-generator'), { loading: () => <ProjectLoader /> });
const BmiCalculator = dynamic(() => import('@/components/projects/bmi-calculator'), { loading: () => <ProjectLoader /> });
const BudgetPlanner = dynamic(() => import('@/components/projects/budget-planner'), { loading: () => <ProjectLoader /> });
const GithubProfileFinder = dynamic(() => import('@/components/projects/github-profile-finder'), { loading: () => <ProjectLoader /> });
const BeatMaker = dynamic(() => import('@/components/projects/beat-maker'), { loading: () => <ProjectLoader /> });
const MarkdownEditor = dynamic(() => import('@/components/projects/markdown-editor'), { loading: () => <ProjectLoader /> });
const WeatherApp = dynamic(() => import('@/components/projects/weather-app'), { loading: () => <ProjectLoader /> });
const AIVideoGenerator = dynamic(() => import('@/components/projects/ai-video-generator'), { loading: () => <ProjectLoader /> });
const StockTracker = dynamic(() => import('@/components/projects/stock-tracker'), { loading: () => <ProjectLoader /> });
const Spreadsheet = dynamic(() => import('@/components/projects/spreadsheet'), { loading: () => <ProjectLoader /> });
const AIChatbot = dynamic(() => import('@/components/projects/ai-chatbot'), { loading: () => <ProjectLoader /> });
const AIStoryGenerator = dynamic(() => import('@/components/projects/ai-story-generator'), { loading: () => <ProjectLoader /> });
const AIRecipeGenerator = dynamic(() => import('@/components/projects/ai-recipe-generator'), { loading: () => <ProjectLoader /> });
const AIImageGenerator = dynamic(() => import('@/components/projects/ai-image-generator'), { loading: () => <ProjectLoader /> });
const CodeEditor = dynamic(() => import('@/components/projects/code-editor'), { loading: () => <ProjectLoader /> });
const TicTacToe = dynamic(() => import('@/components/projects/tic-tac-toe'), { loading: () => <ProjectLoader /> });
const RockPaperScissors = dynamic(() => import('@/components/projects/rock-paper-scissors'), { loading: () => <ProjectLoader /> });
const ThePasswordGame = dynamic(() => import('@/components/projects/the-password-game'), { loading: () => <ProjectLoader /> });
const AIInfinityCraft = dynamic(() => import('@/components/projects/ai-infinity-craft'), { loading: () => <ProjectLoader /> });
const AudioVisualizer = dynamic(() => import('@/components/projects/audio-visualizer'), { loading: () => <ProjectLoader /> });
const CharacterCounter = dynamic(() => import('@/components/projects/character-counter'), { loading: () => <ProjectLoader /> });
const CollaborativeWhiteboard = dynamic(() => import('@/components/projects/collaborative-whiteboard'), { loading: () => <ProjectLoader /> });
const KanbanBoard = dynamic(() => import('@/components/projects/kanban-board'), { loading: () => <ProjectLoader /> });
const PixelEditor = dynamic(() => import('@/components/projects/pixel-editor'), { loading: () => <ProjectLoader /> });
const AIPromptEnhancer = dynamic(() => import('@/components/projects/ai-prompt-enhancer'), { loading: () => <ProjectLoader /> });
const TurnBasedStrategy = dynamic(() => import('@/components/projects/turn-based-strategy'), { loading: () => <ProjectLoader /> });
const FactorySimulator = dynamic(() => import('@/components/projects/factory-simulator'), { loading: () => <ProjectLoader /> });
const DeckBuildingRoguelike = dynamic(() => import('@/components/projects/deck-building-roguelike'), { loading: () => <ProjectLoader /> });
const IdleClickerGame = dynamic(() => import('@/components/projects/idle-clicker-game'), { loading: () => <ProjectLoader /> });
const DoomEmulator = dynamic(() => import('@/components/projects/doom-emulator'), { loading: () => <ProjectLoader /> });
const DownDetectorDetector = dynamic(() => import('@/components/projects/down-detector-detector'), { loading: () => <ProjectLoader /> });
const UselessUiPlayground = dynamic(() => import('@/components/projects/useless-ui-playground'), { loading: () => <ProjectLoader /> });
const ScreenshotService = dynamic(() => import('@/components/projects/screenshot-service'), { loading: () => <ProjectLoader /> });
const WebsiteStatusChecker = dynamic(() => import('@/components/projects/website-status-checker'), { loading: () => <ProjectLoader /> });
const SortingVisualizer = dynamic(() => import('@/components/projects/sorting-visualizer'), { loading: () => <ProjectLoader /> });
const EcommerceDashboard = dynamic(() => import('@/app/dashboard/page'), { loading: () => <ProjectLoader /> });
const CodeBeautifier = dynamic(() => import('@/components/projects/code-beautifier'), { loading: () => <ProjectLoader /> });
const SpotifyPlaylistGenerator = dynamic(() => import('@/components/projects/spotify-playlist-generator'), { loading: () => <ProjectLoader /> });
const SpeedTester = dynamic(() => import('@/components/projects/speed-tester'), { loading: () => <ProjectLoader /> });
const PathfindingVisualizer = dynamic(() => import('@/components/projects/pathfinding-visualizer'), { loading: () => <ProjectLoader /> });
const AsciiWebcam = dynamic(() => import('@/components/projects/ascii-webcam'), { loading: () => <ProjectLoader /> });
const TierListMaker = dynamic(() => import('@/components/projects/tier-list/tier-list-maker'), { loading: () => <ProjectLoader /> });
const MemeStockMarket = dynamic(() => import('@/components/projects/meme-stock-market'), { loading: () => <ProjectLoader /> });
const CodeRacer = dynamic(() => import('@/components/projects/code-racer'), { loading: () => <ProjectLoader /> });
const TimeCapsuleProject = dynamic(() => import('@/components/projects/time-capsule'), { loading: () => <ProjectLoader /> });


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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'AI' | 'Community' | 'Meme';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const ProjectLoader = () => (
    <div className="flex h-full w-full items-center justify-center bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const projectsData: Project[] = [
    {
      id: 'time-capsule',
      title: 'Digital Time Capsule',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A digital time capsule interface',
      imageHint: 'time capsule future message',
      description: 'Leave an encrypted message for the future that can only be unlocked after a specific date.',
      personalNote: 'This project is a fascinating blend of sentimentality and security. The challenge lies in creating a secure "gatekeeper" API that respects the unlock date while ensuring the client-side encryption is robust. It\'s a promise to the future, written in code.',
      difficulty: 'Advanced',
      component: <TimeCapsuleProject />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'crypto-js', iconSrc: '/icons/lock.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'code-racer',
      title: 'Code Racer',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A code typing game interface',
      imageHint: 'code typing game speed',
      description: 'A competitive typing game where you race against others by typing actual code snippets as fast as you can.',
      personalNote: 'This project is a fun way to practice typing accuracy and speed with real-world code. It uses the Monaco editor, the same engine that powers VS Code, to provide an authentic coding feel. The next step is to add real-time multiplayer ghosts!',
      difficulty: 'Advanced',
      component: <CodeRacer />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Monaco Editor', iconSrc: '/icons/vscode.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'meme-stock-market',
      title: 'Meme Stock Market',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A meme stock market interface with charts',
      imageHint: 'meme stock market chart',
      description: 'A parody financial app where you invest fake money in meme templates. Prices fluctuate based on simulated demand.',
      personalNote: 'This project is a fun take on stock trading, built with a real-time feel. It uses client-side logic to simulate a volatile market, making for an engaging and humorous experience. The next step is to connect it to a real database like Supabase for live, multiplayer trading.',
      difficulty: 'Hard',
      component: <MemeStockMarket />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Recharts', iconSrc: '/icons/recharts.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'tier-list-maker',
      title: 'Community Tier List Maker',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A tier list maker interface for ranking items',
      imageHint: 'tier list ranking chart',
      description: 'Create and share your own tier lists. Drag and drop items into S, A, B, C, or D tiers.',
      personalNote: 'This project was a fun challenge in creating a smooth and intuitive drag-and-drop interface with React. The next step is to add a database to save rankings and create a global community-voted master list.',
      difficulty: 'Advanced',
      component: <TierListMaker />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: '@dnd-kit', iconSrc: '/icons/dnd-kit.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      ],
      renderImage: true,
    },
    {
        id: 'ascii-webcam',
        title: 'Retro ASCII Webcam',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'A webcam feed rendered in ASCII characters',
        imageHint: 'webcam ascii art matrix',
        description: 'Renders your webcam feed in real-time using ASCII characters for a retro, hacker aesthetic.',
        personalNote: 'This project is a fun intersection of modern browser APIs and old-school visuals. The main challenge is processing video frames efficiently to create a smooth, real-time effect without lagging the browser.',
        difficulty: 'Hard',
        component: <AsciiWebcam />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'HTML5 Canvas', iconSrc: '/icons/html5.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        ],
        renderImage: true,
    },
     {
        id: 'pathfinding-visualizer',
        title: 'Pathfinding Visualizer',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'A grid with a visualized pathfinding algorithm',
        imageHint: 'grid algorithm pathfinding',
        description: 'Watch algorithms like Dijkstra\'s find the shortest path through a maze you create.',
        personalNote: 'This is a classic computer science project that\'s incredibly satisfying to watch. It makes abstract graph traversal algorithms tangible and visual, which I find very cool.',
        difficulty: 'Hard',
        component: <PathfindingVisualizer />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        ],
        renderImage: true,
    },
    {
        id: 'speed-tester',
        title: 'Speed Tester',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'Speed tester for CPS and keyboard WPM',
        imageHint: 'speed test keyboard mouse',
        description: 'A simple app to test your clicks-per-second and typing speed (WPM).',
        personalNote: 'This is a fun, classic project to measure and improve your input speed. It provides instant feedback and is a great way to warm up or compete with friends.',
        difficulty: 'Easy',
        component: <SpeedTester />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        ],
        renderImage: true,
    },
    {
        id: 'spotify-playlist-generator',
        title: 'Vibe-Based Spotify Playlist Generator',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'Spotify playlist generator interface',
        imageHint: 'spotify music playlist',
        description: 'Generates playlists based on weather, location, or a specific color using the Spotify API.',
        personalNote: 'This project combines several APIs to create a unique music discovery experience. It handles OAuth for Spotify, fetches external data for "vibes", and uses it all to curate a personalized playlist.',
        difficulty: 'Advanced',
        component: <SpotifyPlaylistGenerator />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
            { name: 'Spotify API', iconSrc: '/icons/spotify.svg' },
            { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
        ],
        renderImage: true,
    },
    {
        id: 'ecommerce-dashboard',
        title: 'E-commerce Dashboard',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'E-commerce dashboard with charts and tables',
        imageHint: 'dashboard charts data',
        description: 'A mock e-commerce admin dashboard with data tables, charts, and key metrics.',
        personalNote: 'This project is a great demonstration of handling complex data, creating professional-looking UIs with charts and tables, and managing a more "enterprise-level" application state.',
        difficulty: 'Advanced',
        component: <EcommerceDashboard />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
            { name: 'Recharts', iconSrc: '/icons/recharts.svg' },
            { name: '@tanstack/table', iconSrc: '/icons/react-query.svg' },
        ],
        renderImage: true,
    },
    {
        id: 'sorting-visualizer',
        title: 'Sorting Algorithm Visualizer',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'Sorting algorithm visualizer with bars',
        imageHint: 'bar chart data algorithm',
        description: 'Watch sorting algorithms like Bubble Sort, Merge Sort, and Quick Sort in action with this interactive visualizer.',
        personalNote: 'This project is a great way to understand computer science fundamentals. It makes abstract algorithms tangible and even a bit mesmerizing to watch, especially with the sound effects.',
        difficulty: 'Hard',
        component: <SortingVisualizer />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        ],
        renderImage: true,
    },
    {
        id: 'website-status-checker',
        title: 'Website Status Checker',
        imageUrls: ['/placeholder.png'],
        imageAlt: 'Website status checker interface',
        imageHint: 'uptime monitor website status',
        description: 'Enter a URL to check if a website is down for just you or for everyone, with pings from multiple global regions.',
        personalNote: 'A classic developer utility. It\'s a practical project that demonstrates understanding of network requests and presenting status information clearly.',
        difficulty: 'Medium',
        component: <WebsiteStatusChecker />,
        technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
        ],
        renderImage: true,
    },
    {
    id: 'useless-ui-playground',
    title: 'Useless UI Playground',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A collection of intentionally bad user interface elements',
    imageHint: 'bad UI UX design',
    description: 'A satirical collection of intentionally terrible user interface elements. How many can you conquer?',
    personalNote: 'This project is a fun way to explore the principles of good design by showcasing the absolute worst. It\'s a playground of UI anti-patterns that developers and designers will find painfully amusing.',
    difficulty: 'Meme',
    component: <UselessUiPlayground />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'down-detector-detector',
    title: 'Down Detector Detector',
    imageUrls: ['/placeholder.png'],
    imageHint: 'server status meta',
    imageAlt: 'A status page checking if a status page is down',
    description: 'A meta-joke project that "checks" if the popular service Downdetector is itself down.',
    personalNote: 'This is a classic developer meme. It\'s a fun, simple project that pokes fun at the infinite layers of infrastructure we rely on. Who detects the detectors?',
    difficulty: 'Meme',
    component: <DownDetectorDetector />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'doom-emulator',
    title: 'DOOM (1993) Emulator',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'DOOM (1993) gameplay screenshot',
    imageHint: 'doom game retro',
    description: 'A playable, embedded version of the original 1993 DOOM. Rip and tear, until it is done.',
    personalNote: 'This is a classic programming meme for a reason. Getting legacy software like Doom to run in a modern web browser is a fun challenge. This version uses an embedded DOS emulator to prove that, yes, it can run on anything—even this portfolio.',
    difficulty: 'Meme',
    component: <DoomEmulator />,
    technologies: [
      { name: 'DOSBox', iconSrc: '/icons/dosbox.svg' },
      { name: 'JavaScript', iconSrc: '/icons/javascript.svg' },
      { name: 'React', iconSrc: '/icons/react.svg' },
    ],
    renderImage: true,
  },
    {
    id: 'deck-building-roguelike',
    title: 'Deck-Builder Adventure',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A hand of cards in a roguelike game',
    imageHint: 'deck building card game',
    description: 'A single-player card game where you build a powerful deck to battle through a procedurally generated map.',
    personalNote: 'This combines two of my favorite genres. It\'s a huge challenge in system design—creating a flexible system for cards, enemies, and map progression is the core of making it fun and replayable.',
    difficulty: 'Advanced',
    component: <DeckBuildingRoguelike />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'factory-simulator',
    title: 'Automation Simulator',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A top-down factory with conveyor belts',
    imageHint: 'factory automation game',
    description: 'A game about building and optimizing automated factories, from simple miners to complex assembly lines.',
    personalNote: 'The complexity of managing the state for thousands of items moving on belts and being processed by machines is a fascinating challenge. It\'s a test of performance optimization and state management.',
    difficulty: 'Advanced',
    component: <FactorySimulator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'turn-based-strategy',
    title: 'Grid-Based Strategy Game',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A grid-based tactical game with units',
    imageHint: 'strategy game grid',
    description: 'Command a squad of units on a grid in turn-based combat, inspired by classics like Fire Emblem and Advance Wars.',
    personalNote: 'This project is a great way to dive into game algorithms like pathfinding for movement and creating a simple AI for the opponent. It forces you to think strategically, both as a player and a developer.',
    difficulty: 'Advanced',
    component: <TurnBasedStrategy />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'kanban-board',
    title: 'Project Management Board',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A Kanban-style project management board',
    imageHint: 'kanban board project management',
    description: 'A Trello-like board with draggable cards to manage tasks across different stages of a workflow.',
    personalNote: 'This project was a fantastic exercise in complex state management and user interaction. Implementing smooth drag-and-drop functionality using native browser APIs and ensuring the state updates correctly was a rewarding challenge.',
    difficulty: 'Advanced',
    component: <KanbanBoard />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
       { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'pixel-editor',
    title: 'Pixel Art Editor',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A pixel art editor interface',
    imageHint: 'pixel art editor drawing',
    description: 'A simple browser-based editor for creating and exporting pixel art with basic tools like a pencil, eraser, and color palette.',
    personalNote: 'Building this felt like creating a mini-Photoshop. It was a deep dive into handling the HTML canvas, managing pixel data in a grid, and implementing core drawing tool logic. It really highlights how much complexity can go into seemingly simple creative tools.',
    difficulty: 'Advanced',
    component: <PixelEditor />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'collaborative-whiteboard',
    title: 'Real-Time Collaborative Whiteboard',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A real-time collaborative whiteboard interface',
    imageHint: 'whiteboard collaboration drawing',
    description: 'A shared digital canvas where multiple users can draw and diagram in real-time with AI-assisted features.',
    personalNote: 'This is a highly complex project that combines real-time data synchronization using Firestore with a custom HTML canvas rendering engine. The AI-assisted diagramming feature, which will neaten up sketches, represents a practical and impressive use of generative AI.',
    difficulty: 'Advanced',
    component: <CollaborativeWhiteboard />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'code-beautifier',
    title: 'Code Beautifier',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'Code beautifier app for creating images of code',
    imageHint: 'code snippet image generator',
    description: 'Turn your code snippets into beautiful, shareable images.',
    personalNote: 'I\'ve always admired tools like Carbon that make sharing code on social media look great. This was my take on it, using a Next.js API route with @vercel/og to generate the final image from simple HTML.',
    difficulty: 'AI',
    component: <CodeBeautifier />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: '@vercel/og', iconSrc: '/icons/vercel.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-prompt-enhancer',
    title: 'AI Prompt Enhancer',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'AI prompt enhancer interface',
    imageHint: 'ai prompt engineering tool',
    description: 'An AI-powered tool to take your basic ideas and transform them into detailed, effective prompts for large language models.',
    personalNote: 'Crafting good prompts is an art. This tool is designed to help with that process by leveraging an AI to think about the details you might miss. It was a fun meta-project—using AI to help users use AI better!',
    difficulty: 'AI',
    component: <AIPromptEnhancer />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-infinity-craft',
    title: 'AI Infinity Craft',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'AI Infinity Craft game interface',
    imageHint: 'crafting game alchemy',
    description: 'A creative crafting game where you combine elements to discover new ones, powered by AI.',
    personalNote: 'This project was a fascinating exploration into using AI for emergent gameplay. The AI acts as the "game engine" for discovery, leading to surprising and creative combinations. It shows how generative AI can create truly dynamic and unpredictable experiences.',
    difficulty: 'AI',
    component: <AIInfinityCraft />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-password-game',
    title: 'The AI Password Game',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'AI Password Game interface',
    imageHint: 'password game security',
    description: 'A game where you must create a password that follows an increasingly absurd set of rules, some generated by an AI.',
    personalNote: 'This was an incredibly fun project that combines complex validation logic with creative AI. It shows how AI can be used to make even a simple concept like a password field into something unpredictable and entertaining.',
    difficulty: 'AI',
    component: <ThePasswordGame />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
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
    id: 'ai-video-generator',
    title: 'AI Video Generator',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'AI video generator interface',
    imageHint: 'ai video generator app',
    description: 'Generate short video clips from text prompts using the Veo model.',
    personalNote: 'This was an exciting project to explore the cutting-edge of generative AI. The process is asynchronous and can take time, which presented interesting UI/UX challenges for managing loading and progress states.',
    difficulty: 'AI',
    component: <AIVideoGenerator />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
        { name: 'Google Veo', iconSrc: '/icons/gemini.svg'}
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
    id: 'idle-clicker-game',
    title: 'Idle Clicker Game',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'Idle clicker game interface',
    imageHint: 'clicker game interface upgrades',
    description: 'A satisfying idle game where you click to earn points and buy upgrades to automate the process.',
    personalNote: 'This was a fun exercise in managing state over time and using local storage to create a persistent experience. It\'s rewarding to watch the numbers go up!',
    difficulty: 'Medium',
    component: <IdleClickerGame />,
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
    id: 'tic-tac-toe',
    title: 'Tic-Tac-Toe vs. AI',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'Tic-Tac-Toe game against an AI',
    imageHint: 'tic tac toe game',
    description: 'A classic game of Tic-Tac-Toe where you can test your skills against a computer opponent with multiple difficulty levels.',
    personalNote: 'Implementing the game logic and different AI difficulties was a fun challenge. The "Hard" mode is beatable, but it makes you think! This project was a great exercise in algorithms and state management.',
    difficulty: 'Medium',
    component: <TicTacToe />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock, Paper, Scissors vs. AI',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'Rock, Paper, Scissors game against an AI',
    imageHint: 'rock paper scissors game',
    description: 'Play Rock, Paper, Scissors against an AI that adapts to your play style on "Adaptive" mode.',
    personalNote: 'This was more than just a game of chance. Building the "Adaptive" AI that learns from the player\'s moves was a fascinating challenge in simple pattern recognition. It shows how even a simple game can have complex logic.',
    difficulty: 'Medium',
    component: <RockPaperScissors />,
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
    id: 'character-counter',
    title: 'Character Counter',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A character and word counter tool',
    imageHint: 'text utility counter',
    description: 'A simple utility to count characters, words, and lines in a piece of text.',
    personalNote: 'This is a fundamental tool for any writer or developer. It was a good exercise in handling text input and using the `useMemo` hook to efficiently calculate statistics as the user types.',
    difficulty: 'Easy',
    component: <CharacterCounter />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'beat-maker',
    title: 'Interactive Beat Maker',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'An interactive beat maker with a step sequencer',
    imageHint: 'beat maker music sequencer',
    description: 'Create your own drum patterns with a 16-step sequencer and synthesized sounds.',
    personalNote: 'This was a deep dive into the Web Audio API. Generating sounds from scratch and syncing them perfectly in a scheduler taught me a ton about browser-based timing and audio synthesis. It\'s a fun blend of creativity and technical logic.',
    difficulty: 'Hard',
    component: <BeatMaker />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'audio-visualizer',
    title: 'Audio Visualizer',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'A real-time audio visualizer',
    imageHint: 'audio spectrum waveform',
    description: 'Visualizes an audio file in real-time using a canvas element.',
    personalNote: 'This project was a great introduction to the Web Audio API. It taught me how to analyze audio frequency data from a file and render it dynamically on a canvas. A fun way to "see" sound.',
    difficulty: 'Hard',
    component: <AudioVisualizer />,
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
  {
    id: 'screenshot-service',
    title: 'Screenshot Service',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'Screenshot service app interface',
    imageHint: 'website screenshot tool',
    description: 'Enter a URL to capture a screenshot of any website.',
    personalNote: 'A simple but very satisfying utility to build. It shows how a frontend application can interact with a backend service (even a third-party one) to perform a useful action.',
    difficulty: 'Easy',
    component: <ScreenshotService />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
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
  'Meme': 6,
  'Community': 7,
};

const allProjects = [...projectsData, communityProject].sort((a, b) => {
  const diff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  if (diff !== 0) return diff;
  return a.title.localeCompare(b.title);
});

const ProjectDetailContent = ({ project }: { project: Project }) => {
    const handleLaunchProject = (proj: Project) => {
        if (proj.externalLink) {
            window.open(proj.externalLink, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">{project.title}</h2>
            <p className="text-muted-foreground text-lg mb-6">{project.description}</p>
            
            <blockquote className="border-l-4 border-primary pl-4 py-2 my-6">
                <p className="text-muted-foreground italic">{project.personalNote}</p>
            </blockquote>

            <div className="mb-8">
                <h4 className="font-semibold text-foreground mb-3">Technologies Used</h4>
                <TechStack technologies={project.technologies} />
            </div>

            {project.externalLink && (
                 <Button
                    onClick={() => handleLaunchProject(project)}
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </Button>
            )}
        </div>
    )
};


export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0].id);
  const [mobileProject, setMobileProject] = useState<Project | null>(null);

  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  }, [selectedProjectId]);
  
  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-orange-400',
    'Advanced': 'text-red-400',
    'AI': 'text-purple-400',
    'Community': 'text-blue-400',
    'Meme': 'text-pink-400',
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(project.id);
    setMobileProject(project);
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      {/* Mobile View: Full-screen list, dialog for details */}
      <div className="md:hidden flex flex-col h-full">
        <PageTitle subtitle="A selection of my creative and technical endeavors." className="!pt-6 !mb-6">
          My Projects
        </PageTitle>
        <ScrollArea className="flex-grow">
          <ul className="space-y-2 p-4">
            {allProjects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => handleProjectSelect(project)}
                  className="w-full text-left p-4 rounded-lg transition-colors duration-200 bg-card border hover:bg-muted"
                >
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className={cn("text-xs font-medium", difficultyColors[project.difficulty])}>{project.difficulty}</p>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        {mobileProject && (
          <Dialog open={!!mobileProject} onOpenChange={(isOpen) => !isOpen && setMobileProject(null)}>
             <DialogContent className="p-0 sm:p-0 w-screen h-screen max-w-full max-h-full sm:max-w-full sm:max-h-full rounded-none sm:rounded-none flex flex-col" hideDefaultClose>
              <DialogHeader className="p-4 border-b flex-row items-center space-y-0 shrink-0">
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                      <span className="sr-only">Back</span>
                    </Button>
                  </DialogClose>
                  <DialogTitle className="flex-grow text-center pr-10">{mobileProject.title}</DialogTitle>
                   <DialogDescription className="sr-only">{mobileProject.description}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow min-h-0">
                <Suspense fallback={<ProjectLoader/>}>
                    {mobileProject.component}
                </Suspense>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Desktop View: Two-column layout */}
      <div className="hidden md:flex flex-row flex-grow h-full overflow-hidden">
        {/* Left Column: Project List */}
        <div className="w-1/3 max-w-sm border-r border-border flex flex-col h-full">
          <div className="p-6 border-b shrink-0">
            <PageTitle subtitle="A selection of my creative and technical endeavors." className="text-left !mb-0 !pt-0">
              My Projects
            </PageTitle>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <ul className="space-y-1 p-4">
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
          </ScrollArea>
        </div>

        {/* Right Column: Project Details */}
        <div className="flex-1 flex flex-col h-full">
          <ScrollArea className="flex-1 w-full h-full">
            <div className="flex flex-col h-full animate-fade-in">
              {selectedProject.component ? (
                <div className="flex-grow flex flex-col h-full">
                  <Suspense fallback={<ProjectLoader />}>
                    <div className="flex-grow">{selectedProject.component}</div>
                  </Suspense>
                  <div className="p-4 sm:p-8 md:p-12 border-t bg-background shrink-0">
                    <ProjectDetailContent project={selectedProject} />
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-8 md:p-12">
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
                  <ProjectDetailContent project={selectedProject} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
