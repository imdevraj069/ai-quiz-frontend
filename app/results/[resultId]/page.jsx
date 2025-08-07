'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Target, Zap, TrendingUp, BookOpen, Trophy, Brain, Home, RotateCcw, Share2, Download, Sparkles, Award, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Loading component
const ResultLoader = () => (
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
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Performance</h2>
      <p className="text-gray-600">AI is preparing your detailed report...</p>
    </motion.div>
  </div>
);

// Score display component
const ScoreDisplay = ({ score, total, percentage }) => {
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { message: "Outstanding!", icon: Trophy, color: "text-yellow-600" };
    if (percentage >= 80) return { message: "Excellent!", icon: Award, color: "text-green-600" };
    if (percentage >= 70) return { message: "Good Job!", icon: Target, color: "text-blue-600" };
    if (percentage >= 60) return { message: "Not Bad!", icon: TrendingUp, color: "text-orange-600" };
    return { message: "Keep Trying!", icon: AlertCircle, color: "text-red-600" };
  };

  const scoreInfo = getScoreMessage(percentage);
  const ScoreIcon = scoreInfo.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      className="text-center space-y-6"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
          className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getScoreColor(percentage)} flex items-center justify-center shadow-2xl`}
        >
          <div className="text-center text-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-4xl font-bold"
            >
              {percentage}%
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="absolute -top-2 -right-2"
        >
          <div className={`w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center ${scoreInfo.color}`}>
            <ScoreIcon className="h-6 w-6" />
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-2"
      >
        <h2 className={`text-2xl font-bold ${scoreInfo.color}`}>
          {scoreInfo.message}
        </h2>
        <p className="text-gray-600">
          You got <span className="font-semibold text-gray-900">{score}</span> out of{' '}
          <span className="font-semibold text-gray-900">{total}</span> questions correct
        </p>
      </motion.div>
    </motion.div>
  );
};

// Analysis section component
const AnalysisSection = ({ title, items, icon: Icon, color, bgColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`${bgColor} rounded-xl p-6 border-l-4 ${color.replace('text-', 'border-')}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + (index * 0.1) }}
          className="flex items-start gap-3 text-gray-700"
        >
          <ArrowRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <span>{item}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

// Question review item
const QuestionReviewItem = ({ question, answer, index }) => {
  const isCorrect = answer.is_correct;
  
  return (
    <AccordionItem value={`item-${index}`} className="border-0 mb-4">
      <Card className={`overflow-hidden transition-all duration-200 ${
        isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
      }`}>
        <AccordionTrigger className="hover:no-underline p-0">
          <div className="flex items-center gap-4 w-full p-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">Question {question.question_id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCorrect 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="text-gray-700 text-sm line-clamp-2">{question.question_text}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="px-4 pb-4 space-y-4">
            <div className="pl-14 space-y-3">
              <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  Your Answer: {answer.selected_answer}
                </p>
              </div>
              
              {!isCorrect && (
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-800">
                    Correct Answer: {question.correct_answer}
                  </p>
                </div>
              )}
              
              <div className="p-3 rounded-lg bg-gray-50 border-l-4 border-violet-500">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Explanation</p>
                    <p className="text-sm text-gray-700">{question.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
};

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { resultId } = params;

  const fetchResult = useCallback(async () => {
    if (!resultId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/test/results/${resultId}`);
      setResult(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch test result.");
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [resultId, router]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (isLoading) return <ResultLoader />;

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-6">This test report may have expired or doesn't exist.</p>
          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
            <Brain className="h-5 w-5 text-violet-500" />
            <span className="font-medium text-gray-700">AI Performance Report</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {result.quiz.title}
          </h1>
          <p className="text-gray-600">Detailed analysis of your quiz performance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-gray-900">Your Score</CardTitle>
                <CardDescription>Overall performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreDisplay 
                  score={result.score} 
                  total={result.totalQuestions} 
                  percentage={scorePercentage} 
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="mt-6 space-y-3"
            >
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Analysis and Questions */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Analysis Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    AI-Powered Analysis
                  </CardTitle>
                  <CardDescription>
                    Personalized insights based on your performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AnalysisSection
                    title="Strengths"
                    items={result.analysis.strengths}
                    icon={Zap}
                    color="text-green-600"
                    bgColor="bg-green-50"
                    delay={0.6}
                  />
                  
                  <AnalysisSection
                    title="Areas for Improvement"
                    items={result.analysis.weaknesses}
                    icon={Target}
                    color="text-red-600"
                    bgColor="bg-red-50"
                    delay={0.8}
                  />
                  
                  <AnalysisSection
                    title="Recommendations"
                    items={result.analysis.recommendations}
                    icon={TrendingUp}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    delay={1.0}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Question Review */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    Question Review
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of each question and answer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-0">
                    {result.quiz.questions.map((question, index) => {
                      const studentAnswer = result.answers.find(a => a.question_id === question.question_id);
                      return (
                        <QuestionReviewItem
                          key={question.question_id}
                          question={question}
                          answer={studentAnswer}
                          index={index}
                        />
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
