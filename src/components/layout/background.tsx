
'use client';

import { cn } from '@/lib/utils';

export default function Background() {
  return (
    <div
      className={cn(
        'fixed inset-0 z-0',
        'bg-black bg-cover bg-center bg-no-repeat'
      )}
      style={{
        backgroundImage: "url('https://i.imgur.com/T4p2pNB.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
