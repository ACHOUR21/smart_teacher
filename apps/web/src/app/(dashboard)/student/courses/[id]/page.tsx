'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Play, FileText, CheckCircle2,
  Lock, Clock, BookOpen, ArrowLeft, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { coursesApi } from '@/lib/api';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content?: string;
  videoUrl?: string;
  durationMins?: number;
  order: number;
  progress: Array<{ isCompleted: boolean }>;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  teacher: {
    user: { firstName: string; lastName: string; avatarUrl?: string };
  };
}

function lessonIcon(type: string, completed: boolean) {
  if (completed) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (type === 'VIDEO') return <Play className="h-4 w-4 text-primary-500" />;
  if (type === 'READING') return <FileText className="h-4 w-4 text-amber-500" />;
  return <BookOpen className="h-4 w-4 text-purple-500" />;
}

export default function StudentCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<{ completedLessons: number; totalLessons: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        coursesApi.getOne(courseId),
        coursesApi.getCourseProgress(courseId),
      ]);
      const c: Course = courseRes.data;
      setCourse(c);
      setProgress(progressRes.data);

      // Open first chapter and select first uncompleted lesson
      if (c.chapters.length > 0) {
        setOpenChapters(new Set([c.chapters[0].id]));
        const allLessons = c.chapters.flatMap((ch) => ch.lessons);
        const firstUncompleted = allLessons.find((l) => !l.progress?.[0]?.isCompleted);
        setActiveLesson(firstUncompleted ?? allLessons[0] ?? null);
      }
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allLessons = course?.chapters.flatMap((ch) => ch.lessons) ?? [];
  const currentIdx = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const handleCompleteLesson = async () => {
    if (!activeLesson || completingLesson) return;
    if (activeLesson.progress?.[0]?.isCompleted) {
      // Already completed, just go to next
      if (nextLesson) setActiveLesson(nextLesson);
      return;
    }
    setCompletingLesson(true);
    try {
      await coursesApi.completeLesson(courseId, activeLesson.id);
      toast.success('Lesson completed!');
      // Refresh data to update progress
      await fetchData();
      if (nextLesson) setActiveLesson(nextLesson);
    } catch {
      toast.error('Failed to mark lesson complete');
    } finally {
      setCompletingLesson(false);
    }
  };

  const toggleChapter = (id: string) =>
    setOpenChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Course not found.</p>
        <Link href="/student/courses" className="text-primary-600 text-sm hover:underline mt-2 block">Back to courses</Link>
      </div>
    );
  }

  const progressPct = progress?.percentage ?? 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <Link href="/student/courses" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
          </Link>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">{course.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {course.teacher.user.firstName} {course.teacher.user.lastName}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{progress?.completedLessons ?? 0}/{progress?.totalLessons ?? 0} lessons</span>
              <span className="font-medium text-primary-600">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
              <div className="h-1.5 rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {course.chapters.map((chapter) => (
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
                    {chapter.lessons.map((lesson) => {
                      const isCompleted = lesson.progress?.[0]?.isCompleted ?? false;
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full flex items-center gap-3 pl-8 pr-4 py-2.5 text-left transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'
                          }`}
                        >
                          <span className="flex-shrink-0">{lessonIcon(lesson.type, isCompleted)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{lesson.title}</p>
                            {lesson.durationMins && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5" />{lesson.durationMins} min
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Content area */}
        <div className="flex-1 bg-slate-900 rounded-2xl relative overflow-hidden">
          {activeLesson ? (
            activeLesson.videoUrl ? (
              <video
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-lg px-8">
                  <div className="h-20 w-20 rounded-full bg-primary-600/30 flex items-center justify-center mx-auto mb-4">
                    {activeLesson.type === 'VIDEO'
                      ? <Play className="h-10 w-10 text-white" />
                      : <BookOpen className="h-10 w-10 text-white" />}
                  </div>
                  <p className="text-white font-semibold text-lg">{activeLesson.title}</p>
                  {activeLesson.content && (
                    <p className="text-slate-400 text-sm mt-3 leading-relaxed">{activeLesson.content}</p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-500">Select a lesson to begin</p>
            </div>
          )}

          {nextLesson && (
            <button
              onClick={() => setActiveLesson(nextLesson)}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl text-xs font-medium hover:bg-white/30"
            >
              Next: {nextLesson.title} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Lesson info bar */}
        {activeLesson && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{activeLesson.title}</h2>
                {activeLesson.content && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {activeLesson.content}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {prevLesson && (
                  <button
                    onClick={() => setActiveLesson(prevLesson)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Prev
                  </button>
                )}
                <button
                  onClick={handleCompleteLesson}
                  disabled={completingLesson}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeLesson.progress?.[0]?.isCompleted
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {completingLesson ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : activeLesson.progress?.[0]?.isCompleted ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Done{nextLesson ? ' → Next' : ''}</>
                  ) : (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
