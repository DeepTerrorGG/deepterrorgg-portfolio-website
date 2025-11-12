
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RefreshCw, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import { type QuizQuestion, type QuizOptions, type QuizDifficulty, type QuizType } from '@/ai/flows/generate-quiz-flow-types';

const difficultyLevels: QuizDifficulty[] = ["Easy", "Medium", "Hard"];
const questionTypes: QuizType[] = ["Multiple Choice", "True/False", "Fun Facts"];

const QuizApp: React.FC = () => {
  const { toast } = useToast();
  
  // Game State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Setup State
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('World Capitals');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("Medium");
  const [quizType, setQuizType] = useState<QuizType>("Multiple Choice");

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    handleRestartQuiz();
    try {
      const options: QuizOptions = { topic, numQuestions, difficulty, type: quizType };
      const questions = await generateQuiz(options);
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
      } else {
        toast({ title: "Failed to generate quiz", description: "The AI couldn't create questions for that topic. Please try another one.", variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "An unexpected error occurred while generating the quiz.", variant: 'destructive' });
    }
    setIsGenerating(false);
  };

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
      setQuizQuestions([]);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowResults(false);
  }

  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100 : 0;
  
  // Setup View
  if (quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">Generate a Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Roman History" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="num-questions">Questions</Label>
                    <Input id="num-questions" type="number" min="3" max="10" value={numQuestions} onChange={(e) => setNumQuestions(Math.min(10, Math.max(3, parseInt(e.target.value) || 3)))} />
                </div>
                <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuizDifficulty)}>
                        <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                        <SelectContent>{difficultyLevels.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
             <div>
                <Label htmlFor="quiz-type">Question Type</Label>
                <Select value={quizType} onValueChange={(v) => setQuizType(v as QuizType)}>
                    <SelectTrigger id="quiz-type"><SelectValue /></SelectTrigger>
                    <SelectContent>{questionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateQuiz} className="w-full" disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Results View
  if (showResults) {
      return (
         <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
             <Card className="w-full max-w-md mx-auto shadow-2xl text-center">
                 <CardHeader>
                     <CardTitle className="text-2xl text-center font-bold text-primary">Quiz Results for {topic}</CardTitle>
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
                         Create New Quiz
                     </Button>
                 </CardFooter>
             </Card>
         </div>
      );
  }

  // Quiz View
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
            <CardFooter className="flex flex-col gap-4">
                {selectedOption !== quizQuestions[currentQuestionIndex].answer && (
                    <p className="text-sm text-center text-destructive">Correct Answer: {quizQuestions[currentQuestionIndex].answer}</p>
                )}
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
