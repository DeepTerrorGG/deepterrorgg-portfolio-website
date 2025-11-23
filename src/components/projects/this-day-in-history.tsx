
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

  const EventList = ({ title, events }: { title: string, events: HistoryEvent[] }) => (
    <div>
        <h3 className="font-bold text-lg mb-4 text-primary">{title}</h3>
        <ul className="space-y-4">
            {events.map((event, index) => (
                <li key={index} className="flex gap-4 items-start">
                    <span className="font-bold text-muted-foreground w-12 text-right">{event.year}</span>
                    <p className="flex-1 text-sm border-l-2 border-border pl-4">{event.text}</p>
                </li>
            ))}
        </ul>
    </div>
  );

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <BookOpen /> This Day in History
          </CardTitle>
           <CardDescription className="text-center">
            Explore what happened on {format(selectedDate, 'MMMM do')}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="w-full lg:w-auto flex flex-col items-center justify-center">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="p-3 border rounded-md bg-muted/20"
                />
            </div>
            <div className="flex-grow lg:w-2/3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                 <ScrollArea className="h-[60vh] lg:h-full pr-4">
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
                        <div className="space-y-8">
                            <EventList title="Events" events={data.events} />
                            <EventList title="Births" events={data.births} />
                            <EventList title="Deaths" events={data.deaths} />
                        </div>
                    )}
                 </ScrollArea>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThisDayInHistory;
