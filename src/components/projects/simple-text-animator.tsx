
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square, Download, RefreshCw, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AnimationEffect = 'fadeIn' | 'fadeOut' | 'blink' | 'typewriter' | 'flash';

interface EffectParams {
  duration?: number; // seconds
  speed?: number; // characters per second for typewriter, or blinks per second
  flashColor?: string;
  // Add more params as needed
}

const SimpleTextAnimator: React.FC = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>('Animated Text!');
  const [selectedEffect, setSelectedEffect] = useState<AnimationEffect>('fadeIn');
  const [effectParams, setEffectParams] = useState<EffectParams>({ duration: 1, speed: 10, flashColor: '#FFFF00' });
  const [animationKey, setAnimationKey] = useState<number>(0); // Used to re-trigger CSS animations
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');


  const handlePreview = () => {
    setIsPreviewing(false); // Reset first
    setTimeout(() => {
      setAnimationKey(prev => prev + 1); // Re-trigger animation by changing key
      setIsPreviewing(true);
    }, 50); // Short delay to allow reset to apply
  };

  const handleReset = () => {
    setIsPreviewing(false);
    setAnimationKey(prev => prev + 1); // Reset animation state
    setText('Animated Text!');
    setSelectedEffect('fadeIn');
    setEffectParams({ duration: 1, speed: 10, flashColor: '#FFFF00' });
    setTextColor('#FFFFFF');
  };
  
  const handleDownload = () => {
    toast({
      title: "Download Animation Settings",
      description: "Downloading animation settings as a JSON file. GIF/video export is not yet implemented.",
      variant: "default",
      duration: 4000,
    });
    // Placeholder for settings download
    const settings = { text, selectedEffect, effectParams, textColor };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text_animation_settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getAnimationClasses = () => {
    if (!isPreviewing) return '';
    switch (selectedEffect) {
      case 'fadeIn':
        return `animate-fadeIn`;
      case 'fadeOut':
        return `animate-fadeOut`;
      case 'blink':
        return `animate-blink`;
      case 'flash':
        return `animate-flash`; // CSS will need --flash-color variable
      case 'typewriter':
         // Typewriter is more complex, needs JS. For CSS only, it's hard.
         // We can simulate it with a step-based width animation, but it's not true character-by-character.
         // This CSS is a very rough approximation.
        return `animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-r-foreground`;
      default:
        return '';
    }
  };
  
  const getAnimationDuration = () => {
    return `${effectParams.duration || 1}s`;
  };

  const getAnimationSpeed = () => {
    if (selectedEffect === 'blink') return `${1 / (effectParams.speed || 2)}s`; // Blinks per sec to duration
    return `${effectParams.speed || 10}`; // Chars per second for typewriter
  };

  // Inline styles for animations that need dynamic values from JS
  const animationStyles: React.CSSProperties = {
    animationDuration: getAnimationDuration(),
    animationIterationCount: selectedEffect === 'blink' || selectedEffect === 'flash' ? 'infinite' : 1,
    animationFillMode: 'forwards',
    opacity: (selectedEffect === 'fadeIn' && !isPreviewing) ? 0 : 1, // Start invisible for fadeIn
    color: textColor,
  } as React.CSSProperties;

  if (selectedEffect === 'flash' && isPreviewing) {
    (animationStyles as any)['--flash-color'] = effectParams.flashColor || '#FFFF00';
  }
  if (selectedEffect === 'typewriter' && isPreviewing) {
    (animationStyles as any)['--typewriter-characters'] = text.length;
    (animationStyles as any).animationTimingFunction = `steps(${text.length}), linear`;
  }


  return (
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4 bg-card text-card-foreground rounded-lg overflow-hidden">
      <Card className="w-full md:w-2/5 lg:w-1/3 border-border flex flex-col">
        <CardHeader>
          <CardTitle>Text Animation Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow overflow-hidden p-4 space-y-4">
          <div className="flex-grow space-y-4 overflow-y-auto pr-2"> {/* Scrollable area for inputs */}
            <div>
              <Label htmlFor="text-input">Your Text</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to animate..."
                className="mt-1 min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="effect-select">Animation Effect</Label>
              <Select value={selectedEffect} onValueChange={(value) => setSelectedEffect(value as AnimationEffect)}>
                <SelectTrigger id="effect-select" className="mt-1">
                  <SelectValue placeholder="Select an effect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fadeIn">Fade In</SelectItem>
                  <SelectItem value="fadeOut">Fade Out</SelectItem>
                  <SelectItem value="blink">Blink</SelectItem>
                  <SelectItem value="typewriter">Typewriter</SelectItem>
                  <SelectItem value="flash">Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <Input 
                id="text-color" 
                type="color" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)} 
                className="mt-1 h-10 p-1 w-full"
              />
            </div>

            {/* Effect-specific parameters */}
            {(selectedEffect === 'fadeIn' || selectedEffect === 'fadeOut' || selectedEffect === 'typewriter') && (
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={effectParams.duration || 1}
                  onChange={(e) => setEffectParams(prev => ({ ...prev, duration: parseFloat(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            )}
            {selectedEffect === 'blink' && (
               <div>
                <Label htmlFor="speed-blink">Blinks per second</Label>
                <Input
                  id="speed-blink"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={effectParams.speed || 2}
                  onChange={(e) => setEffectParams(prev => ({ ...prev, speed: parseFloat(e.target.value) || 2 }))}
                  className="mt-1"
                />
              </div>
            )}
            {selectedEffect === 'typewriter' && (
               <div>
                <Label htmlFor="speed-typewriter">Characters per second (approx.)</Label>
                <Input
                  id="speed-typewriter"
                  type="number"
                  min="1"
                  step="1"
                  value={effectParams.speed || 10}
                  onChange={(e) => setEffectParams(prev => ({ ...prev, speed: Math.max(1, parseInt(e.target.value)) || 10 }))}
                  className="mt-1"
                />
              </div>
            )}
             {selectedEffect === 'flash' && (
              <>
                <div>
                  <Label htmlFor="duration-flash">Flash Interval (seconds)</Label>
                  <Input
                    id="duration-flash"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={effectParams.duration || 0.5}
                    onChange={(e) => setEffectParams(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0.5 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="flash-color">Flash Color</Label>
                  <Input
                    id="flash-color"
                    type="color"
                    value={effectParams.flashColor || '#FFFF00'}
                    onChange={(e) => setEffectParams(prev => ({ ...prev, flashColor: e.target.value }))}
                    className="mt-1 h-10 p-1 w-full"
                  />
                </div>
              </>
            )}
          </div> {/* End of scrollable input area */}

          <div className="mt-auto space-y-2 pt-4 border-t border-border"> {/* Button group */}
            <Button onClick={handlePreview} className="w-full">
              <Play className="mr-2 h-4 w-4" /> Preview Animation
            </Button>
             <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download (Settings)
            </Button>
            <Button onClick={handleReset} variant="destructive" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex-grow flex items-center justify-center bg-muted/30 rounded-md border border-input p-8">
        <div
          key={animationKey}
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold text-center",
            isPreviewing && getAnimationClasses()
          )}
          style={animationStyles}
        >
          {text}
        </div>
      </div>
      
      {/* Add keyframes to globals.css or a style tag here if preferred. For now, placing in globals.css */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation-name: fadeIn; }

        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeOut { animation-name: fadeOut; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation-name: blink; }
        
        @keyframes flash {
          0%, 100% { color: var(--original-color, ${textColor}); } /* Use CSS var or current textColor */
          50% { color: var(--flash-color, #FFFF00); }
        }
        .animate-flash { 
            animation-name: flash;
            --original-color: ${textColor}; /* Pass current text color to CSS */
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: calc(var(--typewriter-characters) * 1ch); } /* Approximate width based on characters */
        }
        .animate-typewriter {
          animation-name: typewriter;
          animation-timing-function: steps(var(--typewriter-characters, 20)), linear; /* Fallback if var not set */
        }
      `}</style>
    </div>
  );
};

export default SimpleTextAnimator;

