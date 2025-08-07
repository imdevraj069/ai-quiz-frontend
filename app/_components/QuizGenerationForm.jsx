'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, BookOpen, Sparkles, FileText, GraduationCap, Clock, Target, Hash } from 'lucide-react';

// --- Schemas for validation ---
const pdfSchema = z.object({
  pdf: z.instanceof(FileList).refine(files => files?.length === 1, 'A PDF file is required.'),
  subject: z.string().min(1, 'Subject is required'),
  pace: z.string({ required_error: "Please select a pace." }),
  difficulty: z.string({ required_error: "Please select a difficulty." }),
  numQuestions: z.coerce.number().min(1, 'Must be at least 1').max(10, 'Cannot exceed 10'),
});

const ncertSchema = z.object({
  classFolderId: z.string({ required_error: "Please select a class." }),
  subjectFolderId: z.string({ required_error: "Please select a subject." }),
  chapterFile: z.string({ required_error: "Please select a chapter." }),
  pace: z.string({ required_error: "Please select a pace." }),
  difficulty: z.string({ required_error: "Please select a difficulty." }),
  numQuestions: z.coerce.number().min(1, 'Must be at least 1').max(10, 'Cannot exceed 10'),
});

// Enhanced loader component
const Spinner = ({ size = "sm" }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <Loader2 className={`${size === "sm" ? "h-4 w-4" : "h-6 w-6"} text-violet-500`} />
  </motion.div>
);

