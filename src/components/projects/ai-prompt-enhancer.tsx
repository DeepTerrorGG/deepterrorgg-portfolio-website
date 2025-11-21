'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Sparkles, Copy, MessageSquare, Image as ImageIcon, Video, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancePrompt } from '@/ai/flows/prompt-enhancer-flow';
import { PromptType, TargetModel, ImageStyle, PromptTypeSchema, TargetModelSchema, ImageStyleSchema, type PromptEnhancerInput } from '@/ai/flows/prompt-enhancer-flow-types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


const AIPromptEnhancer: React.FC = () => {
  const { toast } = useToast();
  const [idea, setIdea] = useState('a logo for a coffee shop');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for new options
  const [promptType, setPromptType] = useState<PromptType>('Image');
  const [targetModel, setTargetModel] = useState<TargetModel>('Midjourney');
  
  const [textDetails, setTextDetails] = useState({ persona: '', task: '' });
  const [imageDetails, setImageDetails] = useState({ style: 'Default' as ImageStyle, composition: '', lighting: '', mood: '', negativePrompt: '' });
  const [videoDetails, setVideoDetails] = useState({ scene: '', shotType: '', style: '' });
  const [codeDetails, setCodeDetails] = useState({ language: 'Python', task: '', constraints: '' });
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      toast({ title: 'Input required', description: 'Please enter a prompt idea.', variant: 'destructive' });
      return;
    }

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
            </div>
        case 'Image':
             return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={imageDetails.style} onValueChange={(v) => setImageDetails({...imageDetails, style: v as ImageStyle})}>
                    <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
                    <SelectContent>{ImageStyleSchema.options.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Composition (e.g., 'wide shot')" value={imageDetails.composition} onChange={e => setImageDetails({...imageDetails, composition: e.target.value})}/>
                <Input placeholder="Lighting (e.g., 'cinematic lighting')" value={imageDetails.lighting} onChange={e => setImageDetails({...imageDetails, lighting: e.target.value})}/>
                <Input placeholder="Mood (e.g., 'serene, mysterious')" value={imageDetails.mood} onChange={e => setImageDetails({...imageDetails, mood: e.target.value})}/>
                <Input placeholder="Negative Prompt (things to avoid)" value={imageDetails.negativePrompt} onChange={e => setImageDetails({...imageDetails, negativePrompt: e.target.value})} className="sm:col-span-2"/>
            </div>
        case 'Video':
            return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input placeholder="Scene description" value={videoDetails.scene} onChange={e => setVideoDetails({...videoDetails, scene: e.target.value})} className="sm:col-span-3"/>
                <Input placeholder="Shot Type (e.g., 'drone shot')" value={videoDetails.shotType} onChange={e => setVideoDetails({...videoDetails, shotType: e.target.value})}/>
                <Input placeholder="Visual Style (e.g., '8k, hyperrealistic')" value={videoDetails.style} onChange={e => setVideoDetails({...videoDetails, style: e.target.value})} className="sm:col-span-2"/>
            </div>
        case 'Code':
             return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Language (e.g., 'Python')" value={codeDetails.language} onChange={e => setCodeDetails({...codeDetails, language: e.target.value})}/>
                <Input placeholder="Task (e.g., 'sort an array')" value={codeDetails.task} onChange={e => setCodeDetails({...codeDetails, task: e.target.value})}/>
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
            
             <Tabs value={promptType} onValueChange={(v) => setPromptType(v as PromptType)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="Text"><MessageSquare className="h-4 w-4 mr-2"/>Text</TabsTrigger>
                    <TabsTrigger value="Image"><ImageIcon className="h-4 w-4 mr-2"/>Image</TabsTrigger>
                    <TabsTrigger value="Video"><Video className="h-4 w-4 mr-2"/>Video</TabsTrigger>
                    <TabsTrigger value="Code"><Code2 className="h-4 w-4 mr-2"/>Code</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="prompt-idea">Your Core Idea</Label>
                  <Textarea id="prompt-idea" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g., a logo for a coffee shop" rows={2} disabled={isLoading} className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="target-model">Target AI Model</Label>
                    <Select value={targetModel} onValueChange={(v) => setTargetModel(v as TargetModel)}>
                        <SelectTrigger id="target-model" className="mt-1"><SelectValue/></SelectTrigger>
                        <SelectContent>{TargetModelSchema.options.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label className="text-sm font-semibold">Fine-tune Details (Optional)</Label>
                <div className="mt-2 p-4 border rounded-md bg-muted/30">
                    {renderDetailsForm()}
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Wand2 className="mr-2 h-4 w-4" /> )}
              Enhance Prompt
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
