'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "Which of these is a JavaScript framework?",
    options: ["Django", "Laravel", "React", "Spring"],
    answer: "React",
  },
  {
    question: "What does CSS stand for?",
    options: ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
    answer: "Cascading Style Sheets",
  },
    {
    question: "What is the result of `2 + 2 * 2`?",
    options: ["8", "6", "4", "2"],
    answer: "6",
  },
  {
    question: "Which HTML tag is used to define an unordered list?",
    options: ["<ol>", "<li>", "<list>", "<ul>"],
    answer: "<ul>",
  },
];

const QuizApp: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerOptionClick = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
  };
  
  const handleNextClick = () => {
      const nextQuestion = currentQuestionIndex + 1;
      if (nextQuestion < quizQuestions.length) {
          setCurrentQuestionIndex(nextQuestion);
          setSelectedOption(null);
          setIsAnswered(false);
      } else {
          setShowResults(true);
      }
  }
  
  const handleRestartQuiz = () => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowResults(false);
  }

  const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100;

  if (showResults) {
      return (
         <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
             <Card className="w-full max-w-md mx-auto shadow-2xl text-center">
                 <CardHeader>
                     <CardTitle className="text-2xl text-center font-bold text-primary">Quiz Results</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <p className="text-4xl font-bold">
                         You scored {score} out of {quizQuestions.length}
                     </p>
                     <p className="text-lg">({((score / quizQuestions.length) * 100).toFixed(0)}%)</p>
                 </CardContent>
                 <CardFooter>
                     <Button onClick={handleRestartQuiz} className="w-full">
                         <RefreshCw className="mr-2 h-4 w-4" />
                         Restart Quiz
                     </Button>
                 </CardFooter>
             </Card>
         </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-center font-bold text-primary">
            Question {currentQuestionIndex + 1}/{quizQuestions.length}
          </CardTitle>
           <Progress value={progress} className="w-full mt-2"/>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-semibold text-center min-h-[56px]">{quizQuestions[currentQuestionIndex].question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizQuestions[currentQuestionIndex].options.map((option) => {
              const isCorrect = option === quizQuestions[currentQuestionIndex].answer;
              
              return (
                <Button
                  key={option}
                  onClick={() => handleAnswerOptionClick(option)}
                  disabled={isAnswered}
                  className={cn(
                    "justify-start p-4 h-auto text-wrap whitespace-normal",
                    isAnswered && (isCorrect ? "bg-green-500 hover:bg-green-600" : (selectedOption === option ? "bg-red-500 hover:bg-red-600" : "bg-muted"))
                  )}
                  variant={isAnswered && (isCorrect || selectedOption === option) ? "default" : "outline"}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </CardContent>
         {isAnswered && (
            <CardFooter>
                <Button onClick={handleNextClick} className="w-full">
                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Show Results'}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QuizApp;
