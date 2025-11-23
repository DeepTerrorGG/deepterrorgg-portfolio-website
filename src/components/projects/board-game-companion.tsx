
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Users, Clock, Star, Dices, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

const API_KEY = process.env.NEXT_PUBLIC_BOARDGAMEATLAS_API_KEY;
const API_BASE_URL = 'https://api.boardgameatlas.com/api/search';

interface Game {
  id: string;
  name: string;
  year_published: number;
  min_players: number;
  max_players: number;
  min_playtime: number;
  max_playtime: number;
  description_preview: string;
  image_url: string;
  average_user_rating: number;
  rules_url: string | null;
  official_url: string | null;
}

const BoardGameCompanion: React.FC = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('Catan');
  const [results, setResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGames = async () => {
    if (!query.trim()) {
      toast({ title: "Search query is empty", variant: "destructive" });
      return;
    }
    if (!API_KEY) {
        setError("API Key is missing. Please add NEXT_PUBLIC_BOARDGAMEATLAS_API_KEY to your environment variables.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}?name=${encodeURIComponent(query)}&client_id=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch game data.');
      const data = await response.json();
      setResults(data.games);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const GameCard = ({ game }: { game: Game }) => (
    <Card className="flex flex-col md:flex-row gap-4 p-4">
        <div className="relative w-full md:w-1/3 aspect-[4/3] rounded-md overflow-hidden bg-muted">
            <Image src={game.image_url} alt={game.name} layout="fill" objectFit="cover" />
        </div>
        <div className="w-full md:w-2/3">
            <h3 className="font-bold text-lg">{game.name} <span className="text-muted-foreground font-normal">({game.year_published})</span></h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground my-2">
                <div className="flex items-center gap-1"><Users className="h-4 w-4"/> {game.min_players}-{game.max_players}</div>
                <div className="flex items-center gap-1"><Clock className="h-4 w-4"/> {game.min_playtime}-{game.max_playtime} min</div>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400"/> {game.average_user_rating.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">{game.description_preview}</p>
            <div className="flex gap-2 mt-3">
              {game.rules_url && <Button asChild size="sm" variant="outline"><a href={game.rules_url} target="_blank" rel="noopener noreferrer">Rules</a></Button>}
              {game.official_url && <Button asChild size="sm" variant="outline"><a href={game.official_url} target="_blank" rel="noopener noreferrer">Official Site</a></Button>}
            </div>
        </div>
    </Card>
  );

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Dices /> Board Game Companion
          </CardTitle>
          <CardDescription className="text-center">
            Search for your favorite board games.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Search for a board game..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchGames()}
              disabled={isLoading}
            />
            <Button onClick={searchGames} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {error && (
            <div className="text-destructive text-center p-4">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>{error}</p>
            </div>
          )}
          
          <ScrollArea className="flex-grow">
            <div className="p-1 space-y-4">
              {results.length > 0 && results.map(game => <GameCard key={game.id} game={game} />)}
              {!isLoading && results.length === 0 && !error && (
                  <div className="text-center text-muted-foreground pt-10">
                      <p>No games found. Try searching for something!</p>
                  </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardGameCompanion;
