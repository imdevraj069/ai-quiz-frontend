'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LogOut, History, Trophy, TrendingUp, Calendar, Target, Sparkles, User, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { format } from 'date-fns';
import QuizGenerationForm from './_components/QuizGenerationForm';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, description, gradient }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Result Item Component
const ResultItem = ({ result, index }) => (
  <motion.li
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.01, x: 4 }}
    className="group"
  >
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                {result.quiz.title}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Target className="h-3 w-3" />
                  Score: {Math.round((result.score / result.totalQuestions) * 100)}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                Math.round((result.score / result.totalQuestions) * 100) >= 80
                  ? 'bg-green-100 text-green-800'
                  : Math.round((result.score / result.totalQuestions) * 100) >= 60
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {Math.round((result.score / result.totalQuestions) * 100)}%
              </div>
            </div>
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Link href={`/results/${result._id}`}>
                View Report
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.li>
);

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [pastResults, setPastResults] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    recentActivity: 0
  });

  const fetchResults = useCallback(async () => {
    try {
      const response = await api.get('/test/results');
      const results = response.data.data;
      setPastResults(results);
      
      // Calculate stats
      if (results.length > 0) {
        const scores = results.map(r => Math.round((r.score / r.totalQuestions) * 100));
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const bestScore = Math.max(...scores);
        const recentActivity = results.filter(r => 
          new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        
        setStats({
          totalQuizzes: results.length,
          averageScore,
          bestScore,
          recentActivity
        });
      }
    } catch (error) {
      console.error("Could not fetch past results", error);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-4 sm:p-8 max-w-7xl"
      >
        {/* Header Section */}
        <motion.header 
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <User className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Ready to challenge yourself with a new quiz?
                </p>
              </div>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="border-2 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2"/>
              Logout
            </Button>
          </motion.div>
        </motion.header>

        {/* Stats Section */}
        {pastResults.length > 0 && (
          <motion.div variants={itemVariants} className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                icon={Trophy}
                title="Total Quizzes"
                value={stats.totalQuizzes}
                description="Completed so far"
                gradient="from-blue-500 to-blue-600"
              />
              <StatsCard
                icon={TrendingUp}
                title="Average Score"
                value={`${stats.averageScore}%`}
                description="Overall performance"
                gradient="from-green-500 to-green-600"
              />
              <StatsCard
                icon={Award}
                title="Best Score"
                value={`${stats.bestScore}%`}
                description="Personal record"
                gradient="from-yellow-500 to-orange-500"
              />
              <StatsCard
                icon={Clock}
                title="This Week"
                value={stats.recentActivity}
                description="Recent activity"
                gradient="from-purple-500 to-violet-600"
              />
            </div>
          </motion.div>
        )}

        {/* Quiz Generation Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a New Quiz</h2>
            <p className="text-gray-600">Generate personalized quizzes with AI assistance</p>
          </div>
          <QuizGenerationForm />
        </motion.div>

        {/* Past Results Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz History</h2>
              <p className="text-gray-600">Track your learning progress</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <AnimatePresence>
                {pastResults.length > 0 ? (
                  <div className="p-6">
                    <ul className="space-y-4">
                      {pastResults.map((result, index) => (
                        <ResultItem key={result._id} result={result} index={index} />
                      ))}
                    </ul>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quiz history yet</h3>
                    <p className="text-gray-500 mb-6">Your completed quizzes and results will appear here</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      Start your first quiz above!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-12 text-sm text-gray-500"
        >
          <p>Keep learning, keep growing! 🚀</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
