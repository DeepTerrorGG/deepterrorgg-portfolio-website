'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Coins, Treasure } from 'lucide-react';

const DeckBuildingRoguelike: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8 text-center">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Deck-Builder Adventure</CardTitle>
          <p className="text-muted-foreground">Coming Soon!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-background rounded-lg flex items-center justify-center p-4">
            <p className="text-muted-foreground italic">Game preview will be shown here...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <Card className="p-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                    <CardTitle className="text-sm font-medium">Player HP</CardTitle>
                    <Heart className="h-4 w-4 text-red-500"/>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-2xl font-bold">80/80</div>
                </CardContent>
            </Card>
             <Card className="p-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                    <CardTitle className="text-sm font-medium">Enemy HP</CardTitle>
                    <Shield className="h-4 w-4 text-gray-500"/>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-2xl font-bold">52/52</div>
                </CardContent>
            </Card>
             <Card className="p-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                    <CardTitle className="text-sm font-medium">Gold</CardTitle>
                    <Coins className="h-4 w-4 text-yellow-500"/>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-2xl font-bold">99</div>
                </CardContent>
            </Card>
             <Card className="p-4">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
                    <CardTitle className="text-sm font-medium">Floor</CardTitle>
                    <Treasure className="h-4 w-4 text-amber-600"/>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-2xl font-bold">1</div>
                </CardContent>
            </Card>
          </div>
           <div className="flex justify-center gap-2">
                <Card className="w-24 h-32 bg-secondary p-2 flex flex-col justify-between items-center text-center border-2 border-primary">
                    <p className="text-xs font-bold">Strike</p>
                    <Swords className="h-8 w-8"/>
                    <p className="text-xs">Deal 6 damage.</p>
                </Card>
                 <Card className="w-24 h-32 bg-secondary p-2 flex flex-col justify-between items-center text-center">
                    <p className="text-xs font-bold">Defend</p>
                    <Shield className="h-8 w-8"/>
                    <p className="text-xs">Gain 5 block.</p>
                </Card>
            </div>
            <Button disabled>End Turn</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeckBuildingRoguelike;
