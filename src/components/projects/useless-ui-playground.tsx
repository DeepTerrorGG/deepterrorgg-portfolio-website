
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue } from 'framer-motion';
import { Volume2, FileText, Cookie, CheckSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';

const UselessUiPlayground: React.FC = () => {
  const [volume, setVolume] = useState(50);
  const [agreed, setAgreed] = useState(false);
  
  // Shuffling Dropdown State
  const dropdownOptions = ['First Choice', 'Second Option', 'Another Item', 'The Best One', 'Definitely This'];
  const [shuffledOptions, setShuffledOptions] = useState(dropdownOptions);
  
  // Progress Bar State
  const [progress, setProgress] = useState(0);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationPhrase = "I am absolutely, positively, unequivocally sure.";
  
  // Fighting Input State
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });

  // For the volume knob
  const rotate = useMotionValue(0);
  const handleDrag = (event: any, info: any) => {
    const newRotation = rotate.get() + info.offset.x;
    rotate.set(newRotation);
    const newVolume = Math.max(0, Math.min(100, Math.floor((newRotation % 360) / 3.6)));
    setVolume(newVolume);
  };

  // For the runaway button
  const [buttonPosition, setButtonPosition] = useState({ top: '50%', left: '50%' });
  const handleMouseEnter = () => {
    setButtonPosition({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
    });
  };

  const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ... ".repeat(50);

  // Logic for shuffling dropdown
  const shuffleDropdown = () => {
      setShuffledOptions(prev => [...prev].sort(() => Math.random() - 0.5));
  }

  // Logic for progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        const jumpBack = Math.random() < 0.15; // 15% chance to jump back
        if (jumpBack) return Math.max(0, prev - 30);
        return Math.min(100, prev + Math.random() * 5);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const Exhibit = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-muted/20 border border-border/20 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-center text-foreground">{title}</h3>
      <div className="flex items-center justify-center min-h-[12rem] relative overflow-hidden">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-[#0d1117] text-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">The Useless UI/UX Playground</h1>
            <p className="text-muted-foreground mt-2">A curated collection of delightfully frustrating user interface components.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Exhibit title="Unintuitive Volume Knob">
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                drag="x"
                dragConstraints={{ left: -360, right: 360 }}
                onDrag={handleDrag}
                style={{ rotate }}
                className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
              >
                <Volume2 className="w-10 h-10 text-secondary-foreground" />
              </motion.div>
              <p className="font-mono">Volume: {volume}</p>
            </div>
          </Exhibit>

          <Exhibit title="Elusive Agreement Button">
            {agreed ? (
              <p className="text-green-400 font-bold text-xl">You finally did it!</p>
            ) : (
              <motion.button
                onMouseEnter={handleMouseEnter}
                onClick={() => setAgreed(true)}
                className="absolute p-2 bg-primary rounded-md text-primary-foreground"
                style={{ top: buttonPosition.top, left: buttonPosition.left, transition: 'top 0.2s ease-out, left 0.2s ease-out' }}
              >
                Agree
              </motion.button>
            )}
          </Exhibit>
          
          <Exhibit title="Deceitful Dropdown">
            <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-sm text-muted-foreground text-center">Try to select "The Best One".</p>
                <Select>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent onMouseOver={shuffleDropdown}>
                        {shuffledOptions.map((opt, i) => <SelectItem key={`${opt}-${i}`} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </Exhibit>

          <Exhibit title="Unhelpful Progress Bar">
              <div className="flex flex-col items-center justify-center w-full space-y-4 px-4">
                  <p className="text-sm text-muted-foreground">Just a little longer...</p>
                  <Progress value={progress} className="w-3/4"/>
                  <Button variant="outline" onClick={() => setProgress(0)}>Reset Progress</Button>
              </div>
          </Exhibit>
          
          <Exhibit title="Paranoid Confirmation">
              <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-sm text-muted-foreground">Are you sure you want to proceed?</p>
                  <Button onClick={() => setIsDialogOpen(true)}><CheckSquare className="mr-2"/> Yes, I'm sure</Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>To confirm, please type: "{confirmationPhrase}"</DialogDescription>
                        </DialogHeader>
                        <Input value={confirmationInput} onChange={e => setConfirmationInput(e.target.value)} />
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button disabled={confirmationInput !== confirmationPhrase} onClick={() => { setIsDialogOpen(false); setConfirmationInput(''); }}>Confirm</Button>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>
          </Exhibit>

           <Exhibit title="Combative Input Field">
              <motion.input
                  type="text"
                  placeholder="Try to type here..."
                  className="w-3/4 p-2 border rounded-md bg-background"
                  animate={{ x: inputPosition.x, y: inputPosition.y }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onFocus={() => setInputPosition({ x: Math.random() * 60 - 30, y: Math.random() * 40 - 20 })}
                  onKeyDown={() => setInputPosition({ x: Math.random() * 60 - 30, y: Math.random() * 40 - 20 })}
              />
          </Exhibit>

          <div className="md:col-span-2">
            <Exhibit title="Infinitesimal Terms of Service">
                <div className="w-full px-4">
                  <ScrollArea className="h-24 w-full border rounded-md bg-background/50">
                      <div className="p-2" style={{ fontSize: '0.5rem', lineHeight: '0.6' }}>
                          {loremIpsum.repeat(5)}
                      </div>
                  </ScrollArea>
                </div>
            </Exhibit>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UselessUiPlayground;
