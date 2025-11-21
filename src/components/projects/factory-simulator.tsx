'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box } from 'lucide-react';

const FactorySimulator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8 text-center">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Automation Simulator</CardTitle>
           <p className="text-muted-foreground">Coming Soon!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-background rounded-lg flex items-center justify-center p-4">
            <p className="text-muted-foreground italic">Game preview will be shown here...</p>
          </div>
          <div className="flex justify-around">
            <div className="flex items-center gap-2">
                <HardHat className="h-6 w-6 text-yellow-500" />
                <div>
                    <p className="font-bold">Iron Ore</p>
                    <p className="text-sm text-muted-foreground">1,204/min</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Cog className="h-6 w-6 text-gray-500" />
                <div>
                    <p className="font-bold">Gears</p>
                    <p className="text-sm text-muted-foreground">56/min</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Box className="h-6 w-6 text-green-500" />
                <div>
                    <p className="font-bold">Circuits</p>
                    <p className="text-sm text-muted-foreground">12/min</p>
                </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Build, automate, and optimize. Your factory awaits your command.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactorySimulator;
