'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const GridCell: React.FC<{
  type: 'grass' | 'water' | 'player' | 'enemy';
  isMoveable?: boolean;
}> = ({ type, isMoveable }) => {
  return (
    <div
      className={cn(
        'w-10 h-10 border border-border/20 flex items-center justify-center',
        type === 'grass' && 'bg-green-800/50',
        type === 'water' && 'bg-blue-800/70',
        type === 'player' && 'bg-green-800/50',
        type === 'enemy' && 'bg-green-800/50',
        isMoveable && 'bg-blue-500/30'
      )}
    >
      {type === 'player' && <UserIcon />}
      {type === 'enemy' && <EnemyIcon />}
    </div>
  );
};

const UserIcon: React.FC = () => <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />;
const EnemyIcon: React.FC = () => <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white" />;


const TurnBasedStrategy: React.FC = () => {
    const gridLayout = [
        'g','g','g','w','w','g','g','g',
        'g','g','p','w','w','g','e','g',
        'g','g','g','w','w','g','g','g',
        'g','w','w','w','w','w','w','g',
        'g','g','g','g','g','g','g','g',
        'g','p','g','g','g','e','g','g',
        'g','g','g','g','g','g','g','g',
        'g','p','g','g','g','g','e','g',
    ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Grid-Based Strategy Game</CardTitle>
           <p className="text-muted-foreground text-center">Coming Soon!</p>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center">
            <div className="grid grid-cols-8 gap-0.5 bg-background p-2 rounded-md">
                 {gridLayout.map((cell, index) => (
                    <GridCell 
                        key={index} 
                        type={cell === 'p' ? 'player' : cell === 'e' ? 'enemy' : cell === 'w' ? 'water' : 'grass'}
                        isMoveable={index === 10 || index === 18}
                    />
                ))}
            </div>
            <div className="flex-grow space-y-4">
                <Card>
                    <CardHeader className="p-2 pb-0"><CardTitle className="text-base text-center">Selected Unit</CardTitle></CardHeader>
                    <CardContent className="p-4 flex justify-around text-center">
                        <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-red-500"/>18/20</div>
                        <div className="flex items-center gap-2"><Swords className="h-4 w-4 text-gray-400"/>7</div>
                        <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400"/>4</div>
                    </CardContent>
                </Card>
                <p className="text-sm text-muted-foreground">
                    A tactical game where positioning and unit choice are key to victory. Plan your moves and outmaneuver your opponent.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnBasedStrategy;
