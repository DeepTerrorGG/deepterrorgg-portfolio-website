
'use client';

import { generateProjectImage } from '@/ai/flows/generate-project-image-flow';
import { type ImageStyle, type AspectRatio } from '@/ai/flows/generate-project-image-flow-types';
import { FormEvent, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const imageStyles: ImageStyle[] = [
    'Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art', 'Cinematic', '3D Model', 'Vintage Photo'
];

const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:2', '3:4', '2:3'];

export default function AIImageGenerator() {
  const { toast } = useToast();
  const [description, setDescription] = useState<string>('a futuristic city skyline at dawn');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<ImageStyle>('Default');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          if (file.size > 4 * 1024 * 1024) { // 4MB limit
            reject(new Error(`File "${file.name}" is too large (max 4MB).`));
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(new Error("Failed to read file."));
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then(newImages => {
          setUploadedImages(prev => [...prev, ...newImages]);
        })
        .catch(error => {
          toast({
            title: 'Upload Error',
            description: error.message,
            variant: 'destructive',
          });
        });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({ title: 'Prompt is required', description: 'Please enter a description.', variant: 'destructive'});
      return;
    }

    setLoading(true);
    setImageUrl('');

    try {
      const url = await generateProjectImage({
        description,
        style,
        aspectRatio,
        imageDataUris: uploadedImages.length > 0 ? uploadedImages : undefined,
      });
      setImageUrl(url);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 flex items-center justify-center bg-card h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>AI Image Generator</CardTitle>
          <CardDescription>Create unique images from text prompts, optionally providing one or more base images.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             {uploadedImages.length > 0 ? (
                <div className="relative w-full border rounded-md p-2">
                    <ScrollArea className="h-32">
                        <div className="flex gap-2 p-1">
                            {uploadedImages.map((image, index) => (
                                <div key={index} className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden">
                                    <Image src={image} alt={`Uploaded preview ${index + 1}`} fill className="object-cover"/>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                             <Button
                                type="button"
                                variant="outline"
                                className="w-28 h-28 flex-shrink-0 flex-col gap-1 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Add More</span>
                            </Button>
                        </div>
                    </ScrollArea>
                </div>
            ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Base Image(s) (Optional)
                </Button>
            )}

            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                multiple
                onChange={handleImageUpload}
            />

            <div>
                <Label htmlFor="description-input">Prompt</Label>
                <Input
                  id="description-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a project description..."
                  className="flex-grow mt-1"
                  disabled={loading}
                />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                 <div>
                    <Label htmlFor="style-select">Artistic Style</Label>
                    <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)} disabled={loading}>
                        <SelectTrigger id="style-select" className="w-full mt-1">
                            <SelectValue placeholder="Select a style" />
                        </SelectTrigger>
                        <SelectContent>
                            {imageStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="aspect-ratio-select">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)} disabled={loading}>
                        <SelectTrigger id="aspect-ratio-select" className="w-full mt-1">
                            <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                            {aspectRatios.map(ar => <SelectItem key={ar} value={ar}>{ar}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Image
            </Button>
          </form>

          {(loading || imageUrl) && (
            <div className={cn(
              "mt-4 relative bg-muted rounded-md flex items-center justify-center",
              aspectRatio === '1:1' && 'aspect-square',
              aspectRatio === '16:9' && 'aspect-video',
              aspectRatio === '9:16' && 'aspect-[9/16]',
              aspectRatio === '4:3' && 'aspect-[4/3]',
              aspectRatio === '3:2' && 'aspect-[3/2]',
              aspectRatio === '3:4' && 'aspect-[3/4]',
              aspectRatio === '2:3' && 'aspect-[2/3]'
            )}>
              {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              {imageUrl && !loading && (
                <Image src={imageUrl} alt="Generated project image" fill className="rounded-md object-cover" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    