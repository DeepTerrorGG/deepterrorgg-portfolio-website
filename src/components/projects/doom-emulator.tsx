'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DoomEmulator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white p-4">
      <div className="w-full h-full aspect-video max-w-4xl max-h-[80vh] border-4 border-border shadow-2xl bg-black">
        <iframe
          src="https://dos.zone/player/?bundleUrl=https://cdn.dos.zone/original/2X/2/220261c36b8011c75956799015347f00b4f8c65f.jsdos"
          allowFullScreen
          className="w-full h-full border-0"
          title="DOS Zone DOOM Emulator"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="mt-4 text-center text-muted-foreground text-xs max-w-lg">
        <p className="font-bold text-sm text-foreground mb-2">Controls: Arrow Keys (Move), Ctrl (Fire), Space (Open), Shift (Run)</p>
        <p>This is the shareware version of DOOM (1993) running in a web-based DOS emulator. Please note that performance may vary, and saving is not supported in this embedded version.</p>
      </div>
    </div>
  );
};

export default DoomEmulator;
