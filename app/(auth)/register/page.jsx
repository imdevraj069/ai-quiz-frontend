'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, Brain, ArrowRight, CheckCircle, Loader2, Shield, Zap, Target, Users } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Floating particles background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-emerald-200 rounded-full opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: Math.random() * 12 + 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

// Feature highlight component
const FeatureHighlight = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
  >
    <div className="p-2 bg-white/20 rounded-lg">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      <p className="text-white/80 text-xs">{description}</p>
    </div>
  </motion.div>
);

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-blue-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' },
    ];

    return levels[Math.min(score, 5)];
  };

  const strength = getStrength(password);
  
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strength.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordValue, setPasswordValue] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', data);
      toast.success("Welcome to QuizMaster AI!", {
        description: "Your account has been created successfully.",
      });
      router.push('/login');
    } catch (error) {
      toast.error("Registration Failed", {
        description: error.response?.data?.message || 'Please try again with different details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Cg fill="%23ffffff" fillOpacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">QuizMaster AI</h1>
                <p className="text-white/80">Intelligent Learning Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Start your
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI-powered learning
              </span>
              journey today
            </h2>

            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              Join thousands of learners who are already using our AI-powered platform 
              to accelerate their knowledge and achieve their goals.
            </p>

            <div className="space-y-4">
              <FeatureHighlight
                icon={Sparkles}
                title="Personalized Learning"
                description="AI adapts to your learning style and pace"
                delay={0.4}
              />
              <FeatureHighlight
                icon={Target}
                title="Smart Progress Tracking"
                description="Detailed analytics to monitor your improvement"
                delay={0.6}
              />
              <FeatureHighlight
                icon={Users}
                title="Community Learning"
                description="Connect with learners worldwide"
                delay={0.8}
              />
              <FeatureHighlight
                icon={Zap}
                title="Instant Feedback"
                description="Get immediate results and explanations"
                delay={1.0}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-3 text-white">
                <Shield className="h-5 w-5" />
                <span className="text-sm">
                  <strong>100% Free to start</strong> • No credit card required
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
            >
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full mb-4">
                  <Brain className="h-5 w-5" />
                  <span className="font-semibold">QuizMaster AI</span>
                </div>
              </div>

              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Create Your Account
                </h1>
                <p className="text-gray-600">Join the future of learning with AI</p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 transition-colors ${
                        focusedField === 'username' ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      className={`pl-10 h-12 border-2 transition-all duration-200 ${
                        focusedField === 'username' 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${errors.username ? 'border-red-500' : ''}`}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      {...register('username')}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        {errors.username.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors ${
                        focusedField === 'email' ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 h-12 border-2 transition-all duration-200 ${
                        focusedField === 'email' 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${errors.email ? 'border-red-500' : ''}`}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      {...register('email')}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors ${
                        focusedField === 'password' ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={`pl-10 pr-10 h-12 border-2 transition-all duration-200 ${
                        focusedField === 'password' 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${errors.password ? 'border-red-500' : ''}`}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      {...register('password', {
                        onChange: (e) => setPasswordValue(e.target.value)
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <PasswordStrength password={watchedPassword} />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                      required
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Create Account
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>

              {/* Social Registration Options */}
              <motion.div variants={itemVariants} className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </Button>
                  <Button variant="outline" className="h-10">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
