
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TodoList from '@/components/projects/todo-list';
import UnitConverter from '@/components/projects/unit-converter';
import TicTacToe from '@/components/projects/tic-tac-toe';
import Calculator3D from '@/components/projects/calculator-3d';
import SimpleTextAnimator from '@/components/projects/simple-text-animator';
import FractalRenderer from '@/components/projects/fractal-renderer';
import Chatbot from '@/components/projects/chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import PomodoroTimer from '@/components/projects/pomodoro-timer';
import PasswordGenerator from '@/components/projects/password-generator';
import AccordionDemo from '@/components/projects/accordion-demo';
import CharacterCounter from '@/components/projects/character-counter';
import BmiCalculator from '@/components/projects/bmi-calculator';
import AiRecipeGenerator from '@/components/projects/ai-recipe-generator';
import BudgetPlanner from '@/components/projects/budget-planner';
import DraggableGallery from '@/components/projects/draggable-gallery';
import GithubProfileFinder from '@/components/projects/github-profile-finder';
import CollaborativeWhiteboard from '@/components/projects/collaborative-whiteboard';
import MusicVisualizer from '@/components/projects/music-visualizer';
import MarkdownEditor from '@/components/projects/markdown-editor';
import AiStoryGenerator from '@/components/projects/ai-story-generator';
import CodeEditor from '@/components/projects/code-editor';
import WeatherApp from '@/components/projects/weather-app';
import QuizApp from '@/components/projects/quiz-app';
import StockTracker from '@/components/projects/stock-tracker';


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
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Advanced' | 'Community';
  technologies: Technology[];
  component?: React.ReactNode;
  externalLink?: string;
  renderImage: boolean;
}

