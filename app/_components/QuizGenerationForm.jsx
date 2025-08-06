'use client';

import { useState } from 'react';
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

const pdfSchema = z.object({
  pdf: z.instanceof(FileList).refine(files => files?.length === 1, 'A PDF file is required.'),
  subject: z.string().min(1, 'Subject is required'),
  numQuestions: z.coerce.number().min(1, 'Must be at least 1').max(10, 'Cannot exceed 10'),
});

// We'll add the NCERT schema later when that functionality is built
// const ncertSchema = z.object({...});

export default function QuizGenerationForm() {
  const [mode, setMode] = useState('pdf'); // 'pdf' or 'ncert'
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(pdfSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('pdf', data.pdf[0]);
    formData.append('subject', data.subject);
    formData.append('numQuestions', data.numQuestions);
    // Add other static parameters your backend expects
    formData.append('pace', 'average');
    formData.append('difficulty', 'medium');
    formData.append('studentClass', 'XII');

    toast.info("Generating your quiz...", {
      description: "The AI is working. This may take a moment."
    });

    try {
      const response = await api.post('/quiz/generate-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const quizId = response.data.data._id;
      toast.success("Quiz generated successfully!");
      router.push(`/quiz/${quizId}`); // Navigate to the quiz page
    } catch (error) {
      toast.error("Quiz Generation Failed", {
        description: error.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* We can add tabs here later for NCERT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="pdf" className="block text-sm font-medium text-slate-700 mb-1">Upload PDF</label>
                <Input id="pdf" type="file" accept=".pdf" {...register('pdf')} />
                {errors.pdf && <p className="text-sm text-red-500 mt-1">{errors.pdf.message}</p>}
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <Input id="subject" placeholder="e.g., Modern Physics" {...register('subject')} />
                {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 mb-1">Number of Questions (1-10)</label>
                <Input id="numQuestions" type="number" defaultValue={5} {...register('numQuestions')} />
                {errors.numQuestions && <p className="text-sm text-red-500 mt-1">{errors.numQuestions.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Quiz'}
              </Button>
            </form>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}