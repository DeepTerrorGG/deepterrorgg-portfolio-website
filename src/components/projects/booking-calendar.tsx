'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { add, format, startOfDay, getDay, isBefore, isEqual, set } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Check, Loader2, Clock, CalendarDays, ChevronRight } from 'lucide-react';

// --- CONFIGURATION ---
const SLOT_DURATION_MINUTES = 30;
const WEEKLY_AVAILABILITY = [
  [],                                          // Sun
  [{ start: '09:00', end: '17:00' }],          // Mon
  [{ start: '09:00', end: '17:00' }],          // Tue
  [{ start: '10:00', end: '18:00' }],          // Wed
  [{ start: '09:00', end: '17:00' }],          // Thu
  [{ start: '09:00', end: '14:00' }],          // Fri
  [],                                          // Sat
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AVAILABILITY_HOURS = ['09:00–17:00', '—', '09:00–17:00', '10:00–18:00', '09:00–17:00', '09:00–14:00', '—'];

const BookingCalendar: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        seconds: 0, milliseconds: 0,
      });
      const end = set(selectedDate, {
        hours: parseInt(period.end.split(':')[0]),
        minutes: parseInt(period.end.split(':')[1]),
        seconds: 0, milliseconds: 0,
      });
      while (current < end) {
        if (isBefore(now, current) && !bookedSlots.some(b => isEqual(b, current))) {
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
      toast({ title: 'Cannot select a past date', variant: 'destructive' });
      return;
    }
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleBooking = async () => {
    if (!name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    setIsBooking(true);
    await new Promise(res => setTimeout(res, 1400));
    if (bookedSlots.some(b => isEqual(b, selectedTime!))) {
      toast({ title: 'Slot Unavailable', description: 'This slot was just booked. Please select another.', variant: 'destructive' });
      setIsBooking(false);
      return;
    }
    setBookedSlots(prev => [...prev, selectedTime!]);
    setIsBooking(false);
    setIsSuccess(true);
  };

  const reset = () => {
    setSelectedDate(undefined);
    setSelectedTime(null);
    setName('');
    setIsSuccess(false);
  };

  // ─── SUCCESS SCREEN ───────────────────────────────────────────
  if (isSuccess && selectedTime) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#000] p-6 font-mono">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-14 h-14 border border-white flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[#444] text-[10px] tracking-[0.3em] uppercase mb-2">Booking Confirmed</p>
            <h2 className="text-white text-2xl font-semibold tracking-tight">You're scheduled.</h2>
          </div>
          <div className="border border-[#1f1f1f] bg-[#080808] text-left divide-y divide-[#1a1a1a]">
            <div className="flex items-center gap-3 p-4">
              <CalendarDays className="w-4 h-4 text-[#444] shrink-0" />
              <div>
                <p className="text-[#444] text-[10px] tracking-widest uppercase mb-0.5">Date</p>
                <p className="text-white text-sm">{format(selectedTime, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Clock className="w-4 h-4 text-[#444] shrink-0" />
              <div>
                <p className="text-[#444] text-[10px] tracking-widest uppercase mb-0.5">Time</p>
                <p className="text-white text-sm">{format(selectedTime, 'h:mm a')} — 30 min session</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[#444] text-[10px] tracking-widest uppercase mb-0.5">Name</p>
              <p className="text-white text-sm">{name}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="w-full border border-[#222] bg-[#0a0a0a] hover:bg-white hover:text-black text-[#555] text-[10px] py-3 tracking-[0.2em] uppercase transition-all duration-200"
          >
            Book Another Slot
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN LAYOUT ──────────────────────────────────────────────
  return (
    <div className="flex items-start justify-center w-full h-full bg-[#000] font-mono overflow-auto">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row min-h-full">

        {/* ── LEFT: Calendar ─────────────────────────────────── */}
        <div className="lg:w-[420px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#1a1a1a] p-6 flex flex-col gap-6">

          {/* Header */}
          <div className="border-b border-[#1a1a1a] pb-5">
            <p className="text-[#3a3a3a] text-[10px] tracking-[0.3em] uppercase mb-2">~/schedule</p>
            <h1 className="text-white text-xl font-semibold tracking-tight">Book a Meeting</h1>
            <p className="text-[#444] text-xs mt-1">30-minute sessions · Mon–Fri</p>
          </div>

          {/* Calendar with dark classNames override */}
          <div>
            <p className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase mb-3">Select a Date</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                isBefore(date, startOfDay(new Date())) ||
                WEEKLY_AVAILABILITY[getDay(date)].length === 0
              }
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                caption: 'flex justify-center relative items-center mb-2',
                caption_label: 'text-sm text-white font-medium tracking-wider',
                nav: 'flex items-center gap-1',
                nav_button: 'h-7 w-7 flex items-center justify-center border border-[#222] bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:text-white text-[#555] transition-colors rounded-none',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex justify-between',
                head_cell: 'text-[#333] text-[10px] tracking-widest uppercase w-9 text-center font-normal',
                row: 'flex justify-between mt-1',
                cell: 'relative h-9 w-9 text-center text-sm p-0',
                day: 'h-9 w-9 p-0 font-normal text-[#666] hover:bg-[#1a1a1a] hover:text-white transition-colors',
                day_selected: 'bg-white text-black hover:bg-white hover:text-black font-semibold',
                day_today: 'text-white border border-[#333]',
                day_outside: 'text-[#252525] pointer-events-none',
                day_disabled: 'text-[#222] pointer-events-none opacity-40',
                day_hidden: 'invisible',
              }}
            />
          </div>

          {/* Availability legend */}
          <div className="border-t border-[#1a1a1a] pt-5">
            <p className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase mb-3">Availability</p>
            <div className="space-y-1.5">
              {DAY_LABELS.map((day, i) => (
                <div key={day} className="flex items-center justify-between">
                  <span className={cn('text-[10px] tracking-widest uppercase', WEEKLY_AVAILABILITY[i].length > 0 ? 'text-[#555]' : 'text-[#2a2a2a]')}>{day}</span>
                  <span className={cn('text-[10px] font-mono', WEEKLY_AVAILABILITY[i].length > 0 ? 'text-[#666]' : 'text-[#2a2a2a]')}>{AVAILABILITY_HOURS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Time + Confirm ──────────────────────────── */}
        <div className="flex-1 p-6 flex flex-col gap-6">

          {/* Time slot picker */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase mb-1">Available Times</p>
                {selectedDate
                  ? <p className="text-white text-sm">{format(selectedDate, 'EEEE, MMMM d')}</p>
                  : <p className="text-[#333] text-sm">Select a date first</p>
                }
              </div>
              {selectedDate && (
                <span className="text-[10px] tracking-widest uppercase text-[#333] border border-[#1a1a1a] px-2 py-1">
                  {availableTimeSlots.length} slots
                </span>
              )}
            </div>

            {!selectedDate && (
              <div className="border border-[#111] bg-[#050505] h-48 flex items-center justify-center">
                <p className="text-[#2a2a2a] text-xs tracking-widest uppercase">← Pick a date on the calendar</p>
              </div>
            )}

            {selectedDate && availableTimeSlots.length === 0 && (
              <div className="border border-[#111] bg-[#050505] h-48 flex items-center justify-center">
                <p className="text-[#333] text-xs tracking-widest uppercase">No slots available</p>
              </div>
            )}

            {selectedDate && availableTimeSlots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimeSlots.map(time => {
                  const isSelected = selectedTime && isEqual(time, selectedTime);
                  return (
                    <button
                      key={time.toISOString()}
                      onClick={() => setSelectedTime(isSelected ? null : time)}
                      className={cn(
                        'border text-xs py-2.5 tracking-wider uppercase transition-all duration-150',
                        isSelected
                          ? 'bg-white text-black border-white font-semibold'
                          : 'border-[#1f1f1f] bg-[#0a0a0a] text-[#777] hover:border-[#444] hover:text-white'
                      )}
                    >
                      {format(time, 'h:mm a')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm form — shows only when time is selected */}
          {selectedTime && (
            <div className="border-t border-[#1a1a1a] pt-6 flex flex-col gap-5 flex-1">
              <div>
                <p className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase mb-4">Confirm Booking</p>

                {/* Summary */}
                <div className="border border-[#1a1a1a] bg-[#070707] divide-y divide-[#111] mb-5">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <CalendarDays className="w-3.5 h-3.5 text-[#333] shrink-0" />
                    <span className="text-[#888] text-xs">{format(selectedTime, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-[#333] shrink-0" />
                      <span className="text-[#888] text-xs">{format(selectedTime, 'h:mm a')} — 30 min</span>
                    </div>
                    <button
                      onClick={() => setSelectedTime(null)}
                      className="text-[#333] hover:text-white text-[10px] tracking-widest uppercase transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Name input */}
                <div className="space-y-2">
                  <label className="text-[#3a3a3a] text-[10px] tracking-[0.2em] uppercase block">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isBooking && handleBooking()}
                    className="w-full bg-transparent border-b border-[#1f1f1f] focus:border-white outline-none text-white text-sm py-2.5 placeholder-[#2a2a2a] transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleBooking}
                disabled={isBooking || !name.trim()}
                className="w-full bg-white text-black hover:bg-[#e8e8e8] disabled:bg-[#111] disabled:text-[#333] disabled:border disabled:border-[#1f1f1f] text-xs font-semibold py-3.5 tracking-[0.2em] uppercase transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
              >
                {isBooking
                  ? <><Loader2 className="animate-spin h-4 w-4" /> Booking...</>
                  : <><Check className="h-4 w-4" /> Confirm Booking<ChevronRight className="h-4 w-4" /></>
                }
              </button>
            </div>
          )}

          {/* Placeholder if no time selected yet */}
          {!selectedTime && selectedDate && availableTimeSlots.length > 0 && (
            <div className="border-t border-[#1a1a1a] pt-6 flex-1 flex items-center justify-center">
              <p className="text-[#252525] text-xs tracking-widest uppercase">↑ Select a time slot to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
