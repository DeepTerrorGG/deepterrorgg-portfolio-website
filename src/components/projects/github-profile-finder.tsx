'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Search, Loader2, Github, Users, Book, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  company: string;
  location: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

const GithubProfileFinder: React.FC = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = async () => {
    if (username.trim() === '') {
      toast({ title: 'Username required', description: 'Please enter a GitHub username.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setUserData(null);
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data: GitHubUser = await response.json();
      setUserData(data);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchUserData();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Github className="h-6 w-6" />
            GitHub Profile Finder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={fetchUserData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && <Loader2 className="mt-8 h-8 w-8 animate-spin text-primary" />}

      {userData && (
        <Card className="w-full max-w-md mx-auto mt-6 shadow-2xl animate-fade-in">
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={userData.avatar_url} alt={userData.login} />
              <AvatarFallback>{userData.login.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl pt-2">{userData.name || userData.login}</CardTitle>
            <p className="text-muted-foreground">@{userData.login}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>{userData.bio || 'No bio provided.'}</p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                {userData.company && <p>{userData.company}</p>}
                {userData.location && <p>{userData.location}</p>}
            </div>
            <div className="flex justify-around border-t pt-4">
                <div className="text-center">
                    <p className="font-bold text-lg">{userData.public_repos}</p>
                    <p className="text-xs text-muted-foreground">REPOSITORIES</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{userData.followers}</p>
                    <p className="text-xs text-muted-foreground">FOLLOWERS</p>
                </div>
                 <div className="text-center">
                    <p className="font-bold text-lg">{userData.following}</p>
                    <p className="text-xs text-muted-foreground">FOLLOWING</p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
                <Link href={userData.html_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4"/>
                    View on GitHub
                </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default GithubProfileFinder;
