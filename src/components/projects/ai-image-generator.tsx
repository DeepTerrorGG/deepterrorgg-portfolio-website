
'use client';

import { generateProjectImage } from '@/ai/flows/generate-project-image-flow';
import { type ImageStyle } from '@/ai/flows/generate-project-image-flow-types';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '../ui/label';

const imageStyles: ImageStyle[] = [
    'Default', 'Photorealistic', 'Cartoon', 'Watercolor', 'Cyberpunk', 'Minimalist', 'Fantasy Art', 'Pixel Art'
];

export default function AIImageGenerator() {
  const [description, setDescription] = useState<string>('a futuristic city skyline at dawn');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<ImageStyle>('Default');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImageUrl('');

    try {
      const url = await generateProjectImage({ description, style });
      setImageUrl(url);
    } catch (error) {
      console.error(error);
      // You might want to show an error to the user here
    }

    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 flex items-center justify-center bg-card h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>AI Image Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
             <div>
                <Label htmlFor="style-select">Artistic Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as ImageStyle)}>
                    <SelectTrigger id="style-select" className="w-full mt-1">
                        <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                        {imageStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Image
            </Button>
          </form>

          {loading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {imageUrl && (
            <div className="mt-4 aspect-square relative">
              <Image src={imageUrl} alt="Generated project image" fill className="rounded-md object-cover" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
