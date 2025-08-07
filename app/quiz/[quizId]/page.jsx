'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, ArrowRight, ArrowLeft, Trophy, Brain, Loader2, AlertCircle, Sparkles } from 'lucide-react';

// Loading component
const QuizLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full mx-auto mb-4"
      />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Quiz</h2>
      <p className="text-gray-600">Preparing your personalized questions...</p>
    </motion.div>
  </div>
);

// Error component
const QuizError = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h2>
      <p className="text-gray-600 mb-6">This quiz may have expired or doesn't exist. Please generate a new one from the dashboard.</p>
      <Button onClick={() => window.location.href = '/'} className="bg-gradient-to-r from-violet-500 to-purple-600">
        Back to Dashboard
      </Button>
    </motion.div>
  </div>
);

// Progress indicator component
const QuizProgress = ({ current, total, selectedAnswers }) => {
  const progress = ((current + 1) / total) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Question {current + 1} of {total}
        </span>
        <span className="text-gray-500">
          {answeredCount}/{total} answered
        </span>
      </div>
      <div className="relative">
        <Progress value={progress} className="h-2" />
        <motion.div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Answer option component
const AnswerOption = ({ option, index, isSelected, onClick, disabled }) => {
  const letters = ['A', 'B', 'C', 'D'];
  
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02, x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Button
        variant="ghost"
        className={`w-full justify-start text-left h-auto p-4 border-2 transition-all duration-200 ${
          isSelected
            ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-md'
            : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        <div className="flex items-start gap-4 w-full">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isSelected
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {letters[index]}
          </div>
          <span className="flex-1 whitespace-normal leading-relaxed">
            {option}
          </span>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle className="h-5 w-5 text-violet-500" />
            </motion.div>
          )}
        </div>
      </Button>
    </motion.div>
  );
};

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const params = useParams();
  const router = useRouter();
  const { quizId } = params;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch the quiz data
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

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <QuizLoader />;
  if (!quiz) return <QuizError />;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const hasAnsweredCurrent = selectedAnswers[currentQuestion.question_id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
            <Brain className="h-5 w-5 text-violet-500" />
            <span className="font-medium text-gray-700">AI Generated Quiz</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {quiz.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(timeElapsed)}
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {Object.keys(selectedAnswers).length}/{quiz.questions.length} completed
            </div>
          </div>
        </motion.div>

        {/* Main Quiz Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            {/* Progress Header */}
            <CardHeader className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-b">
              <QuizProgress 
                current={currentQuestionIndex} 
                total={quiz.questions.length}
                selectedAnswers={selectedAnswers}
              />
            </CardHeader>

            {/* Question Content */}
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.question_id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-8"
                >
                  {/* Question */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {currentQuestionIndex + 1}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                        {currentQuestion.question_text}
                      </h2>
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <AnswerOption
                        key={index}
                        option={option}
                        index={index}
                        isSelected={selectedAnswers[currentQuestion.question_id] === option}
                        onClick={() => handleAnswerSelect(currentQuestion.question_id, option)}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Navigation Footer */}
            <CardFooter className="bg-gray-50/50 border-t p-6">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstQuestion || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{currentQuestionIndex + 1}</span>
                  <span>/</span>
                  <span>{quiz.questions.length}</span>
                </div>

                {isLastQuestion ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={!hasAnsweredCurrent || isSubmitting}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Finish & See Results
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!hasAnsweredCurrent || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    Next Question
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Question Navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {quiz.questions.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-violet-500 text-white shadow-lg'
                        : selectedAnswers[quiz.questions[index].question_id]
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
