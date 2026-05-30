import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-400/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EduAI</span>
          </Link>
        </div>

        <div className="relative z-10">
          <blockquote className="text-primary-100 text-xl leading-relaxed font-medium mb-6">
            &ldquo;EduAI transformed how our school operates. Teachers save hours every week,
            students are more engaged, and parents stay informed in real time.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              AK
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Ahmed Khalil</div>
              <div className="text-primary-300 text-xs">Head of Education, Dubai School Network</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['50K+', 'Students'], ['2,400', 'Courses'], ['98%', 'Satisfaction']].map(([val, label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-primary-200 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-light dark:bg-surface-dark">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduAI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
