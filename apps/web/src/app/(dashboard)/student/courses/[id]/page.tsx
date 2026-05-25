'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Play, FileText, CheckCircle2,
  Lock, Clock, BookOpen, ArrowLeft, ArrowRight, Download
} from 'lucide-react';
import Link from 'next/link';

const course = {
  id: '1',
  title: 'Advanced Mathematics',
  teacher: 'Mr. Al-Rashid',
  totalLessons: 24,
  completedLessons: 14,
  chapters: [
    {
      id: 'ch1', title: 'Chapter 1: Limits & Continuity', order: 1, isOpen: true,
      lessons: [
        { id: 'l1', title: 'Introduction to Limits', type: 'video', duration: '12 min', completed: true, locked: false },
        { id: 'l2', title: 'One-Sided Limits', type: 'video', duration: '18 min', completed: true, locked: false },
        { id: 'l3', title: 'Continuity of Functions', type: 'video', duration: '15 min', completed: true, locked: false },
        { id: 'l4', title: 'Practice Problems', type: 'pdf', duration: '5 min', completed: true, locked: false },
      ],
    },
    {
      id: 'ch2', title: 'Chapter 2: Derivatives', order: 2, isOpen: true,
      lessons: [
        { id: 'l5', title: 'Definition of Derivative', type: 'video', duration: '20 min', completed: true, locked: false },
        { id: 'l6', title: 'Power Rule & Chain Rule', type: 'video', duration: '22 min', completed: true, locked: false },
        { id: 'l7', title: 'Product & Quotient Rule', type: 'video', duration: '19 min', completed: false, locked: false },
        { id: 'l8', title: 'Implicit Differentiation', type: 'video', duration: '16 min', completed: false, locked: false },
        { id: 'l9', title: 'Chapter 2 Quiz', type: 'quiz', duration: '30 min', completed: false, locked: false },
      ],
    },
    {
      id: 'ch3', title: 'Chapter 3: Applications of Derivatives', order: 3, isOpen: false,
      lessons: [
        { id: 'l10', title: 'Related Rates', type: 'video', duration: '25 min', completed: false, locked: false },
        { id: 'l11', title: 'Optimization Problems', type: 'video', duration: '28 min', completed: false, locked: false },
        { id: 'l12', title: 'Mean Value Theorem', type: 'video', duration: '18 min', completed: false, locked: true },
      ],
    },
    {
      id: 'ch4', title: 'Chapter 4: Integration', order: 4, isOpen: false,
      lessons: [
        { id: 'l13', title: 'Antiderivatives', type: 'video', duration: '20 min', completed: false, locked: true },
        { id: 'l14', title: 'Definite Integrals', type: 'video', duration: '24 min', completed: false, locked: true },
      ],
    },
  ],
};

const lessonContent: Record<string, { title: string; desc: string; resources: string[] }> = {
  l7: {
    title: 'Product & Quotient Rule',
    desc: 'In this lesson we explore two powerful differentiation rules. The Product Rule states that (fg)\' = f\'g + fg\'. The Quotient Rule gives us (f/g)\' = (f\'g − fg\') / g². We will work through several examples and apply these rules to complex functions.',
    resources: ['Product Rule Worksheet.pdf', 'Practice Problems Set 2.pdf'],
  },
  l5: {
    title: 'Definition of Derivative',
    desc: 'The derivative of a function f at a point x is defined as the limit of the difference quotient as h approaches 0. This fundamental concept forms the basis of differential calculus and has applications throughout science and engineering.',
    resources: ['Derivative Definition Notes.pdf'],
  },
};

function lessonIcon(type: string, completed: boolean, locked: boolean) {
  if (locked) return <Lock className="h-4 w-4 text-slate-300" />;
  if (completed) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (type === 'video') return <Play className="h-4 w-4 text-primary-500" />;
  if (type === 'pdf') return <FileText className="h-4 w-4 text-amber-500" />;
  return <BookOpen className="h-4 w-4 text-purple-500" />;
}

export default function StudentCoursePage() {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(course.chapters.filter(c => c.isOpen).map(c => c.id))
  );
  const [activeLesson, setActiveLesson] = useState(course.chapters[1].lessons[2]);

  const allLessons = course.chapters.flatMap(ch => ch.lessons);
  const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
  const content = lessonContent[activeLesson.id];

  function toggleChapter(id: string) {
    setOpenChapters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectLesson(lesson: typeof activeLesson) {
    if (!lesson.locked) setActiveLesson(lesson);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <Link href="/student/courses" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
          </Link>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{course.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{course.teacher}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
              <span className="font-medium text-primary-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
              <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {course.chapters.map(chapter => (
            <div key={chapter.id}>
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30"
              >
                {openChapters.has(chapter.id)
                  ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">{chapter.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {openChapters.has(chapter.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {chapter.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        disabled={lesson.locked}
                        className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 text-left transition-colors ${
                          activeLesson.id === lesson.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500'
                            : lesson.locked
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'
                        }`}
                      >
                        <span className="flex-shrink-0">{lessonIcon(lesson.type, lesson.completed, lesson.locked)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{lesson.title}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />{lesson.duration}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Video/content area */}
        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary-600/30 flex items-center justify-center mx-auto mb-4">
                <Play className="h-10 w-10 text-white" />
              </div>
              <p className="text-white font-semibold text-lg">{activeLesson.title}</p>
              <p className="text-slate-400 text-sm mt-1">{activeLesson.duration}</p>
              <button className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                Play Lesson
              </button>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {nextLesson && !nextLesson.locked && (
              <button
                onClick={() => setActiveLesson(nextLesson)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-xs font-medium hover:bg-white/30"
              >
                Next: {nextLesson.title} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lesson info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{activeLesson.title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {content?.desc ?? 'Select a lesson from the sidebar to start learning.'}
              </p>
              {content?.resources && content.resources.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Resources</p>
                  <div className="flex flex-wrap gap-2">
                    {content.resources.map(r => (
                      <button key={r} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                        <Download className="h-3.5 w-3.5" /> {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {prevLesson && !prevLesson.locked && (
                <button onClick={() => setActiveLesson(prevLesson)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Prev
                </button>
              )}
              {nextLesson && !nextLesson.locked && (
                <button onClick={() => setActiveLesson(nextLesson)} className="px-3 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700 flex items-center gap-1">
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
