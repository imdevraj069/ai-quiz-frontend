'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.data.accessToken);
    } catch (error) {
      console.error("Login failed:", error);
      // Add user-facing error handling here (e.g., a toast notification)
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-slate-500">Sign in to continue your learning journey.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input id="email" placeholder="Email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Input id="password" type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-slate-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}