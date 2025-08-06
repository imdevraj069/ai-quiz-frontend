'use client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LogOut, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { format } from 'date-fns';
import QuizGenerationForm from './_components/QuizGenerationForm'; // Import the new form

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [pastResults, setPastResults] = useState([]);

  const fetchResults = useCallback(async () => {
    try {
      const response = await api.get('/test/results');
      setPastResults(response.data.data);
    } catch (error) {
      console.error("Could not fetch past results", error);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-8"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.username}!</h1>
          <p className="text-slate-500">Ready to start a new quiz?</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2"/>
          Logout
        </Button>
      </header>

      {/* Quiz Generation Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Create a New Quiz</h2>
        <QuizGenerationForm />
      </div>

      {/* Past Results Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><History /> Past Results</h2>
        <Card>
          <CardContent className="p-6">
            {pastResults.length > 0 ? (
              <ul className="space-y-4">
                {pastResults.map(result => (
                  <li key={result._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md hover:bg-slate-100">
                    <div>
                      <p className="font-semibold">{result.quiz.title}</p>
                      <p className="text-sm text-slate-500">
                        Taken on {format(new Date(result.createdAt), 'PP')} - Score: {Math.round((result.score / result.totalQuestions) * 100)}%
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/results/${result._id}`}>View Report</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-slate-500 py-4">Your past quiz results will appear here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}