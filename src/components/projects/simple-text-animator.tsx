
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type AnimationEffect = 'fadeIn' | 'fadeOut' | 'blink' | 'typewriter' | 'flash' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'rotate';

interface EffectParams {
  duration?: number;
  speed?: number; 
  flashColor?: string;
  angle?: number;
}

const SimpleTextAnimator: React.FC = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>('Animated Text');
  const [selectedEffect, setSelectedEffect] = useState<AnimationEffect>('fadeIn');
  const [effectParams, setEffectParams] = useState<EffectParams>({ duration: 1, speed: 10, flashColor: '#FFFF00', angle: 0 });
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [animationKey, setAnimationKey] = useState<number>(0);

  const handlePreview = () => {
    setIsPreviewing(false);
    setAnimationKey(prevKey => prevKey + 1);
    setTimeout(() => {
      setIsPreviewing(true);
    }, 50);
  };

  const handleReset = () => {
    setIsPreviewing(false);
    setText('Animated Text');
    setSelectedEffect('fadeIn');
    setEffectParams({ duration: 1, speed: 10, flashColor: '#FFFF00', angle: 0 });
    setTextColor('#FFFFFF');
    setAnimationKey(0);
  };

  const handleDownloadSettings = () => {
     if (text.trim() === '') {
      toast({ title: "Nothing to download", description: "Enter some text and apply effects first.", variant: "default", duration: 3000});
      return;
    }
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
    toast({ title: "Settings Downloaded", description: "Animation settings saved as JSON.", variant: "default" });
  };

  const handleParamChange = (paramName: keyof EffectParams, value: string | number) => {
    const numValue = (paramName === 'duration' || paramName === 'speed' || paramName === 'angle')
      ? (typeof value === 'string' ? parseFloat(value) : value)
      : value;

    if (paramName === 'duration' && (typeof numValue !== 'number' || numValue < 0.1 || numValue > 30 || isNaN(numValue))) return;
    if (paramName === 'speed' && (typeof numValue !== 'number' || numValue < 0.1 || numValue > 100 || isNaN(numValue))) return;
    if (paramName === 'angle' && (typeof numValue !== 'number' || numValue < -360 || numValue > 360 || isNaN(numValue))) return;
    
    setEffectParams(prev => ({ ...prev, [paramName]: numValue }));
  };

  const getAnimationClasses = () => {
    if (!isPreviewing) return '';
    switch (selectedEffect) {
      case 'fadeIn': return `animate-fadeIn`;
      case 'fadeOut': return `animate-fadeOut`;
      case 'blink': return `animate-blink`;
      case 'flash': return `animate-flash`;
      case 'typewriter': return `animate-typewriter overflow-hidden whitespace-nowrap border-r-2 border-r-foreground`;
      case 'slideInLeft': return `animate-slideInLeft`;
      case 'slideInRight': return `animate-slideInRight`;
      case 'zoomIn': return `animate-zoomIn`;
      case 'rotate': return `animate-rotate`;
      default: return '';
    }
  };

  const getAnimationDuration = () => `${effectParams.duration || 1}s`;
  const getAnimationSpeedForBlink = () => `${1 / (effectParams.speed || 2)}s`;

  const animationStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      animationIterationCount: (selectedEffect === 'blink' || selectedEffect === 'flash') ? 'infinite' : 1,
      animationFillMode: 'forwards',
      opacity: (selectedEffect === 'fadeIn' && !isPreviewing) ||
               ((selectedEffect === 'slideInLeft' || selectedEffect === 'slideInRight' || selectedEffect === 'zoomIn') && !isPreviewing)
               ? 0 : 1,
      color: textColor,
    };

    if (selectedEffect === 'blink') {
      styles.animationDuration = getAnimationSpeedForBlink();
    } else if (selectedEffect === 'typewriter') {
      const numChars = text.length || 1;
      const charsPerSec = effectParams.speed || 10;
      const calculatedDuration = Math.max(0.1, numChars / charsPerSec);
      styles.animationDuration = `${calculatedDuration}s, 0.75s`; // duration for typing, duration for caret blink
      (styles as any)['--typewriter-characters'] = numChars;
      styles.animationTimingFunction = `steps(${numChars}, end), steps(1, end)`;
    } else {
      styles.animationDuration = getAnimationDuration(); // For flash (interval) and other duration-based effects
    }
    
    if (selectedEffect === 'flash' && isPreviewing) {
      (styles as any)['--flash-color'] = effectParams.flashColor || '#FFFF00';
    }
    if (selectedEffect === 'rotate' && isPreviewing) {
        (styles as any)['--rotation-angle'] = `${effectParams.angle || 0}deg`;
    }
    return styles;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-card text-card-foreground rounded-lg overflow-hidden">
        {/* Left Column: Controls */}
        <div className="w-full md:w-1/3 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Controls</h3>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-4">
                    <div>
                        <Label htmlFor="text-input" className="text-sm">Text to Animate</Label>
                        <Textarea
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text..."
                            className="mt-1 min-h-[80px]"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="effect-select" className="text-sm">Animation Effect</Label>
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
                                <SelectItem value="slideInLeft">Slide In Left</SelectItem>
                                <SelectItem value="slideInRight">Slide In Right</SelectItem>
                                <SelectItem value="zoomIn">Zoom In</SelectItem>
                                <SelectItem value="rotate">Rotate</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="text-color" className="text-sm">Text Color</Label>
                        <Input
                            id="text-color"
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="mt-1 p-1"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm block font-medium">Effect Parameters</Label>
                        {(selectedEffect === 'fadeIn' || selectedEffect === 'fadeOut' || selectedEffect === 'slideInLeft' || selectedEffect === 'slideInRight' || selectedEffect === 'zoomIn' || selectedEffect === 'rotate') && (
                            <div>
                                <Label htmlFor="duration-input" className="text-xs">Duration (s)</Label>
                                <Input id="duration-input" type="number" min={0.1} max={30} step={0.1} value={effectParams.duration ?? 1} onChange={(e) => handleParamChange('duration', e.target.value)} className="mt-1" />
                            </div>
                        )}
                        {selectedEffect === 'flash' && (
                            <>
                                <div>
                                    <Label htmlFor="duration-flash-input" className="text-xs">Flash Interval (s)</Label>
                                    <Input id="duration-flash-input" type="number" min={0.1} max={5} step={0.1} value={effectParams.duration ?? 0.5} onChange={(e) => handleParamChange('duration', e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="flash-color" className="text-xs">Flash Color</Label>
                                    <Input id="flash-color" type="color" value={effectParams.flashColor || '#FFFF00'} onChange={(e) => setEffectParams(prev => ({ ...prev, flashColor: e.target.value }))} className="mt-1 p-1" />
                                </div>
                            </>
                        )}
                        {selectedEffect === 'blink' && (
                            <div>
                                <Label htmlFor="speed-blink-input" className="text-xs">Blinks per sec</Label>
                                <Input id="speed-blink-input" type="number" min={0.1} max={10} step={0.1} value={effectParams.speed ?? 2} onChange={(e) => handleParamChange('speed', e.target.value)} className="mt-1" />
                            </div>
                        )}
                        {selectedEffect === 'typewriter' && (
                            <div>
                                <Label htmlFor="speed-typewriter-input" className="text-xs">Characters per sec</Label>
                                <Input id="speed-typewriter-input" type="number" min={1} max={100} step={1} value={effectParams.speed ?? 10} onChange={(e) => handleParamChange('speed', e.target.value)} className="mt-1" />
                            </div>
                        )}
                        {selectedEffect === 'rotate' && (
                            <div>
                                <Label htmlFor="angle-input" className="text-xs">Angle (°)</Label>
                                <Input id="angle-input" type="number" min={-360} max={360} step={1} value={effectParams.angle ?? 0} onChange={(e) => handleParamChange('angle', e.target.value)} className="mt-1" />
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-border space-y-2">
                <Button onClick={handlePreview} className="w-full">
                    <Play className="mr-2 h-4 w-4" /> Preview Animation
                </Button>
                <Button variant="outline" onClick={handleDownloadSettings} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Settings
                </Button>
                <Button onClick={handleReset} variant="destructive" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset All
                </Button>
            </div>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full md:w-2/3 flex flex-col">
             <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Preview</h3>
            </div>
            <div className="flex-grow bg-muted/30 flex items-center justify-center p-4">
                <Card className="w-full h-full bg-card/50">
                    <CardContent className="p-4 h-full flex items-center justify-center">
                        {text.trim() !== '' ? (
                            <div
                                key={animationKey}
                                className={cn(
                                "text-2xl sm:text-3xl md:text-4xl font-bold text-center",
                                isPreviewing && getAnimationClasses()
                                )}
                                style={animationStyles()}
                            >
                                {text}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Preview Area</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        <style jsx global>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation-name: fadeIn; }
            @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
            .animate-fadeOut { animation-name: fadeOut; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            .animate-blink { animation-name: blink; }
            @keyframes flash { 0%, 100% { color: var(--original-color, ${textColor}); } 50% { color: var(--flash-color, #FFFF00); } }
            .animate-flash { animation-name: flash; --original-color: ${textColor}; }
            @keyframes typewriter { 
              from { width: 0; } 
              to { width: calc(var(--typewriter-characters) * 1ch); } 
            }
            @keyframes blink-caret { 
              from, to { border-color: transparent } 
              50% { border-color: hsl(var(--foreground)); } 
            }
            .animate-typewriter { 
              animation-name: typewriter, blink-caret;
              animation-timing-function: steps(var(--typewriter-characters, 1), end), linear;
              animation-fill-mode: forwards, none;
              animation-iteration-count: 1, infinite;
            }
            @keyframes slideInLeft { from { opacity: 0; transform: translateX(-100%); } to { opacity: 1; transform: translateX(0); } }
            .animate-slideInLeft { animation-name: slideInLeft; }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
            .animate-slideInRight { animation-name: slideInRight; }
            @keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
            .animate-zoomIn { animation-name: zoomIn; }
            @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(var(--rotation-angle)); } }
            .animate-rotate { animation-name: rotate; }
        `}</style>
    </div>
  );
};

export default SimpleTextAnimator;
