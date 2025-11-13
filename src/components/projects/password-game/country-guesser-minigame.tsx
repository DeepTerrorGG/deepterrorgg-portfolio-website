
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const locations = [
    { src: '/password-game/japan.jpg', country: 'Japan', hint: 'East Asian country known for cherry blossoms and temples.' },
    { src: '/password-game/italy.jpg', country: 'Italy', hint: 'European country famous for ancient ruins and canals.' },
    { src: '/password-game/peru.jpg', country: 'Peru', hint: 'South American country with ancient Incan sites in the Andes.' },
    { src: '/password-game/egypt.jpg', country: 'Egypt', hint: 'North African country, site of pyramids and the Sphinx.' },
    { src: '/password-game/usa.jpg', country: 'USA', hint: 'North American country with iconic canyons and cityscapes.' },
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
