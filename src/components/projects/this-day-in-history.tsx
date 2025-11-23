'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, BookOpen, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface HistoryEvent {
  year: string;
  text: string;
}

interface HistoryData {
  date: string;
  events: HistoryEvent[];
  births: HistoryEvent[];
  deaths: HistoryEvent[];
}

const ThisDayInHistory: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      setError(null);
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      
      try {
        const response = await fetch(`https://byabbe.se/on-this-day/${month}/${day}/events.json`);
        if (!response.ok) throw new Error('Failed to fetch events.');
        const eventsData = await response.json();
        
        const birthsResponse = await fetch(`https://byabbe.se/on-this-day/${month}/${day}/births.json`);
        if (!birthsResponse.ok) throw new Error('Failed to fetch births.');
        const birthsData = await birthsResponse.json();
        
        const deathsResponse = await fetch(`https://byabbe.se/on-this-day/${month}/${day}/deaths.json`);
        if (!deathsResponse.ok) throw new Error('Failed to fetch deaths.');
        const deathsData = await deathsResponse.json();

        setData({
          date: eventsData.date,
          events: eventsData.events,
          births: birthsData.births,
          deaths: deathsData.deaths,
        });

      } catch (err) {
        setError((err as Error).message);
        toast({ title: 'Error', description: 'Could not fetch historical data. The API might be temporarily down.', variant: 'destructive'});
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [selectedDate, toast]);

  const EventList = ({ events }: { events: HistoryEvent[] }) => (
    <ul className="space-y-4">
        {events.map((event, index) => (
            <li key={index} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-x-4 items-start">
                <div className="flex-shrink-0 md:text-right">
                    <span className="font-bold text-lg text-primary">{event.year}</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{event.text}</p>
                </div>
            </li>
        ))}
    </ul>
  );

  return (
    <div className="w-full h-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h1 className="flex items-center gap-2 text-primary text-3xl font-bold">
                    <BookOpen /> This Day in History
                </h1>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="bg-card border-border hover:bg-muted">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{format(selectedDate, "MMMM do")}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </header>

            <main className="flex-grow flex flex-col overflow-hidden bg-card border border-border rounded-lg">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-destructive text-center p-8 flex flex-col items-center justify-center h-full">
                        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                        <p>{error}</p>
                        <Button onClick={() => setSelectedDate(new Date())} className="mt-4">Retry</Button>
                    </div>
                ) : data && (
                    <Tabs defaultValue="events" className="w-full h-full flex flex-col">
                        <div className="p-2">
                           <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                                <TabsTrigger value="events">Events ({data.events.length})</TabsTrigger>
                                <TabsTrigger value="births">Births ({data.births.length})</TabsTrigger>
                                <TabsTrigger value="deaths">Deaths ({data.deaths.length})</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <ScrollArea className="h-full px-6">
                                <TabsContent value="events"><EventList events={data.events} /></TabsContent>
                                <TabsContent value="births"><EventList events={data.births} /></TabsContent>
                                <TabsContent value="deaths"><EventList events={data.deaths} /></TabsContent>
                            </ScrollArea>
                        </div>
                    </Tabs>
                )}
            </main>
        </div>
    </div>
  );
};

export default ThisDayInHistory;
