'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PasswordGenerator: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [requireEachType, setRequireEachType] = useState(true);
  const [copied, setCopied] = useState(false);

  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const ambiguousChars = 'Il1O0';

  const generatePassword = () => {
    let charPool = lowercaseChars;
    let guaranteedChars = [];

    if (includeUppercase) {
      charPool += uppercaseChars;
      if (requireEachType) guaranteedChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
    }
    if (includeNumbers) {
      charPool += numberChars;
      if (requireEachType) guaranteedChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
    if (includeSymbols) {
      charPool += symbolChars;
      if (requireEachType) guaranteedChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }
    
    if (requireEachType && !includeUppercase && !includeNumbers && !includeSymbols) {
      // Add at least one lowercase if all others are off but require is on
      guaranteedChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    }

    if (excludeAmbiguous) {
      charPool = charPool.split('').filter(char => !ambiguousChars.includes(char)).join('');
    }
    
    if (charPool.length === 0) {
      toast({ title: "Error", description: "Please select at least one character type.", variant: "destructive" });
      return;
    }
    
    const remainingLength = length - guaranteedChars.length;
    let randomChars = '';
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      randomChars += charPool[randomIndex];
    }

    // Shuffle guaranteed characters with random characters
    let newPasswordArray = (guaranteedChars.join('') + randomChars).split('');
    for (let i = newPasswordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPasswordArray[i], newPasswordArray[j]] = [newPasswordArray[j], newPasswordArray[i]];
    }
    
    setPassword(newPasswordArray.join(''));
    setCopied(false);
  };
  
  // Generate a password on component mount
  useEffect(() => {
    generatePassword();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Password Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative flex items-center">
            <Input
              readOnly
              value={password}
              placeholder="Your password will appear here"
              className="pr-20 text-lg h-12 font-mono"
            />
            <div className='absolute right-1 flex'>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={generatePassword}>
                    <RefreshCw className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={copyToClipboard} disabled={!password}>
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="length-slider" className="mb-2 flex justify-between">
                <span>Length:</span><span>{length}</span>
              </Label>
              <Slider id="length-slider" min={8} max={64} step={1} value={[length]} onValueChange={(value) => setLength(value[0])} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase-switch">Include Uppercase (A-Z)</Label>
              <Switch id="uppercase-switch" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers-switch">Include Numbers (0-9)</Label>
              <Switch id="numbers-switch" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols-switch">Include Symbols (!@#...)</Label>
              <Switch id="symbols-switch" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ambiguous-switch">Exclude Ambiguous (I, l, 1, O, 0)</Label>
              <Switch id="ambiguous-switch" checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="require-switch">Require Each Character Type</Label>
              <Switch id="require-switch" checked={requireEachType} onCheckedChange={setRequireEachType} />
            </div>
          </div>
          <Button onClick={generatePassword} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
