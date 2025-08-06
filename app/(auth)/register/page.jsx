'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      toast.success("Registration Successful!", {
        description: "You can now log in with your new account.",
      });
      router.push('/login'); // Redirect to login page after successful registration
    } catch (error) {
      toast.error("Registration Failed", {
        description: error.response?.data?.message || 'An unknown error occurred.',
      });
      console.error("Registration failed:", error);
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
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-slate-500">Start your AI-powered learning journey today.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input id="username" placeholder="Username" {...register('username')} />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <Input id="email" placeholder="Email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Input id="password" type="password" placeholder="Password" {...register('password')} />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}