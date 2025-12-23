'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PlayerNameModalProps {
    isOpen: boolean;
    onNameSubmit: (name: string, playerId: string) => void;
    gameName: string;
    description?: string;
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
    isOpen,
    onNameSubmit,
    gameName,
    description = "Enter your name to compete on the global leaderboard!"
}) => {
    const [name, setName] = useState('');
    const [playerId, setPlayerId] = useState('');

    useEffect(() => {
        // Get or create player ID
        let id = localStorage.getItem('player_id');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('player_id', id);
        }
        setPlayerId(id);

        // Load saved name if exists
        const savedName = localStorage.getItem('player_name');
        if (savedName) {
            setName(savedName);
        }
    }, []);

    const handleSubmit = () => {
        const trimmedName = name.trim();
        if (trimmedName.length < 2) return;

        // Save name to localStorage
        localStorage.setItem('player_name', trimmedName);

        onNameSubmit(trimmedName, playerId);
    };

    const isValid = name.trim().length >= 2 && name.trim().length <= 20;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Welcome to {gameName}!
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="player-name">Your Name</Label>
                        <Input
                            id="player-name"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
                            maxLength={20}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            {name.length}/20 characters (min. 2)
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!isValid} className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Start Playing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
