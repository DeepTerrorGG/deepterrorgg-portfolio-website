'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type UnitSystem = 'metric' | 'imperial';

const BmiCalculator: React.FC = () => {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBmi = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setBmi(null);
      return;
    }

    let bmiValue;
    if (unit === 'metric') {
      // height in cm, weight in kg
      bmiValue = w / ((h / 100) ** 2);
    } else {
      // height in inches, weight in lbs
      bmiValue = (w / (h ** 2)) * 703;
    }
    setBmi(bmiValue);
  };
  
  const handleUnitChange = (value: UnitSystem) => {
    setUnit(value);
    setHeight('');
    setWeight('');
    setBmi(null);
  }

  const { category, color } = useMemo(() => {
    if (bmi === null) return { category: '', color: '' };
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-400' };
    return { category: 'Obese', color: 'text-red-400' };
  }, [bmi]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">BMI Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="metric" onValueChange={(v) => handleUnitChange(v as UnitSystem)} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric">Metric (cm, kg)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial">Imperial (in, lbs)</Label>
            </div>
          </RadioGroup>

          <div className="grid gap-2">
            <Label htmlFor="height">Height ({unit === 'metric' ? 'cm' : 'in'})</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unit === 'metric' ? 'e.g., 180' : 'e.g., 71'}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === 'metric' ? 'e.g., 75' : 'e.g., 165'}
            />
          </div>
          <Button onClick={calculateBmi} className="w-full">Calculate BMI</Button>
        </CardContent>
        {bmi !== null && (
          <CardFooter className="flex flex-col items-center gap-2">
            <p className="text-lg">Your BMI is:</p>
            <p className={cn("text-4xl font-bold", color)}>{bmi.toFixed(1)}</p>
            <p className={cn("text-lg font-semibold", color)}>{category}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BmiCalculator;
