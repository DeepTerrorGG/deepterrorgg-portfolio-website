
'use client';

import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const SpotifyPlaylistGenerator: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center w-full h-full bg-card p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-card p-8 text-center">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Logged In!</CardTitle>
                <CardDescription>Welcome, {session.user?.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {session.user?.image && (
                    <Image src={session.user.image} alt="User profile picture" width={80} height={80} className="rounded-full"/>
                )}
                <p className="text-sm text-muted-foreground">You are now ready to generate vibe-based playlists.</p>
                <Button onClick={() => signOut()} variant="destructive">Sign Out</Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-8 text-center">
      <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Vibe-Based Playlist Generator</CardTitle>
            <CardDescription>Connect your Spotify account to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signIn('spotify')} className="w-full">
                <Image src="/icons/spotify.svg" alt="Spotify icon" width={20} height={20} className="mr-2"/>
                Login with Spotify
            </Button>
          </CardContent>
      </Card>
    </div>
  );
};

export default SpotifyPlaylistGenerator;
