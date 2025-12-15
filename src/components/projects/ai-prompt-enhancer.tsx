
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Sparkles, Copy, MessageSquare, Image as ImageIcon, Video, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancePrompt } from '@/ai/flows/prompt-enhancer-flow';
import { 
    PromptType, 
    ImageStyle,
    type PromptEnhancerInput,
    TextPromptDetailsSchema,
    ImagePromptDetailsSchema,
    VideoPromptDetailsSchema,
    CodePromptDetailsSchema,
    ImageModels,
    VideoModels,
    CodeModels,
    TextModels,
    TargetModelSchema
} from '@/ai/flows/prompt-enhancer-flow-types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { z } from 'zod';

interface AIPromptEnhancerProps {
    onGenerate: () => boolean;
    usageLeft: number;
}

const AIPromptEnhancer: React.FC<AIPromptEnhancerProps> = ({ onGenerate, usageLeft }) => {
  const { toast } = useToast();
  const [idea, setIdea] = useState('a logo for a coffee shop');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for new options
  const [promptType, setPromptType] = useState<PromptType>('Image');
  const [targetModel, setTargetModel] = useState<z.infer<typeof TargetModelSchema>>('Midjourney');
  
  const [textDetails, setTextDetails] = useState<z.infer<typeof TextPromptDetailsSchema>>({ persona: '', task: '', format: '', tone: '', length: '' });
  const [imageDetails, setImageDetails] = useState<z.infer<typeof ImagePromptDetailsSchema>>({ style: 'Default' as ImageStyle, composition: '', lighting: '', mood: '', negativePrompt: '', cameraAngle: '', lensType: '', artistInspiration: '' });
  const [videoDetails, setVideoDetails] = useState<z.infer<typeof VideoPromptDetailsSchema>>({ scene: '', shotType: '', style: '', cameraMovement: '', lightingStyle: '', colorGrade: '' });
  const [codeDetails, setCodeDetails] = useState<z.infer<typeof CodePromptDetailsSchema>>({ language: 'Python', task: '', constraints: '', dependencies: '', dataStructures: '', errorHandling: '' });

  const getModelOptions = () => {
    switch (promptType) {
        case 'Text': return TextModels;
        case 'Image': return ImageModels;
        case 'Video': return VideoModels;
        case 'Code': return CodeModels;
        default: return [];
    }
  };
  
  const handleTabChange = (newTab: string) => {
    const pt = newTab as PromptType;
    setPromptType(pt);
    // Reset target model to the first in the new list
    switch (pt) {
        case 'Text': setTargetModel(TextModels[0]); break;
        case 'Image': setTargetModel(ImageModels[0]); break;
        case 'Video': setTargetModel(VideoModels[0]); break;
        case 'Code': setTargetModel(CodeModels[0]); break;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast({ title: 'Input required', description: 'Please enter a prompt idea.', variant: 'destructive' });
      return;
    }

    if (!onGenerate()) return;

    setIsLoading(true);
    setEnhancedPrompt('');
    
    let details = {};
    switch(promptType) {
        case 'Text': details = textDetails; break;
        case 'Image': details = imageDetails; break;
        case 'Video': details = videoDetails; break;
        case 'Code': details = codeDetails; break;
    }

    const input: PromptEnhancerInput = {
        idea,
        promptType,
        targetModel,
        details,
    };

    try {
      const result = await enhancePrompt(input);
      setEnhancedPrompt(result.enhancedPrompt);
    } catch (error: any) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: 'Enhancement Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!enhancedPrompt) return;
    navigator.clipboard.writeText(enhancedPrompt);
    toast({ title: 'Copied!', description: 'Enhanced prompt copied to clipboard.' });
  };
  
  const renderDetailsForm = () => {
    switch (promptType) {
        case 'Text':
            return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Persona (e.g., 'a witty pirate')" value={textDetails.persona} onChange={e => setTextDetails({...textDetails, persona: e.target.value})}/>
                <Input placeholder="Task (e.g., 'write a short poem')" value={textDetails.task} onChange={e => setTextDetails({...textDetails, task: e.target.value})}/>
                <Input placeholder="Format (e.g., 'JSON object', 'list')" value={textDetails.format} onChange={e => setTextDetails({...textDetails, format: e.target.value})}/>
                <Input placeholder="Tone (e.g., 'formal', 'humorous')" value={textDetails.tone} onChange={e => setTextDetails({...textDetails, tone: e.target.value})}/>
                <Input placeholder="Length (e.g., 'one paragraph')" value={textDetails.length} onChange={e => setTextDetails({...textDetails, length: e.target.value})} className="sm:col-span-2"/>
            </div>
        case 'Image':
             return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={imageDetails.style} onValueChange={(v) => setImageDetails({...imageDetails, style: v as ImageStyle})}>
                    <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
                    <SelectContent>{['Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art', 'Cinematic', '3D Model', 'Vintage Photo'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Composition (e.g., 'wide shot')" value={imageDetails.composition} onChange={e => setImageDetails({...imageDetails, composition: e.target.value})}/>
                <Input placeholder="Lighting (e.g., 'cinematic lighting')" value={imageDetails.lighting} onChange={e => setImageDetails({...imageDetails, lighting: e.target.value})}/>
                <Input placeholder="Mood (e.g., 'serene, mysterious')" value={imageDetails.mood} onChange={e => setImageDetails({...imageDetails, mood: e.target.value})}/>
                <Input placeholder="Camera Angle (e.g., 'low angle')" value={imageDetails.cameraAngle} onChange={e => setImageDetails({...imageDetails, cameraAngle: e.target.value})}/>
                <Input placeholder="Lens Type (e.g., '50mm prime lens')" value={imageDetails.lensType} onChange={e => setImageDetails({...imageDetails, lensType: e.target.value})}/>
                <Input placeholder="Inspired by artist (e.g., Van Gogh)" value={imageDetails.artistInspiration} onChange={e => setImageDetails({...imageDetails, artistInspiration: e.target.value})} className="sm:col-span-2"/>
                <Input placeholder="Negative Prompt (things to avoid)" value={imageDetails.negativePrompt} onChange={e => setImageDetails({...imageDetails, negativePrompt: e.target.value})} className="sm:col-span-2"/>
            </div>
        case 'Video':
            return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Scene description" value={videoDetails.scene} onChange={e => setVideoDetails({...videoDetails, scene: e.target.value})} className="sm:col-span-2"/>
                <Input placeholder="Shot Type (e.g., 'drone shot')" value={videoDetails.shotType} onChange={e => setVideoDetails({...videoDetails, shotType: e.target.value})}/>
                <Input placeholder="Visual Style (e.g., '8k, hyperrealistic')" value={videoDetails.style} onChange={e => setVideoDetails({...videoDetails, style: e.target.value})}/>
                <Input placeholder="Camera Movement (e.g., 'slow pan left')" value={videoDetails.cameraMovement} onChange={e => setVideoDetails({...videoDetails, cameraMovement: e.target.value})}/>
                <Input placeholder="Lighting Style (e.g., 'Rembrandt lighting')" value={videoDetails.lightingStyle} onChange={e => setVideoDetails({...videoDetails, lightingStyle: e.target.value})}/>
                <Input placeholder="Color Grade (e.g., 'teal and orange')" value={videoDetails.colorGrade} onChange={e => setVideoDetails({...videoDetails, colorGrade: e.target.value})} className="sm:col-span-2"/>
            </div>
        case 'Code':
             return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Language (e.g., 'Python')" value={codeDetails.language} onChange={e => setCodeDetails({...codeDetails, language: e.target.value})}/>
                <Input placeholder="Task (e.g., 'sort an array')" value={codeDetails.task} onChange={e => setCodeDetails({...codeDetails, task: e.target.value})}/>
                <Input placeholder="Dependencies (e.g., 'react, lodash')" value={codeDetails.dependencies} onChange={e => setCodeDetails({...codeDetails, dependencies: e.target.value})}/>
                <Input placeholder="Data Structures (e.g., 'use a hash map')" value={codeDetails.dataStructures} onChange={e => setCodeDetails({...codeDetails, dataStructures: e.target.value})}/>
                <Input placeholder="Error Handling (e.g., 'throw error on invalid input')" value={codeDetails.errorHandling} onChange={e => setCodeDetails({...codeDetails, errorHandling: e.target.value})} className="sm:col-span-2"/>
                <Textarea placeholder="Constraints (e.g., 'must not use libraries')" value={codeDetails.constraints} onChange={e => setCodeDetails({...codeDetails, constraints: e.target.value})} className="sm:col-span-2"/>
            </div>
    }
  }

  return (
    <div className="flex items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
            <Sparkles className="h-6 w-6" />
            AI Prompt IDE
          </CardTitle>
          <CardDescription className="text-center">
            Turn your simple ideas into powerful, detailed prompts for any AI model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
             <Tabs value={promptType} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="Text"><MessageSquare className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                    <TabsTrigger value="Image"><ImageIcon className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                    <TabsTrigger value="Video"><Video className="h-4 w-4 mr-2"/>Video</TabsTrigger>
                    <TabsTrigger value="Code"><Code2 className="h-4 w-4 mr-2"/>Code</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="prompt-idea">Your Core Idea</Label>
                  <Textarea id="prompt-idea" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g., a logo for a coffee shop" rows={2} disabled={isLoading || usageLeft <= 0} className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="target-model">Target AI Model</Label>
                    <Select value={targetModel} onValueChange={(v) => setTargetModel(v as z.infer<typeof TargetModelSchema>)} disabled={isLoading || usageLeft <= 0}>
                        <SelectTrigger id="target-model" className="mt-1"><SelectValue/></SelectTrigger>
                        <SelectContent>{getModelOptions().map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="text-sm font-semibold">Fine-tune Details (Optional)</Label>
                <div className="mt-2 p-4 border rounded-md bg-muted/30">
                    {renderDetailsForm()}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || usageLeft <= 0}>
              {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Wand2 className="mr-2 h-4 w-4" /> )}
              {usageLeft > 0 ? 'Enhance Prompt' : 'Usage Limit Reached'}
            </Button>
          </form>

          {(isLoading || enhancedPrompt) && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold text-lg flex items-center justify-between">
                <span>Enhanced Prompt</span>
                {enhancedPrompt && !isLoading && (
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </h3>
              <div className="p-4 bg-muted rounded-md min-h-[150px] relative text-sm whitespace-pre-wrap">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p>{enhancedPrompt}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPromptEnhancer;
