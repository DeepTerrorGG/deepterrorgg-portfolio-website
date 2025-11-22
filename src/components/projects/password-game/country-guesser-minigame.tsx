
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const locations = [
    { src: 'https://i.imgur.com/v4HnG5N.jpg', country: 'Japan', hint: 'East Asian country known for cherry blossoms and temples.' },
    { src: 'https://i.imgur.com/5l3zS5A.jpg', country: 'Italy', hint: 'European country famous for ancient ruins and canals.' },
    { src: 'https://i.imgur.com/a5nCeJj.jpg', country: 'Peru', hint: 'South American country with ancient Incan sites in the Andes.' },
    { src: 'https://i.imgur.com/iR3N1mF.jpg', country: 'Egypt', hint: 'North African country, site of pyramids and the Sphinx.' },
    { src: 'https://i.imgur.com/3YpEXV7.jpg', country: 'USA', hint: 'A view of the Grand Canyon in this North American country.' },
    { src: 'https://i.imgur.com/L4pPZt9.jpg', country: 'France', hint: 'European country, home to the Eiffel Tower and the Louvre.' },
    { src: 'https://i.imgur.com/TIZ1MMu.jpg', country: 'Brazil', hint: 'South American country known for its carnival and the Christ the Redeemer statue.' },
    { src: 'https://i.imgur.com/o5e5aF2.jpg', country: 'Australia', hint: 'Known for its unique wildlife and the Sydney Opera House.' },
    { src: 'https://i.imgur.com/kXk3u42.jpg', country: 'China', hint: 'This section of its Great Wall is a famous landmark.' },
    { src: 'https://i.imgur.com/5fX8E0p.jpg', country: 'India', hint: 'Home to the iconic Taj Mahal.' },
    { src: 'https://i.imgur.com/mY3mJv7.jpg', country: 'Canada', hint: 'North American country known for its vast wilderness and maple syrup.' },
    { src: 'https://i.imgur.com/eEpmI3q.jpg', country: 'Russia', hint: 'The Red Square and St. Basil\'s Cathedral are located here.' },
    { src: 'https://i.imgur.com/8QZ3Y3a.jpg', country: 'South Africa', hint: 'African country with Table Mountain overlooking one of its major cities.' },
    { src: 'https://i.imgur.com/YJGRj1D.jpg', country: 'Mexico', hint: 'This country is famous for its ancient Mayan and Aztec ruins.' },
    { src: 'https://i.imgur.com/c8kSN8k.jpg', country: 'Greece', hint: 'Known for its ancient philosophers and the Acropolis of Athens.' },
    { src: 'https://i.imgur.com/2X3l3N9.jpg', country: 'United Kingdom', hint: 'This country\'s capital city features the iconic Tower Bridge.' },
    { src: 'https://i.imgur.com/N6uIq1s.jpg', country: 'Argentina', hint: 'South American country known for tango, steak, and Patagonia.' },
    { src: 'https://i.imgur.com/uR1uQMN.jpg', country: 'New Zealand', hint: 'An island nation famous for its dramatic landscapes and Maori culture.' },
    { src: 'https://i.imgur.com/T0aAo7e.jpg', country: 'Thailand', hint: 'Southeast Asian country known for its tropical beaches and ornate temples.' },
    { src: 'https://i.imgur.com/cWpANFU.jpg', country: 'Turkey', hint: 'This city, straddling two continents, is famous for its historic mosques.' },
];

const getLocationForDay = () => {
    const today = new Date();
    const dayIndex = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return locations[dayIndex % locations.length];
};

export const getCountryGuesserSolution = () => getLocationForDay().country;

let isSolved = false;
export const isCountryGuesserSolved = () => isSolved;

export const CountryGuesserMinigame: React.FC = () => {
    const { toast } = useToast();
    const location = useMemo(() => getLocationForDay(), []);
    const [guess, setGuess] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const handleGuess = () => {
        if (guess.trim().toLowerCase() === location.country.toLowerCase()) {
            setIsCorrect(true);
            isSolved = true;
            toast({ title: 'Correct!', description: `The country is indeed ${location.country}.` });
        } else {
            toast({ title: 'Incorrect', description: 'That\'s not the right country. Try again!', variant: 'destructive' });
        }
    };

    return (
        <div className="bg-muted/30 p-4 rounded-md space-y-3">
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={location.src} alt="A street view of a location to guess" layout="fill" objectFit="cover" />
            </div>
             <p className="text-xs text-muted-foreground italic">Hint: {location.hint}</p>
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter country name"
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    disabled={isCorrect}
                />
                <Button onClick={handleGuess} disabled={isCorrect}>Guess</Button>
            </div>
            {isCorrect && <p className="text-center text-sm mt-2 text-green-400">The password rule is now satisfied.</p>}
        </div>
    );
}
