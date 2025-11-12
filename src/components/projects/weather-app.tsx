'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  name: string;
}

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

const WeatherApp: React.FC = () => {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="w-16 h-16 text-yellow-400" />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-16 h-16 text-gray-400" />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (iconCode.includes('13')) return <CloudSnow className="w-16 h-16 text-white" />;
    return <Sun className="w-16 h-16 text-yellow-400" />;
  };

  useEffect(() => {
    const fetchWeatherData = (lat: number, lon: number) => {
      setIsLoading(true);
      setError(null);
      
      if (!API_KEY) {
        setError('OpenWeatherMap API key is missing. Please add it to your environment variables.');
        toast({ title: "Configuration Error", description: 'API key is missing.', variant: "destructive" });
        setIsLoading(false);
        return;
      }

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(response => {
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            }
            throw new Error('Failed to fetch weather data. Please try again later.');
          }
          return response.json();
        })
        .then(data => {
          setWeatherData(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          toast({ title: "Error", description: err.message, variant: "destructive" });
          setIsLoading(false);
        });
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            setError("Geolocation permission denied. Please enable location services to use this app.");
            toast({ title: "Location Error", description: "Geolocation permission denied.", variant: "destructive" });
            setIsLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
        toast({ title: "Compatibility Error", description: "Geolocation is not supported.", variant: "destructive" });
        setIsLoading(false);
      }
    };
    
    getLocation();
  }, [toast]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!API_KEY) {
              setError('OpenWeatherMap API key is missing.');
              setIsLoading(false);
              return;
            }
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric`)
              .then(res => {
                  if (!res.ok) throw new Error('Failed to fetch on retry.');
                  return res.json();
              })
              .then(data => {
                  setWeatherData(data);
                  setIsLoading(false);
              })
              .catch(() => {
                  setError("Failed to fetch weather data on retry.");
                  setIsLoading(false);
              });
          },
          () => {
            setError("Geolocation permission was denied on retry.");
            setIsLoading(false);
          }
        );
      }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Fetching weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      {weatherData && (
        <Card className="w-full max-w-sm mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">{weatherData.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {getWeatherIcon(weatherData.weather[0].icon)}
              <div>
                <p className="text-6xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
                <p className="text-muted-foreground capitalize">{weatherData.weather[0].description}</p>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 text-center border-t pt-4">
              <div>
                <p className="font-bold text-lg">{Math.round(weatherData.main.feels_like)}°C</p>
                <p className="text-sm text-muted-foreground">Feels Like</p>
              </div>
              <div>
                <p className="font-bold text-lg">{weatherData.main.humidity}%</p>
                <p className="text-sm text-muted-foreground">Humidity</p>
              </div>
              <div className="col-span-2 flex items-center justify-center gap-2">
                <Wind className="h-5 w-5 text-muted-foreground"/>
                <p className="font-bold text-lg">{weatherData.wind.speed.toFixed(1)} m/s</p>
                <p className="text-sm text-muted-foreground">Wind</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherApp;
