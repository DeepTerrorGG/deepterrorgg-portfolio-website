
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DoomEmulator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white p-4">
      <div className="w-full h-full aspect-video max-w-4xl max-h-[80vh] border-4 border-border shadow-2xl bg-black">
        <iframe
          src="https://archive.org/embed/msdos_DOOM_1993"
          allowFullScreen
          className="w-full h-full border-0"
          title="Internet Archive DOOM Emulator"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="mt-4 text-center text-muted-foreground text-xs max-w-lg">
        <p className="font-bold text-sm text-foreground mb-2">Controls: Arrow Keys (Move), Ctrl (Fire), Space (Open), Shift (Run)</p>
        <p>This is the shareware version of DOOM (1993) running in a web-based DOS emulator from the Internet Archive. Please note that performance may vary.</p>
      </div>
    </div>
  );
};

export default DoomEmulator;