// Premium loading overlay
const LoadingOverlay = ({ isVisible, message }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 p-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full"
            />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-500" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{message}</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few moments...</p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function QuizGenerationForm() {
  const [mode, setMode] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [classes, setClasses] = useState({ loading: true, data: [] });
  const [subjects, setSubjects] = useState({ loading: false, data: [] });
  const [chapters, setChapters] = useState({ loading: false, data: [] });

  const pdfForm = useForm({ resolver: zodResolver(pdfSchema) });
  const ncertForm = useForm({ resolver: zodResolver(ncertSchema) });

  useEffect(() => {
    if (mode === 'ncert' && classes.data.length === 0) {
      api.get('/quiz/drive-contents')
        .then(res => setClasses({ loading: false, data: res.data.data.filter(f => f.mimeType.includes('folder')) }))
        .catch(() => toast.error("Could not load classes from library."));
    }
  }, [mode, classes.data.length]);

  const handleClassChange = (folderId) => {
    ncertForm.setValue('classFolderId', folderId);
    ncertForm.resetField('subjectFolderId');
    ncertForm.resetField('chapterFile');
    setSubjects({ loading: true, data: [] });
    setChapters({ loading: false, data: [] });

    api.get(`/quiz/drive-contents?folderId=${folderId}`)
      .then(res => setSubjects({ loading: false, data: res.data.data.filter(f => f.mimeType.includes('folder')) }))
      .catch(() => toast.error("Could not load subjects."));
  };

  const handleSubjectChange = (folderId) => {
    ncertForm.setValue('subjectFolderId', folderId);
    ncertForm.resetField('chapterFile');
    setChapters({ loading: true, data: [] });

    api.get(`/quiz/drive-contents?folderId=${folderId}`)
      .then(res => setChapters({ loading: false, data: res.data.data.filter(f => f.mimeType.includes('pdf')) }))
      .catch(() => toast.error("Could not load chapters."));
  };

  const handleSubmission = async (data) => {
    setIsLoading(true);
    toast.info("Generating your quiz...", { description: "The AI is working..." });

    try {
      let response;
      if (mode === 'pdf') {
        const formData = new FormData();
        formData.append('pdf', data.pdf[0]);
        formData.append('subject', data.subject);
        formData.append('numQuestions', data.numQuestions);
        formData.append('pace', data.pace);
        formData.append('difficulty', data.difficulty);
        formData.append('studentClass', 'XII');
        response = await api.post('/quiz/generate-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const chapterInfo = JSON.parse(data.chapterFile);
        const classInfo = classes.data.find(c => c.id === data.classFolderId);
        const subjectInfo = subjects.data.find(s => s.id === data.subjectFolderId);
        const chapterNumber = chapterInfo.name.replace(/[^0-9]/g, '');
        response = await api.post('/quiz/generate-ncert', {
          ...data,
          studentClass: classInfo.name.replace('Class ', ''),
          subject: subjectInfo.name,
          chapter: chapterNumber,
        });
      }

      const quizId = response.data.data._id;
      toast.success("Quiz generated successfully!");
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      toast.error("Quiz Generation Failed", { description: error.response?.data?.message || 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const commonFields = (form) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4 w-4 text-violet-500" />
            Learning Pace
          </Label>
          <Select onValueChange={(val) => form.setValue('pace', val)}>
            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
              <SelectValue placeholder="Choose your pace..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">🐌 Slow & Steady</SelectItem>
              <SelectItem value="average">⚡ Average Pace</SelectItem>
              <SelectItem value="fast">🚀 Fast Track</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.pace && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-500 flex items-center gap-1"
            >
              {form.formState.errors.pace.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="space-y-2"
        >
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Target className="h-4 w-4 text-violet-500" />
            Difficulty Level
          </Label>
          <Select onValueChange={(val) => form.setValue('difficulty', val)}>
            <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
              <SelectValue placeholder="Select difficulty..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">🟢 Easy</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="challenging">🔴 Challenging</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.difficulty && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-500 flex items-center gap-1"
            >
              {form.formState.errors.difficulty.message}
            </motion.p>
          )}
        </motion.div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="space-y-2"
      >
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Hash className="h-4 w-4 text-violet-500" />
          Number of Questions
        </Label>
        <Input
          type="number"
          defaultValue={5}
          min={1}
          max={10}
          className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors text-center text-lg font-semibold"
          {...form.register('numQuestions')}
        />
        {form.formState.errors.numQuestions && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            {form.formState.errors.numQuestions.message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-gray-600">Create personalized quizzes with artificial intelligence</p>
      </motion.div>

      <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <LoadingOverlay isVisible={isLoading} message="Generating your personalized quiz" />
          
          {/* Premium Tab Navigation */}
          <div className="flex relative bg-gray-50/50">
            <motion.div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg m-1"
              initial={false}
              animate={{
                x: mode === 'pdf' ? 4 : 'calc(100% - 4px)',
                width: 'calc(50% - 8px)'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex-1 p-4 text-sm font-semibold transition-colors duration-200 rounded-lg m-1 ${
                mode === 'pdf' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('pdf')}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                Upload PDF
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex-1 p-4 text-sm font-semibold transition-colors duration-200 rounded-lg m-1 ${
                mode === 'ncert' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('ncert')}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                NCERT Library
              </div>
            </motion.button>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'pdf' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'pdf' ? 20 : -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {mode === 'pdf' ? (
                  <form onSubmit={pdfForm.handleSubmit(handleSubmission)} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-violet-500" />
                        Upload PDF Document
                      </Label>
                      <div className="relative">
                        <Input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          className="h-12 border-2 border-dashed border-gray-300 hover:border-violet-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                          {...pdfForm.register('pdf')}
                        />
                      </div>
                      {pdfForm.formState.errors.pdf && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {pdfForm.formState.errors.pdf.message}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <GraduationCap className="h-4 w-4 text-violet-500" />
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Modern Physics, Organic Chemistry..."
                        className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors"
                        {...pdfForm.register('subject')}
                      />
                      {pdfForm.formState.errors.subject && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {pdfForm.formState.errors.subject.message}
                        </motion.p>
                      )}
                    </motion.div>

                    {commonFields(pdfForm)}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Spinner />
                            Generating Quiz...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Generate Quiz
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                ) : (
                  <form onSubmit={ncertForm.handleSubmit(handleSubmission)} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <GraduationCap className="h-4 w-4 text-violet-500" />
                        Class
                      </Label>
                      <div className="flex items-center gap-3">
                        {classes.loading && <Spinner />}
                        <Select onValueChange={handleClassChange}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                            <SelectValue placeholder="Select your class..." />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.data.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {ncertForm.formState.errors.classFolderId && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {ncertForm.formState.errors.classFolderId.message}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <BookOpen className="h-4 w-4 text-violet-500" />
                        Subject
                      </Label>
                      <div className="flex items-center gap-3">
                        {subjects.loading && <Spinner />}
                        <Select onValueChange={handleSubjectChange} disabled={!ncertForm.getValues('classFolderId')}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                            <SelectValue placeholder="Select subject..." />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.data.map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {ncertForm.formState.errors.subjectFolderId && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {ncertForm.formState.errors.subjectFolderId.message}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-violet-500" />
                        Chapter
                      </Label>
                      <div className="flex items-center gap-3">
                        {chapters.loading && <Spinner />}
                        <Select onValueChange={(val) => ncertForm.setValue('chapterFile', val)} disabled={!ncertForm.getValues('subjectFolderId')}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-violet-300 focus:border-violet-500 transition-colors">
                            <SelectValue placeholder="Select chapter..." />
                          </SelectTrigger>
                          <SelectContent>
                            {chapters.data.map(ch => (
                              <SelectItem key={ch.id} value={JSON.stringify(ch)}>
                                {ch.name.replace('.pdf', '')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {ncertForm.formState.errors.chapterFile && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-red-500"
                        >
                          {ncertForm.formState.errors.chapterFile.message}
                        </motion.p>
                      )}
                    </motion.div>

                    {commonFields(ncertForm)}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Spinner />
                            Generating Quiz...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Generate Quiz
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-6 text-sm text-gray-500"
      >
        <p>Powered by advanced AI • Generate up to 10 questions • Multiple difficulty levels</p>
      </motion.div>
    </div>
  );
}
