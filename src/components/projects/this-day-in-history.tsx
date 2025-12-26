
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';

interface HistoryEvent {
  year: number;
  text: string;
  pages: {
    thumbnail?: {
      source: string;
    };
    titles: {
      normalized: string;
    }
  }[];
}

type HistoryData = {
  events?: HistoryEvent[];
  births?: HistoryEvent[];
  deaths?: HistoryEvent[];
};

type Category = 'events' | 'births' | 'deaths';

import DOMPurify from 'dompurify';

const EventList: React.FC<{ events: HistoryEvent[] | undefined }> = ({ events }) => {
  if (!events || events.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No events found for this day.</p>;
  }

  return (
    <motion.ul
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.05 } }}
      className="space-y-4"
    >
      {events.map((event, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-[80px_1fr] gap-4 items-start"
        >
          <span className="text-primary font-bold text-lg text-right">{event.year}</span>
          <p className="text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.text) }} />
        </motion.li>
      ))}
    </motion.ul>
  );
};


const ThisDayInHistory: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Category>('events');

  const fetchHistory = useCallback(async (d: Date) => {
    setIsLoading(true);
    setError(null);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    // Using Wikipedia's On This Day API
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data from Wikipedia API. Status: ${response.status}`);
      }
      const result = await response.json();

      // The Wikipedia API has a slightly different structure
      const formattedData: HistoryData = {
        events: result.events,
        births: result.births,
        deaths: result.deaths,
      };

      setData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(date);
  }, [date, fetchHistory]);

  const currentEvents = useMemo(() => data?.[activeTab], [data, activeTab]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl mx-auto shadow-2xl flex flex-col h-[80vh]">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">This Day in History</CardTitle>
          <div className="flex justify-center mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Category)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="births">Births</TabsTrigger>
              <TabsTrigger value="deaths">Deaths</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-grow mt-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col justify-center items-center h-48 text-destructive">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      <p>{error}</p>
                    </div>
                  ) : (
                    <EventList events={currentEvents} />
                  )}
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThisDayInHistory;
