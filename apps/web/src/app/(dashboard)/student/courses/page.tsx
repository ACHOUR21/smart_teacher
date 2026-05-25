import { Header } from '@/components/layout/header'
import { Search, Filter, Play, Clock, Star, Users, BookOpen, CheckCircle2, Lock } from 'lucide-react'

const enrolled = [
  { id: '1', title: 'Advanced Mathematics', subject: 'Mathematics', teacher: 'Dr. Sarah Mitchell', progress: 72, grade: '89%', nextLesson: 'Differential Equations', totalLessons: 48, completedLessons: 34, color: 'from-blue-500 to-cyan-400', rating: 4.9 },
  { id: '2', title: 'Physics 101', subject: 'Physics', teacher: 'Prof. James Cooper', progress: 55, grade: '82%', nextLesson: "Newton's Third Law", totalLessons: 36, completedLessons: 20, color: 'from-violet-500 to-purple-400', rating: 4.7 },
  { id: '3', title: 'English Literature', subject: 'Literature', teacher: 'Ms. Emily Davis', progress: 88, grade: '94%', nextLesson: 'Shakespeare — Hamlet Act 3', totalLessons: 40, completedLessons: 35, color: 'from-rose-500 to-pink-400', rating: 4.8 },
  { id: '4', title: 'World History', subject: 'History', teacher: 'Mr. Omar Hassan', progress: 30, grade: '76%', nextLesson: 'The French Revolution', totalLessons: 52, completedLessons: 16, color: 'from-amber-500 to-orange-400', rating: 4.6 },
  { id: '5', title: 'Chemistry Fundamentals', subject: 'Chemistry', teacher: 'Dr. Leila Ahmadi', progress: 45, grade: '80%', nextLesson: 'Organic Compounds', totalLessons: 44, completedLessons: 20, color: 'from-emerald-500 to-green-400', rating: 4.9 },
  { id: '6', title: 'Introduction to Biology', subject: 'Biology', teacher: 'Dr. Yuki Tanaka', progress: 60, grade: '85%', nextLesson: 'Cell Division', totalLessons: 38, completedLessons: 23, color: 'from-teal-500 to-cyan-400', rating: 4.7 },
]

const available = [
  { id: '7', title: 'Computer Science Basics', subject: 'CS', teacher: 'Mr. Lucas Blanc', students: 1240, lessons: 52, rating: 4.9, color: 'from-indigo-500 to-blue-400' },
  { id: '8', title: 'Art & Design Principles', subject: 'Art', teacher: 'Ms. Nina Rossi', students: 820, lessons: 30, rating: 4.8, color: 'from-pink-500 to-rose-400' },
]

export default function StudentCoursesPage() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="My Courses" subtitle="6 enrolled · 2 available" />
      <div className="flex-1 p-6 space-y-8">
        {/* Search & filter bar */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input placeholder="Search courses..." className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Enrolled courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled ({enrolled.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrolled.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover group">
                <div className={`h-2 bg-gradient-to-r ${c.color}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 leading-tight">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{c.teacher}</p>
                    </div>
                    <span className="text-lg font-bold gradient-text flex-shrink-0 ml-2">{c.grade}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{c.completedLessons}/{c.totalLessons} lessons</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                      <div className={`h-full bg-gradient-to-r ${c.color} rounded-full`} style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Play className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">Next: {c.nextLesson}</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discover section */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Discover More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {available.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card border border-slate-100 dark:border-slate-700 card-hover flex">
                <div className={`w-1.5 flex-shrink-0 bg-gradient-to-b ${c.color}`} />
                <div className="p-5 flex-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.subject}</span>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">{c.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{c.teacher}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{c.lessons} lessons</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{c.rating}</span>
                  </div>
                </div>
                <div className="flex items-center pr-5">
                  <button className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors">Enroll</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
