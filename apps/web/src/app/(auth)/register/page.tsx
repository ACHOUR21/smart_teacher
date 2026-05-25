'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, GraduationCap, BookOpen, Heart, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ROLE_REDIRECTS } from '@/lib/constants';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

const roles = [
  { id: 'STUDENT', label: 'Student', icon: GraduationCap, desc: 'Learn & grow' },
  { id: 'TEACHER', label: 'Teacher', icon: BookOpen, desc: 'Teach & inspire' },
  { id: 'PARENT', label: 'Parent', icon: Heart, desc: 'Monitor progress' },
  { id: 'ADMIN', label: 'Admin', icon: Shield, desc: 'Manage platform' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [role, setRole] = useState('STUDENT');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      const user = await authRegister(data.name, data.email, data.password, role);
      const roleKey = user.role.toLowerCase() as keyof typeof ROLE_REDIRECTS;
      const dest = ROLE_REDIRECTS[roleKey] ?? '/student';
      router.push(dest);
    } catch {
      setError('Registration failed. This email may already be in use.');
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-full py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Join thousands of learners worldwide</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {roles.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              role === r.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            <r.icon className={`h-6 w-6 ${ role === r.id ? 'text-primary-600' : 'text-slate-400' }`} />
            <div className="text-center">
              <p className={`text-sm font-semibold ${ role === r.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300' }`}>{r.label}</p>
              <p className="text-xs text-slate-400">{r.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Full Name</label>
          <input
            {...register('name')}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 placeholder:text-slate-400"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@school.edu"
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 placeholder:text-slate-400"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 placeholder:text-slate-400 pr-10"
            />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
      </p>
    </div>
  );
}
