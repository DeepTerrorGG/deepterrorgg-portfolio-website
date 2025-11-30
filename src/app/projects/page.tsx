// src/app/projects/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

// Statically import all project components
import TodoList from '@/components/projects/todo-list';
import UnitConverter from '@/components/projects/unit-converter';
import Calculator3D from '@/components/projects/calculator-3d';
import SimpleTextAnimator from '@/components/projects/simple-text-animator';
import FractalRenderer from '@/components/projects/fractal-renderer';
import PomodoroTimer from '@/components/projects/pomodoro-timer';
import PasswordGenerator from '@/components/projects/password-generator';
import BmiCalculator from '@/components/projects/bmi-calculator';
import BudgetPlanner from '@/components/projects/budget-planner';
import GithubProfileFinder from '@/components/projects/github-profile-finder';
import BeatMaker from '@/components/projects/beat-maker';
import MarkdownEditor from '@/components/projects/markdown-editor';
import WeatherApp from '@/components/projects/weather-app';
import StockTracker from '@/components/projects/stock-tracker';
import Spreadsheet from '@/components/projects/spreadsheet';
import TicTacToe from '@/components/projects/tic-tac-toe';
import RockPaperScissors from '@/components/projects/rock-paper-scissors';
import CharacterCounter from '@/components/projects/character-counter';
import CollaborativeWhiteboard from '@/components/projects/collaborative-whiteboard';
import PixelEditor from '@/components/projects/pixel-editor';
import TurnBasedStrategy from '@/components/projects/turn-based-strategy';
import DeckBuildingRoguelike from '@/components/projects/deck-building-roguelike';
import IdleClickerGame from '@/components/projects/idle-clicker-game';
import DoomEmulator from '@/components/projects/doom-emulator';
import DownDetectorDetector from '@/components/projects/down-detector-detector';
import UselessUiPlayground from '@/components/projects/useless-ui-playground';
import ScreenshotService from '@/components/projects/screenshot-service';
import WebsiteStatusChecker from '@/components/projects/website-status-checker';
import SortingVisualizer from '@/components/projects/sorting-visualizer';
import EcommerceDashboard from '@/app/dashboard/page';
import InventoryDashboard from '@/components/projects/inventory-dashboard/inventory-dashboard';
import SpotifyPlaylistGenerator from '@/components/projects/spotify-playlist-generator';
import SpeedTester from '@/components/projects/speed-tester';
import PathfindingVisualizer from '@/components/projects/pathfinding-visualizer';
import AsciiWebcam from '@/components/projects/ascii-webcam';
import CodeRacer from '@/components/projects/code-racer';
import TimeCapsuleProject from '@/components/projects/time-capsule';
import InfiniteCanvas from '@/components/projects/infinite-canvas';
import GitHistoryVisualizer from '@/components/projects/githistory-visualizer';
import VoiceControlledTetris from '@/components/projects/voice-controlled-tetris';
import FractalTree from '@/components/projects/fractal-tree';
import BinaryVsLinearSearch from '@/components/projects/binary-vs-linear-search';
import SudokuSolver from '@/components/projects/sudoku-solver';
import ConnectFour from '@/components/projects/connect-four';
import MemoryMatrix from '@/components/projects/memory-matrix';
import BookingCalendar from '@/components/projects/booking-calendar';
import ThisDayInHistory from '@/components/projects/this-day-in-history';
import DigitalAssetManager from '@/components/projects/digital-asset-manager';
import PaymentLedger from '@/components/projects/payment-ledger';
import LogIngestor from '@/components/projects/log-ingestor';
import HeadlessCms from '@/components/projects/headless-cms';
import DistributedFractalExplorer from '@/components/projects/distributed-fractal-explorer';

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
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
  technologies: Technology[];
}

