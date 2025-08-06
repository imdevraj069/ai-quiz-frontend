'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Assuming you create this
import { CheckCircle, XCircle, Target, Zap, TrendingUp, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// We need a simple, custom Accordion as we are not using shadcn
const CustomAccordion = ({ children }) => <div className="border-t">{children}</div>;
const CustomAccordionItem = ({ children, value }) => <div className="border-b">{children}</div>;
const CustomAccordionTrigger = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  // This is a simplified implementation. The children prop will actually be an array here.
  const trigger = children[0];
  const content = children[1];
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-4 font-medium text-left hover:bg-slate-50">
        {trigger}
      </button>
      {isOpen && <div className="p-4 pt-0">{content}</div>}
    </div>
  );
};


export default function ResultPage() {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const { resultId } = params;

    const fetchResult = useCallback(async () => {
        if (!resultId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/test/results/${resultId}`);
            setResult(response.data.data);
        } catch (error) {
            toast.error("Failed to fetch test result.");
        } finally {
            setIsLoading(false);
        }
    }, [resultId]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading Your Report...</div>;
    }

    if (!result) {
        return <div className="flex justify-center items-center h-screen">Could not find the test report.</div>;
    }

    const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 container mx-auto p-4 sm:p-8"
        >
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{result.quiz.title}</CardTitle>
                    <CardDescription>Here is your detailed performance report.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-lg">Your Score</p>
                    <p className="text-6xl font-bold text-slate-800">{scorePercentage}%</p>
                    <p className="text-slate-500">({result.score} out of {result.totalQuestions} correct)</p>
                </CardContent>
            </Card>

            {/* AI Analysis Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="text-purple-500" /> AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2"><Zap className="text-green-500" /> Strengths</h3>
                        <ul className="list-disc list-inside text-slate-700 mt-1">
                            {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold flex items-center gap-2"><Target className="text-red-500" /> Weaknesses</h3>
                        <ul className="list-disc list-inside text-slate-700 mt-1">
                            {result.analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="text-orange-500" /> Recommendations</h3>
                        <ul className="list-disc list-inside text-slate-700 mt-1">
                            {result.analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Question Review Accordion */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Your Answers</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomAccordion>
                        {result.quiz.questions.map((q, index) => {
                            const studentAnswer = result.answers.find(a => a.question_id === q.question_id);
                            return (
                                <CustomAccordionItem value={`item-${index}`} key={q.question_id}>
                                    <CustomAccordionTrigger>
                                        <div className="flex items-center gap-3 text-left">
                                            {studentAnswer.is_correct 
                                                ? <CheckCircle className="text-green-500 flex-shrink-0" /> 
                                                : <XCircle className="text-red-500 flex-shrink-0" />}
                                            <span>{q.question_id}. {q.question_text}</span>
                                        </div>
                                        {/* This is the content part of the trigger */}
                                        <div className="space-y-3 pl-10 mt-4">
                                            <p className={`text-sm ${studentAnswer.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                                                <strong>Your Answer: </strong>{studentAnswer.selected_answer}
                                            </p>
                                            {!studentAnswer.is_correct && (
                                                <p className="text-sm text-blue-700">
                                                    <strong>Correct Answer: </strong>{q.correct_answer}
                                                </p>
                                            )}
                                            <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                                                <strong>Explanation: </strong>{q.explanation}
                                            </div>
                                        </div>
                                    </CustomAccordionTrigger>
                                </CustomAccordionItem>
                            );
                        })}
                    </CustomAccordion>
                </CardContent>
            </Card>
        </motion.div>
    );
}