const projectsData: Project[] = [
    {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrls: ['https://i.imgur.com/sdJjVAd.png'],
    imageAlt: 'AI Chatbot interface',
    imageHint: 'ai chatbot interface',
    description: 'A conversational AI chatbot powered by Google\'s Gemini model through Genkit.',
    personalNote: "This was a fun project to explore the capabilities of large language models. It's built with Genkit, which makes it easy to create and manage AI flows.",
    difficulty: 'Medium',
    component: <Chatbot />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'Gemini', iconSrc: '/icons/gemini.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'ai-recipe-generator',
    title: 'AI Recipe Generator',
    imageUrls: ['https://i.imgur.com/gKZT5rS.png'],
    imageAlt: 'AI recipe generator interface',
    imageHint: 'recipe generator app',
    description: 'An AI-powered recipe generator that creates unique recipes from a list of ingredients.',
    personalNote: 'This project combines the power of generative AI with a practical application. It was a great challenge to structure the AI prompts to get creative, useful, and consistently formatted recipes.',
    difficulty: 'Medium',
    component: <AiRecipeGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'Gemini', iconSrc: '/icons/gemini.svg' },
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
    id: 'accordion-demo',
    title: 'Accordion UI',
    imageUrls: ['https://i.imgur.com/9C3rC2c.png'],
    imageAlt: 'Accordion component demo',
    imageHint: 'accordion ui component',
    description: 'A demonstration of a common UI pattern for displaying collapsible content sections.',
    personalNote: 'This was a good exercise in component composition and using a pre-built UI library like ShadCN. It shows how to create interactive and space-efficient layouts.',
    difficulty: 'Easy',
    component: <AccordionDemo />,
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
    imageUrls: ['https://i.imgur.com/g8e1y5M.png'],
    imageAlt: 'Character and word counter tool',
    imageHint: 'text utility app',
    description: 'A simple tool to count characters and words in a piece of text as you type.',
    personalNote: 'A very simple project focused on handling user input in real-time and performing basic calculations. It highlights the simplicity and power of controlled components in React.',
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
    id: 'collaborative-whiteboard',
    title: 'Collaborative Whiteboard',
    imageUrls: ['https://i.imgur.com/y8Q3C0d.png'],
    imageAlt: 'A real-time collaborative whiteboard',
    imageHint: 'whiteboard collaboration tool',
    description: 'A real-time whiteboard where multiple users can draw together. Powered by Firebase.',
    personalNote: 'This was a serious challenge. Syncing drawing paths in real-time across different clients while maintaining performance required a deep dive into Firestore data structures and SVG rendering. It was incredibly rewarding to see it work.',
    difficulty: 'Advanced',
    component: <CollaborativeWhiteboard />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'D3.js', iconSrc: '/icons/d3.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'music-visualizer',
    title: 'Audio Visualizer',
    imageUrls: ['https://i.imgur.com/9C3rC2c.png'],
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
    id: 'tic-tac-toe',
    title: 'Real-Time Multiplayer Game',
    imageUrls: ['https://i.imgur.com/3V3bO8H.png'],
    imageAlt: 'Tic-Tac-Toe multiplayer game',
    imageHint: 'tic tac toe game',
    description: 'A classic Tic-Tac-Toe game with real-time multiplayer support using Firebase.',
    personalNote: "This project was a great introduction to real-time databases and handling concurrent user interactions. It's a simple concept but has a surprising amount of depth when you factor in the networking.",
    difficulty: 'Advanced',
    component: <TicTacToe />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
      { name: 'Firebase', iconSrc: '/icons/firebase.svg' },
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
    id: 'ai-story-generator',
    title: 'AI Story Generator',
    imageUrls: ['https://i.imgur.com/6XQ3A3o.png'],
    imageAlt: 'AI story generator interface',
    imageHint: 'writing assistant application',
    description: 'A creative tool that uses generative AI to write a short story from a user-provided prompt.',
    personalNote: 'This project was a fascinating dive into creative AI. I set up a Genkit flow that takes a simple prompt and generates a complete narrative. It was a great challenge to guide the AI to produce coherent and imaginative stories consistently.',
    difficulty: 'Advanced',
    component: <AiStoryGenerator />,
    technologies: [
      { name: 'React', iconSrc: '/icons/react.svg' },
      { name: 'TypeScript', iconSrc: '/icons/typescript.svg' },
      { name: 'Genkit', iconSrc: '/icons/genkit.svg' },
      { name: 'Gemini', iconSrc: '/icons/gemini.svg' },
      { name: 'Tailwind CSS', iconSrc: '/icons/tailwindcss.svg' },
    ],
    renderImage: true,
  },
  {
    id: 'code-editor',
    title: 'In-Browser Code Editor',
    imageUrls: ['https://i.imgur.com/h9H3A3b.png'],
    imageAlt: 'In-browser code editor for HTML, CSS, and JS',
    imageHint: 'code editor interface',
    description: 'A mini front-end playground to write HTML, CSS, and JavaScript and see a live preview.',
    personalNote: 'This was one of the most challenging projects. It required deep knowledge of React hooks for state management, using iframes securely, and debouncing user input for performance. It’s a powerful demonstration of building a complex, interactive application.',
    difficulty: 'Advanced',
    component: <CodeEditor />,
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
  'Community': 5,
};

const allProjects = [...projectsData, communityProject].sort((a, b) => {
  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
});

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0].id);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || allProjects[0];
  }, [selectedProjectId]);

  const handleOpenModal = (project: Project) => {
    if (project.component) {
      setModalProject(project);
    } else if (project.externalLink) {
      window.open(project.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-yellow-400',
    'Hard': 'text-orange-400',
    'Advanced': 'text-red-400',
    'Community': 'text-blue-400',
  };

  return (
    <>
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
        <div className="md:col-span-8 lg:col-span-9 h-full">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-8 md:p-12 animate-fade-in" key={selectedProject.id}>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 bg-card">
                {selectedProject.renderImage ? (
                    <Image
                      src={selectedProject.imageUrls[0]}
                      alt={selectedProject.imageAlt}
                      fill
                      sizes="(max-width: 767px) 100vw, 60vw"
                      className="object-cover"
                      data-ai-hint={selectedProject.imageHint}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                        <h3 className="text-3xl font-bold text-muted-foreground">{selectedProject.title.replace(' App', '')}</h3>
                    </div>
                  )}
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
                  onClick={() => handleOpenModal(selectedProject)}
                  className="w-full sm:w-auto"
                >
                  {selectedProject.component ? <Rocket className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  {selectedProject.component ? 'Launch Project' : 'Visit Site'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {modalProject && (
        <Dialog open={!!modalProject} onOpenChange={(isOpen) => !isOpen && setModalProject(null)}>
          <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{modalProject.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-auto bg-background">
              {modalProject.component}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

    