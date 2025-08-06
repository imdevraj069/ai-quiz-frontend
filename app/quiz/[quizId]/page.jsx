'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const params = useParams();
  const router = useRouter();
  const { quizId } = params;

  // Fetch the quiz data from the new backend endpoint
  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/quiz/${quizId}`);
        setQuiz(response.data.data);
      } catch (error) {
        toast.error("Could not load the quiz.", {
          description: "Please try generating a new one from the dashboard."
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, router]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    toast.info("Submitting your answers...", {
      description: "The AI is preparing your detailed analysis."
    });

    const formattedAnswers = Object.entries(selectedAnswers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        selected_answer: ans
    }));

    try {
        const response = await api.post('/test/submit', {
            quizId,
            answers: formattedAnswers
        });
        const resultId = response.data.data._id;
        toast.success("Test submitted successfully!");
        router.push(`/results/${resultId}`);
    } catch(error) {
        toast.error("Failed to submit test.", {
          description: error.response?.data?.message || "Please try again."
        });
        setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading Quiz...</div>;
  if (!quiz) return <div className="flex justify-center items-center h-screen">Quiz not found. Please generate a new one.</div>;
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-slate-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.question_id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-semibold mb-6 text-lg">{currentQuestion.question_text}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => (
                  <Button
                    key={i}
                    variant={selectedAnswers[currentQuestion.question_id] === option ? 'default' : 'outline'}
                    className="w-full justify-start text-left h-auto py-3 whitespace-normal"
                    onClick={() => handleAnswerSelect(currentQuestion.question_id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="justify-end">
            {isLastQuestion ? (
                <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestion.question_id] || isSubmitting}>
                    {isSubmitting ? 'Analyzing...' : 'Finish & See Results'}
                </Button>
            ) : (
                <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.question_id]}>Next Question</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}