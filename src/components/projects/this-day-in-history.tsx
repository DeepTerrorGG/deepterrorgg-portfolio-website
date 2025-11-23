
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        toast({ title: 'Error', description: 'Could not fetch historical data.', variant: 'destructive'});
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [selectedDate, toast]);

  const EventList = ({ events }: { events: HistoryEvent[] }) => (
    <ul className="space-y-4">
        {events.map((event, index) => (
            <li key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-16 text-right">
                    <span className="font-bold text-lg text-primary">{event.year}</span>
                </div>
                <div className="border-l-2 border-border pl-4 flex-1">
                    <p className="text-sm text-muted-foreground">{event.text}</p>
                </div>
            </li>
        ))}
    </ul>
  );

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
              <BookOpen /> This Day in History
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"}>
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
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-destructive text-center p-4">
                    <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                    <p>{error}</p>
                    <Button onClick={() => setSelectedDate(new Date())} className="mt-4">Retry</Button>
                </div>
            ) : data && (
                <Tabs defaultValue="events" className="w-full flex-grow flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="events">Events ({data.events.length})</TabsTrigger>
                        <TabsTrigger value="births">Births ({data.births.length})</TabsTrigger>
                        <TabsTrigger value="deaths">Deaths ({data.deaths.length})</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow mt-4 overflow-hidden">
                        <ScrollArea className="h-full pr-4">
                            <TabsContent value="events"><EventList events={data.events} /></TabsContent>
                            <TabsContent value="births"><EventList events={data.births} /></TabsContent>
                            <TabsContent value="deaths"><EventList events={data.deaths} /></TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThisDayInHistory;
