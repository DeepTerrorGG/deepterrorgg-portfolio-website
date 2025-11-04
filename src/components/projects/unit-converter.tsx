// src/components/projects/unit-converter.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Unit = {
  name: string;
  symbol: string;
};

type ConversionCategory = 'Temperature' | 'Length' | 'Weight';

const conversionConfig = {
  Temperature: {
    baseUnit: 'celsius',
    units: [
      { name: 'celsius', symbol: '°C' },
      { name: 'fahrenheit', symbol: '°F' },
      { name: 'kelvin', symbol: 'K' },
    ],
    conversions: {
      celsius: {
        toBase: (c: number) => c,
        fromBase: (c: number) => c,
      },
      fahrenheit: {
        toBase: (f: number) => (f - 32) * 5 / 9,
        fromBase: (c: number) => c * 9 / 5 + 32,
      },
      kelvin: {
        toBase: (k: number) => k - 273.15,
        fromBase: (c: number) => c + 273.15,
      },
    },
  },
  Length: {
    baseUnit: 'meter',
    units: [
      { name: 'meter', symbol: 'm' },
      { name: 'kilometer', symbol: 'km' },
      { name: 'mile', symbol: 'mi' },
      { name: 'foot', symbol: 'ft' },
    ],
    conversions: {
      meter: {
        toBase: (m: number) => m,
        fromBase: (m: number) => m,
      },
      kilometer: {
        toBase: (km: number) => km * 1000,
        fromBase: (m: number) => m / 1000,
      },
      mile: {
        toBase: (mi: number) => mi * 1609.34,
        fromBase: (m: number) => m / 1609.34,
      },
      foot: {
        toBase: (ft: number) => ft * 0.3048,
        fromBase: (m: number) => m / 0.3048,
      },
    },
  },
  Weight: {
    baseUnit: 'kilogram',
    units: [
      { name: 'kilogram', symbol: 'kg' },
      { name: 'gram', symbol: 'g' },
      { name: 'pound', symbol: 'lb' },
      { name: 'ounce', symbol: 'oz' },
    ],
    conversions: {
      kilogram: {
        toBase: (kg: number) => kg,
        fromBase: (kg: number) => kg,
      },
      gram: {
        toBase: (g: number) => g / 1000,
        fromBase: (kg: number) => kg * 1000,
      },
      pound: {
        toBase: (lb: number) => lb * 0.453592,
        fromBase: (kg: number) => kg / 0.453592,
      },
      ounce: {
        toBase: (oz: number) => oz * 0.0283495,
        fromBase: (kg: number) => kg / 0.0283495,
      },
    },
  },
};

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<ConversionCategory>('Temperature');
  const [values, setValues] = useState<Record<string, string>>({});

  const currentConfig = useMemo(() => conversionConfig[category], [category]);

  const handleValueChange = useCallback((value: string, fromUnit: string) => {
    const newValues: Record<string, string> = {};
    const { baseUnit, units, conversions } = currentConfig;

    const numValue = parseFloat(value);

    if (value === '' || isNaN(numValue)) {
      units.forEach(u => newValues[u.name] = '');
      setValues(newValues);
      return;
    }
    
    // Set the input that triggered the change directly
    newValues[fromUnit] = value;

    // Convert input value to base unit value
    const baseValue = conversions[fromUnit as keyof typeof conversions].toBase(numValue);

    // Convert from base unit value to all other units
    units.forEach(unit => {
      if (unit.name !== fromUnit) {
        const convertedValue = conversions[unit.name as keyof typeof conversions].fromBase(baseValue);
        // Format to a reasonable precision, avoiding trailing zeros
        newValues[unit.name] = parseFloat(convertedValue.toFixed(4)).toString();
      }
    });

    setValues(newValues);
  }, [currentConfig]);

  const handleCategoryChange = (newCategory: ConversionCategory) => {
    setCategory(newCategory);
    setValues({}); // Clear values when category changes
  };

  const createHandler = (unit: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only valid numbers (including negative for temperature)
    if (/^-?\d*\.?\d*$/.test(value)) {
      handleValueChange(value, unit);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">
            Universal Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="category-select" className="text-md mb-2 block">Category</Label>
            <Select value={category} onValueChange={(val) => handleCategoryChange(val as ConversionCategory)}>
              <SelectTrigger id="category-select" className="w-full h-12 text-lg">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(conversionConfig).map(cat => (
                  <SelectItem key={cat} value={cat} className="text-lg">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            {currentConfig.units.map((unit, index) => (
              <React.Fragment key={unit.name}>
                <div className="grid gap-2">
                  <Label htmlFor={unit.name} className="text-lg capitalize">{unit.name}</Label>
                  <Input
                    id={unit.name}
                    type="text"
                    value={values[unit.name] || ''}
                    onChange={createHandler(unit.name)}
                    placeholder={unit.symbol}
                    className="text-xl h-12"
                  />
                </div>
                {index < currentConfig.units.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter;
