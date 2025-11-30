
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const SpotifyPlaylistGenerator: React.FC = () => {

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-8 text-center">
      <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Vibe-Based Playlist Generator</CardTitle>
            <CardDescription>This feature is currently unavailable.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
                <Image src="/icons/spotify.svg" alt="Spotify icon" width={20} height={20} className="mr-2"/>
                Login with Spotify
            </Button>
             <p className="text-xs text-muted-foreground mt-4">The authentication system for this project has been removed.</p>
          </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyPlaylistGenerator;
