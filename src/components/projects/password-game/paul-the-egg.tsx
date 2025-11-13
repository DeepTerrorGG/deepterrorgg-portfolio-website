
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

let paulIsHappyFlag = false;
export const isPaulHappy = () => paulIsHappyFlag;

const faces = {
  happy: '(^‿^)',
  neutral: '(•_•)',
  worried: '(o_o;)',
  hatched: '🐔',
};

export const PaulTheEgg: React.FC = () => {
    const [face, setFace] = useState(faces.neutral);
    const [isHatched, setIsHatched] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isHatched) {
                setFace(faces.hatched);
                return;
            }
            if (!paulIsHappyFlag) {
                 setFace(prev => prev === faces.worried ? '(o.o;)' : faces.worried);
            } else {
                setFace(faces.happy);
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [isHatched]);
    
    return (
        <div className="bg-muted/30 p-3 rounded-md flex items-center justify-center gap-4">
            <motion.div 
                key={face}
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-mono text-center"
            >
                🥚
                <span className="inline-block w-24 text-center">{face}</span>
            </motion.div>
            <AnimatePresence>
            {!paulIsHappyFlag && (
                 <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 italic"
                 >
                    Paul is not in a shell!
                 </motion.p>
            )}
            </AnimatePresence>
        </div>
    );
}

// This function is imported and used in `password-rules.ts`
export function validatePaulIsHappy(password: string): boolean {
    const hasPaul = password.includes('🥚');
    if (!hasPaul) {
        paulIsHappyFlag = false;
        return false;
    }
    // Check if Paul is surrounded by a "shell"
    const inParentheses = /\(🥚\)/.test(password);
    const inBraces = /\{🥚\}/.test(password);
    const inBrackets = /\[🥚\]/.test(password);

    paulIsHappyFlag = inParentheses || inBraces || inBrackets;
    return paulIsHappyFlag;
}
