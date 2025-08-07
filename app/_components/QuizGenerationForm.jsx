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
import { Loader2 } from 'lucide-react';

// --- Schemas for validation ---
const pdfSchema = z.object({
  pdf: z.instanceof(FileList).refine(files => files?.length === 1, 'A PDF file is required.'),
  subject: z.string().min(1, 'Subject is required'),
  numQuestions: z.coerce.number().min(1).max(10),
});

const ncertSchema = z.object({
    classFolderId: z.string({ required_error: "Please select a class." }),
    subjectFolderId: z.string({ required_error: "Please select a subject." }),
    chapterFile: z.string({ required_error: "Please select a chapter." }), // Will be a stringified object
    numQuestions: z.coerce.number().min(1).max(10),
});

// A small loader component
const Spinner = () => <Loader2 className="h-4 w-4 animate-spin text-slate-500" />;

export default function QuizGenerationForm() {
  const [mode, setMode] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // State for dynamic NCERT selections
  const [classes, setClasses] = useState({ loading: true, data: [] });
  const [subjects, setSubjects] = useState({ loading: false, data: [] });
  const [chapters, setChapters] = useState({ loading: false, data: [] });

  const pdfForm = useForm({ resolver: zodResolver(pdfSchema) });
  const ncertForm = useForm({ resolver: zodResolver(ncertSchema) });

  // Fetch initial classes from Google Drive
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
            formData.append('pace', 'average');
            formData.append('difficulty', 'medium');
            formData.append('studentClass', 'XII');
            response = await api.post('/quiz/generate-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else { // NCERT mode
            const classInfo = classes.data.find(c => c.id === data.classFolderId);
            response = await api.post('/quiz/generate-ncert', {
                chapterFile: data.chapterFile, // Send the stringified object
                numQuestions: data.numQuestions,
                studentClass: classInfo.name.replace('Class ', ''),
                pace: 'average',
                difficulty: 'medium'
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

  return (
    <Card>
      <div className="flex border-b">
        <button 
            className={`flex-1 p-3 text-sm font-medium transition-colors ${mode === 'pdf' ? 'bg-slate-100 border-b-2 border-slate-800' : 'text-slate-500'}`}
            onClick={() => setMode('pdf')}
        >
          Upload PDF
        </button>
        <button 
            className={`flex-1 p-3 text-sm font-medium transition-colors ${mode === 'ncert' ? 'bg-slate-100 border-b-2 border-slate-800' : 'text-slate-500'}`}
            onClick={() => setMode('ncert')}
        >
          Select from NCERT Library
        </button>
      </div>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'pdf' ? (
              <form onSubmit={pdfForm.handleSubmit(handleSubmission)} className="space-y-4">
                <div>
                  <Label htmlFor="pdf">Upload PDF</Label>
                  <Input id="pdf" type="file" accept=".pdf" {...pdfForm.register('pdf')} />
                  {pdfForm.formState.errors.pdf && <p className="text-sm text-red-500 mt-1">{pdfForm.formState.errors.pdf.message}</p>}
                </div>
                <div>
                  <Label htmlFor="subject">Subject of PDF</Label>
                  <Input id="subject" placeholder="e.g., Modern Physics" {...pdfForm.register('subject')} />
                  {pdfForm.formState.errors.subject && <p className="text-sm text-red-500 mt-1">{pdfForm.formState.errors.subject.message}</p>}
                </div>
                 <div>
                  <Label>Number of Questions</Label>
                  <Input type="number" defaultValue={5} {...pdfForm.register('numQuestions')} />
                  {pdfForm.formState.errors.numQuestions && <p className="text-sm text-red-500 mt-1">{pdfForm.formState.errors.numQuestions.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </form>
            ) : (
              <form onSubmit={ncertForm.handleSubmit(handleSubmission)} className="space-y-4">
                <div>
                  <Label>Class</Label>
                  <div className="flex items-center gap-2">
                    {classes.loading && <Spinner />}
                    <Select onValueChange={handleClassChange}><SelectTrigger><SelectValue placeholder="Select a class..." /></SelectTrigger>
                      <SelectContent>{classes.data.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {ncertForm.formState.errors.classFolderId && <p className="text-sm text-red-500 mt-1">{ncertForm.formState.errors.classFolderId.message}</p>}
                </div>

                <div>
                  <Label>Subject</Label>
                  <div className="flex items-center gap-2">
                    {subjects.loading && <Spinner />}
                    <Select onValueChange={handleSubjectChange} disabled={!ncertForm.getValues('classFolderId')}><SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                      <SelectContent>{subjects.data.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                   {ncertForm.formState.errors.subjectFolderId && <p className="text-sm text-red-500 mt-1">{ncertForm.formState.errors.subjectFolderId.message}</p>}
                </div>

                <div>
                  <Label>Chapter</Label>
                   <div className="flex items-center gap-2">
                    {chapters.loading && <Spinner />}
                    <Select onValueChange={(val) => ncertForm.setValue('chapterFile', val)} disabled={!ncertForm.getValues('subjectFolderId')}><SelectTrigger><SelectValue placeholder="Select a chapter..." /></SelectTrigger>
                      <SelectContent>{chapters.data.map(ch => <SelectItem key={ch.id} value={JSON.stringify(ch)}>{ch.name.replace('.pdf', '')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {ncertForm.formState.errors.chapterFile && <p className="text-sm text-red-500 mt-1">{ncertForm.formState.errors.chapterFile.message}</p>}
                </div>
                
                <div>
                  <Label>Number of Questions</Label>
                  <Input type="number" defaultValue={5} {...ncertForm.register('numQuestions')} />
                  {ncertForm.formState.errors.numQuestions && <p className="text-sm text-red-500 mt-1">{ncertForm.formState.errors.numQuestions.message}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}