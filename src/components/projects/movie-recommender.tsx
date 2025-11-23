
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Film, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

const MovieRecommender: React.FC = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMovies = async () => {
    if (!query.trim()) {
      toast({ title: "Search query is empty", variant: "destructive" });
      return;
    }
    if (!API_KEY) {
        setError("API Key is missing. Please add NEXT_PUBLIC_TMDB_API_KEY to your environment variables.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);
    setRecommendations([]);
    setSelectedMovie(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch search results.');
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendations = async (movieId: number) => {
    if (!API_KEY) {
        setError("API Key is missing.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`${API_BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations.');
      const data = await response.json();
      setRecommendations(data.results);
      const selected = results.find(r => r.id === movieId) || await fetch(`${API_BASE_URL}/movie/${movieId}?api_key=${API_KEY}`).then(res => res.json());
      setSelectedMovie(selected);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Film /> Movie Recommender
          </CardTitle>
          <CardDescription className="text-center">
            Search for a movie to get similar recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Search for a movie..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchMovies()}
              disabled={isLoading}
            />
            <Button onClick={searchMovies} disabled={isLoading}>
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
            <div className="p-1">
              {selectedMovie && (
                <div className="mb-4 p-2 rounded-lg bg-muted/50">
                  <h3 className="font-bold text-center">Recommendations for "{selectedMovie.title}"</h3>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(results.length > 0 ? results : recommendations).map(movie => (
                  <Card key={movie.id} className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => getRecommendations(movie.id)}>
                    <div className="aspect-[2/3] relative bg-muted">
                      {movie.poster_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} layout="fill" objectFit="cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground"><Film /></div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="font-bold text-sm truncate">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">{movie.release_date.split('-')[0]}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovieRecommender;
