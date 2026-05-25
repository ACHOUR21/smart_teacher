'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Heart, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['teacher', 'student', 'parent', 'admin']),
})

type FormData = z.infer<typeof schema>

const roles = [
  { value: 'student', label: 'Student', icon: BookOpen, color: 'from-violet-500 to-purple-500' },
  { value: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
  { value: 'parent', label: 'Parent', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { value: 'admin', label: 'Admin', icon: Shield, color: 'from-amber-500 to-orange-500' },
] as const

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  async function onSubmit(data: FormData) {
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Account created! Welcome to EduAI.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a...</label>
          <div className="grid grid-cols-4 gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setValue('role', role.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                  selectedRole === role.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  selectedRole === role.value
                    ? `bg-gradient-to-br ${role.color}`
                    : 'bg-slate-100 dark:bg-slate-700'
                )}>
                  <role.icon className={cn('w-4 h-4', selectedRole === role.value ? 'text-white' : 'text-slate-400')} />
                </div>
                <span className={cn('text-xs font-medium', selectedRole === role.value ? 'text-primary-700 dark:text-primary-400' : 'text-slate-500')}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
          <input
            {...register('name')}
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </button>

        <p className="text-xs text-slate-400 text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary-600 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  )
}