const projectsData: Project[] = [
    {
      id: 'distributed-fractal-explorer',
      title: 'Distributed Fractal Explorer',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'Distributed fractal rendering',
      imageHint: 'fractal distributed computing',
      description: 'A distributed computing project where every visitor helps render a small piece of a massive fractal.',
      personalNote: 'This is an ambitious project inspired by SETI@home. It uses Firestore as a job queue. Visitors act as workers, claiming a "tile" to render via a serverless function, processing it in a web worker, and submitting it back. It\'s a full-stack showcase of distributed systems thinking.',
      difficulty: 'Advanced',
      component: <DistributedFractalExplorer />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'Web Workers', iconSrc: '/icons/javascript.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'headless-cms',
      title: 'Headless CMS',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A headless content management system dashboard',
      imageHint: 'cms dashboard schema',
      description: 'A tool like Contentful or Strapi. Define content types (e.g., "Blog Post") and the API endpoints are auto-generated.',
      personalNote: 'This is a great project for agencies. It shows an understanding of database schemas, dynamic API generation, and role-based access control. A meta-schema defines content types, and a single API engine serves content dynamically.',
      difficulty: 'Advanced',
      component: <HeadlessCms />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'log-ingestor',
      title: 'Real-Time Log Ingestor',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A real-time log ingestion pipeline dashboard',
      imageHint: 'log pipeline dashboard',
      description: 'A dashboard that displays real-time logs from across the application, demonstrating a scalable system architecture for handling streaming data.',
      personalNote: 'This project is a real, functioning logging system. Other parts of this portfolio, like page navigations and AI actions, generate logs that are written to Firestore. This dashboard then displays those logs live, showcasing an understanding of real-time data flow and system observability.',
      difficulty: 'Hard',
      component: <LogIngestor />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'payment-ledger',
      title: 'Payment Ledger Simulation',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A payment ledger showing double-entry bookkeeping',
      imageHint: 'payment ledger bank backend',
      description: 'A simulation of a banking backend using double-entry bookkeeping to ensure transactional integrity.',
      personalNote: 'This project demonstrates a critical backend concept: how to handle financial transactions safely. It simulates ACID-compliant operations using client-side state, preventing issues like "double-spending" through idempotency checks. It is a vital showcase of understanding the logic required for reliable and robust systems.',
      difficulty: 'Advanced',
      component: <PaymentLedger />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'digital-asset-manager',
      title: 'Digital Asset Manager',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A file management system with folders and files',
      imageHint: 'file manager cloud storage',
      description: 'A Google Drive clone where you can upload files, create folders, and share links.',
      personalNote: 'This project was a deep dive into handling file uploads and asynchronous operations. Building the recursive folder structure was a fun challenge that really tested my understanding of React components. It also demonstrates key skills in working with cloud storage and managing binary data.',
      difficulty: 'Advanced',
      component: <DigitalAssetManager />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'inventory-dashboard',
      title: 'Inventory Management Dashboard',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'Inventory dashboard with charts and product tables',
      imageHint: 'dashboard inventory management',
      description: 'A data-heavy dashboard for managing warehouse inventory, products, and suppliers.',
      personalNote: 'This project is a powerful demonstration of handling complex, real-world data scenarios. It uses TanStack Table for a fully-featured data grid (sorting, filtering, pagination) and Recharts for data visualization, which are essential skills for most web development jobs.',
      difficulty: 'Advanced',
      component: <InventoryDashboard />,
      technologies: [
            { name: 'React', iconSrc: '/icons/react.svg' },
            { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
            { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
            { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
            { name: 'Recharts', iconSrc: '/icons/recharts.svg' },
            { name: '@tanstack/table', iconSrc: '/icons/react-query.svg' },
            { name: 'Faker.js', iconSrc: '/icons/faker.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'booking-calendar',
      title: 'Booking & Scheduling App',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A booking calendar interface',
      imageHint: 'booking calendar schedule',
      description: 'A Calendly-like app to manage availability and let others book 30-minute slots.',
      personalNote: 'Handling timezones, overlapping slots, and generating availability is a notoriously difficult part of web development. This project demonstrates how to manage those complexities using a date library and a simulated backend.',
      difficulty: 'Hard',
      component: <BookingCalendar />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'date-fns', iconSrc: '/icons/date-fns.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'memory-matrix',
      title: 'Memory Matrix',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A memory matrix game grid',
      imageHint: 'memory game grid pattern',
      description: 'A pattern of tiles will flash. Test your memory by repeating the sequence. Each round gets longer!',
      personalNote: 'This is a great exercise in managing game state and timed, asynchronous events in React. The challenge is handling the different phases (watching, repeating) and giving the user clear feedback.',
      difficulty: 'Medium',
      component: <MemoryMatrix />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'connect-four',
      title: 'Connect 4',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'Connect 4 game board',
      imageHint: 'connect four board game',
      description: 'The classic two-player game. Drop your pieces into the grid and try to get four in a row before your opponent does.',
      personalNote: 'This was a great exercise in algorithm design. The "gravity" logic for dropping pieces and, especially, the win-detection logic for checking all possible four-in-a-row combinations, were fun challenges to solve efficiently.',
      difficulty: 'Easy',
      component: <ConnectFour />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'sudoku-solver',
      title: 'Sudoku Solver Visualization',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A Sudoku board being solved by an algorithm',
      imageHint: 'sudoku board algorithm',
      description: 'Watch a backtracking algorithm solve a Sudoku puzzle in real-time, visualizing its "thinking" process as it tries and retracts numbers.',
      personalNote: 'This project is a great way to understand recursion and backtracking. Using a generator function to `yield` each step of the algorithm to React for rendering was a fun and powerful technique for visualizing complex logic.',
      difficulty: 'Advanced',
      component: <SudokuSolver />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'binary-vs-linear-search',
      title: 'Binary vs. Linear Search Racer',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A race between two search algorithms',
      imageHint: 'bar chart race algorithm',
      description: 'A visual race to find a target value in a sorted array, comparing the speed of linear search (O(n)) against binary search (O(log n)).',
      personalNote: 'This is a perfect, simple visualization of a core computer science concept. Watching the binary search "highlighter" jump around and find the target almost instantly while the linear search crawls along is incredibly satisfying and educational.',
      difficulty: 'Easy',
      component: <BinaryVsLinearSearch />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'fractal-tree',
      title: 'Fractal Tree Grower',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A recursively drawn fractal tree',
      imageHint: 'fractal tree recursion',
      description: 'An interactive visualization that grows a fractal tree based on recursive rules. Adjust the branch angle and shrink factor to create different tree species.',
      personalNote: 'This project is a beautiful and simple demonstration of recursion. It\'s mesmerizing to watch how a few simple rules can create such complex and organic-looking patterns. It\'s a great example of the intersection of math, code, and nature.',
      difficulty: 'Medium',
      component: <FractalTree />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'HTML5 Canvas', iconSrc: '/icons/html5.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'voice-controlled-tetris',
      title: 'Voice-Controlled Tetris',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'Voice-controlled Tetris game',
      imageHint: 'tetris game voice control',
      description: 'Classic Tetris, but you have to shout commands: "LEFT!", "RIGHT!", "ROTATE!", "DROP!".',
      personalNote: 'This was a hilarious and frustrating experiment in using the Web Speech API. The challenge is handling the recognition delay and preventing accidental commands while still keeping the game playable. It\'s a great example of creative and slightly chaotic UI/UX design.',
      difficulty: 'Hard',
      component: <VoiceControlledTetris />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'Web Speech API', iconSrc: '/icons/mic.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'githistory-visualizer',
      title: 'GitHistory Visualizer',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'A visualization of a Git repository\'s history',
      imageHint: 'git history data visualization',
      description: 'An animated visualization that plays back the commit history of a software project, showing files as an evolving, galaxy-like node graph.',
      personalNote: 'This project was a deep dive into data visualization and animation. It uses the D3.js library for a force-directed graph layout, giving the file nodes a "zero-gravity" feel. Framer Motion then animates the nodes and "code particles" to bring the history to life. It\'s a beautiful way to see how a project grows and changes over time.',
      difficulty: 'Advanced',
      component: <GitHistoryVisualizer />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'D3.js', iconSrc: '/icons/d3.svg' },
        { name: 'Framer Motion', iconSrc: '/icons/framer.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
    {
      id: 'infinite-canvas',
      title: 'Infinite ASCII Canvas',
      imageUrls: ['/placeholder.png'],
      imageAlt: 'An infinite canvas for placing ASCII characters',
      imageHint: 'infinite grid canvas ascii',
      description: 'An endless whiteboard where you can scroll forever and place text characters anywhere.',
      personalNote: 'This project was a deep dive into virtualization. Instead of rendering millions of DOM elements, it only draws the cells currently visible in the viewport, allowing it to handle a seemingly infinite grid with high performance. It\'s a fun blend of old-school ASCII art and modern web tech.',
      difficulty: 'Advanced',
      component: <InfiniteCanvas />,
      technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'HTML5 Canvas', iconSrc: '/icons/html5.svg' },
        { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      ],
      renderImage: true,
    },
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
    difficulty: 'Hard',
    component: <DeckBuildingRoguelike />,
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
    difficulty: 'Medium',
    component: <TurnBasedStrategy />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
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
  {
    id: 'this-day-in-history',
    title: 'This Day in History',
    imageUrls: ['/placeholder.png'],
    imageAlt: 'This Day in History app interface',
    imageHint: 'history facts timeline',
    description: 'Discover historical events, births, and deaths that happened on a selected day.',
    personalNote: 'This project was a fun way to work with a public API (from Wikipedia) and display a feed of interesting data. It also includes date picking and tabbed navigation to filter the content.',
    difficulty: 'Medium',
    component: <ThisDayInHistory />,
    technologies: [
        { name: 'React', iconSrc: '/icons/react.svg' },
        { name: 'Next.js', iconSrc: '/icons/nextjs.svg' },
        { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
        { name: 'date-fns', iconSrc: '/icons/date-fns.svg' },
    ],
    renderImage: true,
},
];

const difficultyOrder = {
  'AI': 1,
  'Advanced': 2,
  'Hard': 3,
  'Medium': 4,
  'Easy': 5,
  'Community': 6,
  'Meme': 7,
};

const allProjects = [...projectsData].sort((a, b) => {
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
        <div className="p-4 sm:p-8 md:p-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">{project.title}</h2>
            <p className="text-muted-foreground text-lg mb-6">{project.description}</p>
            
            <div className="space-y-4 my-8">
              <h3 className="font-semibold text-xl text-primary">How It's Made</h3>
              <p className="text-muted-foreground leading-relaxed">{project.personalNote}</p>
            </div>

            <div className="mb-8">
                <h4 className="font-semibold text-xl text-primary mb-3">Technologies Used</h4>
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
    );
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
                {mobileProject.component}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Desktop View: Two-column layout */}
       <div className="hidden md:flex flex-row flex-grow h-[calc(100vh-80px)]">
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

        {/* Right Column: Project Details & Component */}
        <div className="flex-1 w-2/3 h-full overflow-hidden">
          <ScrollArea className="h-full">
            <div className="animate-fade-in flex flex-col min-h-full">
                {/* Project Component Area */}
                <div className="flex-shrink-0 flex items-center justify-center relative bg-muted/20 border-b border-border min-h-[60vh]">
                    {selectedProject.component}
                </div>

                {/* Project Details Area */}
                <div className="flex-shrink-0 bg-card">
                    <ProjectDetailContent project={selectedProject} />
                </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
