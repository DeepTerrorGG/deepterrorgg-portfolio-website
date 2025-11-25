'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { add, format, startOfDay, getDay, isBefore, isEqual, set } from 'date-fns';
import { Clock, User, Check, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '@/components/ui/input';

// --- CONFIGURATION ---
const SLOT_DURATION_MINUTES = 30;
const WEEKLY_AVAILABILITY = [
  // Sunday to Saturday
  [], // Sun
  [{ start: '09:00', end: '17:00' }], // Mon
  [{ start: '09:00', end: '17:00' }], // Tue
  [{ start: '10:00', end: '18:00' }], // Wed
  [{ start: '09:00', end: '17:00' }], // Thu
  [{ start: '09:00', end: '14:00' }], // Fri
  [], // Sat
];

const BookingCalendar: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [view, setView] = useState<'date' | 'time' | 'confirm' | 'success'>('date');
  const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = getDay(selectedDate);
    const availabilityForDay = WEEKLY_AVAILABILITY[dayOfWeek];
    if (availabilityForDay.length === 0) return [];

    const slots: Date[] = [];
    const now = new Date();

    availabilityForDay.forEach(period => {
      let current = set(selectedDate, {
        hours: parseInt(period.start.split(':')[0]),
        minutes: parseInt(period.start.split(':')[1]),
        seconds: 0,
        milliseconds: 0,
      });

      const end = set(selectedDate, {
        hours: parseInt(period.end.split(':')[0]),
        minutes: parseInt(period.end.split(':')[1]),
        seconds: 0,
        milliseconds: 0,
      });

      while (current < end) {
        // Only show slots in the future
        if (isBefore(now, current) && !bookedSlots.some(bookedSlot => isEqual(bookedSlot, current))) {
          slots.push(current);
        }
        current = add(current, { minutes: SLOT_DURATION_MINUTES });
      }
    });

    return slots;
  }, [selectedDate, bookedSlots]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isBefore(date, startOfDay(new Date()))) {
        toast({ title: "Cannot select a past date", variant: "destructive"});
        return;
    }
    setSelectedDate(date);
    setView('time');
  }

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setView('confirm');
  }
  
  const handleBooking = async () => {
    if (!name.trim()) {
        toast({ title: 'Name is required', variant: 'destructive'});
        return;
    }
    setIsBooking(true);
    
    // Simulate API call
    await new Promise(res => setTimeout(res, 1500));
    
    // Check for race condition (slot booked while user was confirming)
    if (bookedSlots.some(bookedSlot => isEqual(bookedSlot, selectedTime!))) {
        toast({ title: 'Slot Unavailable', description: 'This slot was just booked by someone else. Please select another time.', variant: 'destructive' });
        setView('time');
        setIsBooking(false);
        return;
    }

    setBookedSlots(prev => [...prev, selectedTime!]);
    setIsBooking(false);
    setView('success');
  };
  
  const reset = () => {
    setSelectedDate(new Date());
    setSelectedTime(null);
    setName('');
    setView('date');
  }

  const renderContent = () => {
    switch(view) {
        case 'date':
            return (
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => isBefore(date, startOfDay(new Date())) || WEEKLY_AVAILABILITY[getDay(date)].length === 0}
                    className="flex justify-center"
                />
            );
        case 'time':
            return (
                <div className="flex flex-col items-center">
                    <p className="font-semibold mb-4">Select a time for {format(selectedDate!, 'EEEE, MMMM d')}</p>
                    <ScrollArea className="h-64 w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-4">
                            {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                                <Button key={time.toISOString()} variant="outline" onClick={() => handleTimeSelect(time)}>
                                    {format(time, 'p')}
                                </Button>
                            )) : <p className="col-span-full text-center text-muted-foreground">No available slots for this day.</p>}
                        </div>
                    </ScrollArea>
                    <Button variant="link" onClick={() => setView('date')} className="mt-4">Back to calendar</Button>
                </div>
            );
        case 'confirm':
            return (
                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-muted-foreground">You are booking a slot for:</p>
                    <p className="text-xl font-bold text-primary">{format(selectedTime!, 'p')} on {format(selectedTime!, 'EEEE, MMMM d')}</p>
                    <div className="w-full space-y-2">
                        <label htmlFor="name-input">Your Name</label>
                        <Input id="name-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" onClick={() => setView('time')} className="flex-1">Back</Button>
                        <Button onClick={handleBooking} disabled={isBooking} className="flex-1">
                            {isBooking ? <Loader2 className="animate-spin mr-2"/> : <Check className="mr-2"/>}
                            Confirm
                        </Button>
                    </div>
                </div>
            );
        case 'success':
             return (
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Check size={40}/>
                    </div>
                    <h3 className="text-xl font-bold">Booking Confirmed!</h3>
                    <p className="text-muted-foreground">
                        Your meeting with <span className="font-semibold text-foreground">{name}</span> is scheduled for <br/>
                        <span className="text-primary">{format(selectedTime!, 'p')} on {format(selectedTime!, 'EEEE, MMMM d')}</span>.
                    </p>
                    <Button onClick={reset} className="mt-4">Book Another Slot</Button>
                </div>
            );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl justify-center text-primary">
            <Clock /> Book a Meeting
          </CardTitle>
          <CardDescription className="text-center">Select a date and time to schedule your 30-minute slot.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[20rem] flex flex-col justify-center">
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
