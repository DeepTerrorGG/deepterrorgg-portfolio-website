
'use client';

import React, { useState, useEffect } from 'react';
import { Button as ShadButton } from '@/components/ui/button'; // Renamed to avoid conflict

const Calculator3D: React.FC = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [visualDisplay, setVisualDisplay] = useState('0');

  const MAX_INPUT_LENGTH = 11;
  const MAX_DISPLAY_LENGTH = 11;
  const SCIENTIFIC_THRESHOLD_UPPER = 1e14;
  const SCIENTIFIC_THRESHOLD_LOWER = 1e-9;
  const SCIENTIFIC_DIGIT_COUNT_TRIGGER = 9;

  const formatDisplayValue = (valueStr: string): string => {
    if (valueStr === "Error" || valueStr === "NaN" || valueStr === "Infinity" || valueStr === "-Infinity") {
      return "Error";
    }
    
    let num = parseFloat(valueStr);

    if (isNaN(num) && valueStr !== "0" && valueStr !== "0.") {
        // Allow input like "0.00" or "-" temporarily
        if (!/^-?\d*\.?\d*$/.test(valueStr) && valueStr !== "-") {
            return "Error";
        }
    }
    
    if (isNaN(num) && valueStr !== "-") num = 0;


    // 1. Check for forced scientific notation by magnitude
    if (Math.abs(num) >= SCIENTIFIC_THRESHOLD_UPPER || (Math.abs(num) < SCIENTIFIC_THRESHOLD_LOWER && num !== 0)) {
      for (let precision = 4; precision >= 0; precision--) { 
        const scientificStr = num.toExponential(precision);
        if (scientificStr.length <= MAX_DISPLAY_LENGTH) {
          return scientificStr;
        }
      }
      const fallbackScientific = num.toExponential(0);
      return fallbackScientific.length <= MAX_DISPLAY_LENGTH ? fallbackScientific : fallbackScientific.substring(0, MAX_DISPLAY_LENGTH);
    }

    // 2. Check for scientific notation by digit count (excluding '-' and '.')
    const numAbsStr = String(Math.abs(num));
    let digitCount = 0;
    if (!numAbsStr.includes('e')) { // Only count if not already scientific
        for (const char of numAbsStr) {
            if (char >= '0' && char <= '9') {
            digitCount++;
            }
        }
    }
    
    if (digitCount >= SCIENTIFIC_DIGIT_COUNT_TRIGGER && !numAbsStr.includes('e')) {
        for (let precision = 4; precision >= 0; precision--) { 
            const scientificStr = num.toExponential(precision);
            if (scientificStr.length <= MAX_DISPLAY_LENGTH) {
            return scientificStr;
            }
        }
        const fallbackScientific = num.toExponential(0);
        return fallbackScientific.length <= MAX_DISPLAY_LENGTH ? fallbackScientific : fallbackScientific.substring(0, MAX_DISPLAY_LENGTH);
    }
    
    // 3. Try standard formatting, ensuring it fits MAX_DISPLAY_LENGTH
    let standardNumStr = String(num); // For numbers like 0, -0
    if (valueStr === "-") return "-"; // Allow single '-' input
    if (valueStr.endsWith('.') && !valueStr.substring(0, valueStr.length -1).includes('.')) { // Handle "123." case
        standardNumStr = valueStr;
    } else {
        standardNumStr = String(num);
    }


    if (standardNumStr.includes('.') && !standardNumStr.includes('e')) {
        const parts = standardNumStr.split('.');
        const integerPartLength = parts[0].length;
        // Max decimal length available, considering integer part, dot, and sign
        const maxDecimalLength = MAX_DISPLAY_LENGTH - integerPartLength - (parts[0].startsWith('-') ? 1 : 0) - 1;
        
        if (maxDecimalLength < 0) { 
             // Integer part itself is too long or just fits
            standardNumStr = parts[0].substring(0, MAX_DISPLAY_LENGTH);
        } else if (parts[1].length > maxDecimalLength) {
            try {
                // Use parseFloat to get the number, then toFixed to round
                const roundedNum = parseFloat(num.toFixed(maxDecimalLength));
                let fixedNumStr = String(roundedNum);
                // If toFixed added .0 for an integer, remove it if it makes it too long
                if (fixedNumStr.endsWith(".0") && fixedNumStr.length > MAX_DISPLAY_LENGTH) {
                    fixedNumStr = fixedNumStr.substring(0, fixedNumStr.length - 2);
                }
                if (fixedNumStr.length <= MAX_DISPLAY_LENGTH) {
                  standardNumStr = fixedNumStr;
                } else {
                  // Fallback if even rounded is too long (should be rare with prior checks)
                  standardNumStr = standardNumStr.substring(0, MAX_DISPLAY_LENGTH);
                }
            } catch(e) { 
                standardNumStr = standardNumStr.substring(0, MAX_DISPLAY_LENGTH);
            }
        }
    }

    if (standardNumStr.length > MAX_DISPLAY_LENGTH) {
      // Final truncation if still too long (e.g. long integers)
      return standardNumStr.substring(0, MAX_DISPLAY_LENGTH);
    }

    return standardNumStr;
  };
  
  useEffect(() => {
      setVisualDisplay(formatDisplayValue(displayValue));
  }, [displayValue]);

  const updateDisplay = (newValue: string) => {
    setDisplayValue(newValue);
  };

  const handleNumberClick = (number: string) => {
    if (displayValue === "Error") return;
    
    let newDisplayValue;
    if (waitingForOperand) {
      newDisplayValue = number;
      setWaitingForOperand(false);
    } else {
      newDisplayValue = displayValue === '0' ? number : displayValue + number;
    }

    if (newDisplayValue.length <= MAX_INPUT_LENGTH) {
        updateDisplay(newDisplayValue);
    }
  };

  const handleDecimalClick = () => {
    if (displayValue === "Error") return;
    if (waitingForOperand) {
        updateDisplay('0.');
        setWaitingForOperand(false);
        return;
    }
    if (!displayValue.includes('.')) {
      if ((displayValue + '.').length <= MAX_INPUT_LENGTH) {
        updateDisplay(displayValue + '.');
      }
    }
  };

  const performCalculation = (): string => {
    const prev = parseFloat(previousValue!);
    const current = parseFloat(displayValue);

    if (isNaN(prev) || isNaN(current)) return "Error";

    let result: number;
    if (operator === '+') result = prev + current;
    else if (operator === '-') result = prev - current;
    else if (operator === '*') result = prev * current;
    else if (operator === '/') {
        if (current === 0) return "Error"; 
        result = prev / current;
    }
    else if (operator === '%') { 
      // Standard interpretation: "previousValue % of currentValue" is not typical.
      // Usually, it's "currentValue % of previousValue" or "currentValue as percentage"
      // Let's assume "currentValue as a percentage of previousValue"
      // Or, if only one number and then %, it's that number / 100.
      // Here, it's part of a binary operation, so previousValue * (currentValue / 100) makes sense
      result = prev * (current / 100);
    }
    else return String(current); // Should not happen if operator is set

    return String(result);
  };
  
  const handleOperatorClick = (nextOperator: string) => {
    if (displayValue === "Error") return;

    // if an operator is clicked, and there's already a previous value and an operator, calculate first
    if (previousValue !== null && operator && !waitingForOperand) {
      const calculationResultStr = performCalculation();
      updateDisplay(formatDisplayValue(calculationResultStr)); // Update display with formatted result
      setPreviousValue(formatDisplayValue(calculationResultStr)); // Store formatted result as new previous value
    } else {
      // If no previous calculation or waiting for new operand, set current display as previousValue
      setPreviousValue(displayValue);
    }
    setWaitingForOperand(true); // Expecting next number
    setOperator(nextOperator);
  };

  const handleEqualsClick = () => {
    if (displayValue === "Error" || !operator || previousValue === null) return;
    
    const calculationResultStr = performCalculation();
    updateDisplay(formatDisplayValue(calculationResultStr));
    setPreviousValue(null); // Reset for next calculation
    setOperator(null);      // Reset operator
    setWaitingForOperand(true); // Ready for new input, but result is shown
  };

  const handleClearClick = () => {
    updateDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handlePlusMinusClick = () => {
    if (displayValue === "Error" || displayValue === "0") return;
    const currentValue = parseFloat(displayValue);
    if (isNaN(currentValue)) return; 
    updateDisplay(formatDisplayValue(String(currentValue * -1)));
  };
  
  const handlePercentClick = () => {
    if (displayValue === "Error") return;
    const currentValue = parseFloat(displayValue);
    if (isNaN(currentValue)) {
        updateDisplay("Error");
        return;
    }
    
    // If there's a previous value and an operator, % applies to the current value in context of previous
    // e.g. 100 + 10% (of 100) = 110. Here, displayValue is 10, previousValue is 100.
    // The result of calculation "100 * (10/100)" replaces "10" as the second operand.
    // This behavior is tricky. Most simple calculators do "currentValue / 100".
    // For now, let's make it simple: current display / 100
    updateDisplay(formatDisplayValue(String(currentValue / 100)));
    // setWaitingForOperand(true); // Depends on desired behavior after %
  };

  const buttons = [
    { label: 'AC', type: 'clear', className: 'bg-muted hover:bg-muted/80 text-foreground' },
    { label: '+/-', type: 'modifier', className: 'bg-muted hover:bg-muted/80 text-foreground' },
    { label: '%', type: 'percent', className: 'bg-muted hover:bg-muted/80 text-foreground' },
    { label: '/', type: 'operator', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
    { label: '7', type: 'number' }, { label: '8', type: 'number' }, { label: '9', type: 'number' },
    { label: '*', type: 'operator', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
    { label: '4', type: 'number' }, { label: '5', type: 'number' }, { label: '6', type: 'number' },
    { label: '-', type: 'operator', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
    { label: '1', type: 'number' }, { label: '2', type: 'number' }, { label: '3', type: 'number' },
    { label: '+', type: 'operator', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
    { label: '0', type: 'number', className: 'col-span-2' },
    { label: '.', type: 'decimal' },
    { label: '=', type: 'equals', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  ];

  const handleButtonClick = (label: string, type: string) => {
    if (type === 'number') handleNumberClick(label);
    else if (type === 'decimal') handleDecimalClick();
    else if (type === 'operator') handleOperatorClick(label);
    else if (type === 'equals') handleEqualsClick();
    else if (type === 'clear') handleClearClick();
    else if (type === 'modifier' && label === '+/-') handlePlusMinusClick();
    else if (type === 'percent' && label === '%') handlePercentClick();
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card text-card-foreground rounded-lg [perspective:1200px] group">
      <div 
        className="w-full max-w-[280px] sm:max-w-xs mx-auto bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 rounded-xl shadow-2xl 
                   border-2 border-border 
                   transform transition-all duration-500 [transform-style:preserve-3d] [transform:rotateY(-2deg)_rotateX(5deg)_translateZ(10px)]"
      >
        {/* Display */}
        <div 
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted text-right rounded-lg shadow-inner text-2xl sm:text-3xl font-mono text-foreground break-all h-16 sm:h-20 flex items-end justify-end overflow-x-auto
                     transform [transform:translateZ(25px)]" 
        >
          <span>{visualDisplay}</span>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 [transform-style:preserve-3d]">
          {buttons.map(({ label, type, className = '' }) => (
            <ShadButton 
              key={label}
              variant="outline"
              className={`
                text-lg sm:text-xl font-medium rounded-lg shadow-lg hover:shadow-xl 
                active:shadow-md 
                focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                py-3 sm:py-4
                transition-all duration-150 ease-in-out
                border-border 
                transform active:[transform:translateZ(28px)_scale(0.97)] [transform:translateZ(30px)] hover:[transform:translateZ(35px)_scale(1.02)] 
                ${ type === 'number' || type === 'decimal'
                  ? 'bg-card hover:bg-card/80 text-foreground' 
                  : ''
                }
                ${className}
              `}
              onClick={() => handleButtonClick(label, type)}
            >
              {label}
            </ShadButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator3D;
    
