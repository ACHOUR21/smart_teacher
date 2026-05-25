'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, GripVertical, ChevronDown, ChevronRight, Video, FileText,
  BookOpen, Trash2, Edit3, Save, Eye, ArrowLeft, Check
} from 'lucide-react';
import Link from 'next/link';

type LessonType = 'video' | 'pdf' | 'quiz';

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isOpen: boolean;
}

const initialChapters: Chapter[] = [
  {
    id: 'ch1', title: 'Chapter 1: Limits & Continuity', isOpen: true,
    lessons: [
      { id: 'l1', title: 'Introduction to Limits', type: 'video', duration: '12 min' },
      { id: 'l2', title: 'One-Sided Limits', type: 'video', duration: '18 min' },
      { id: 'l3', title: 'Practice Problems', type: 'pdf', duration: '5 min' },
    ],
  },
  {
    id: 'ch2', title: 'Chapter 2: Derivatives', isOpen: false,
    lessons: [
      { id: 'l4', title: 'Definition of Derivative', type: 'video', duration: '20 min' },
      { id: 'l5', title: 'Power Rule', type: 'video', duration: '15 min' },
    ],
  },
];

const typeIcon: Record<LessonType, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5 text-blue-500" />,
  pdf: <FileText className="h-3.5 w-3.5 text-amber-500" />,
  quiz: <BookOpen className="h-3.5 w-3.5 text-purple-500" />,
};

export default function TeacherCourseEditorPage() {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [courseInfo, setCourseInfo] = useState({
    title: 'Advanced Mathematics',
    description: 'A comprehensive course covering limits, derivatives, integrals, and their applications.',
    subject: 'Mathematics',
    gradeLevel: '11th Grade',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleChapter(id: string) {
    setChapters(p => p.map(c => c.id === id ? { ...c, isOpen: !c.isOpen } : c));
  }

  function addChapter() {
    const id = `ch${Date.now()}`;
    setChapters(p => [...p, { id, title: 'New Chapter', lessons: [], isOpen: true }]);
    setEditingChapter(id);
  }

  function updateChapterTitle(id: string, title: string) {
    setChapters(p => p.map(c => c.id === id ? { ...c, title } : c));
  }

  function deleteChapter(id: string) {
    setChapters(p => p.filter(c => c.id !== id));
  }

  function addLesson(chapterId: string) {
    const id = `l${Date.now()}`;
    setChapters(p => p.map(c =>
      c.id === chapterId
        ? { ...c, lessons: [...c.lessons, { id, title: 'New Lesson', type: 'video', duration: '10 min' }] }
        : c
    ));
    setEditingLesson({ chapterId, lessonId: id });
  }

  function updateLesson(chapterId: string, lessonId: string, patch: Partial<Lesson>) {
    setChapters(p => p.map(c =>
      c.id === chapterId
        ? { ...c, lessons: c.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) }
        : c
    ));
  }

  function deleteLesson(chapterId: string, lessonId: string) {
    setChapters(p => p.map(c =>
      c.id === chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c
    ));
  }

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000); }

  const totalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/courses" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Course Editor</h1>
          <p className="text-slate-500 text-sm mt-1">{chapters.length} chapters · {totalLessons} lessons</p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/courses" className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview
          </Link>
          <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Course'}
          </button>
        </div>
      </div>

      {/* Course info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Course Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Course Title</label>
            <input
              value={courseInfo.title}
              onChange={e => setCourseInfo(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Subject</label>
            <input value={courseInfo.subject} onChange={e => setCourseInfo(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Grade Level</label>
            <select value={courseInfo.gradeLevel} onChange={e => setCourseInfo(p => ({ ...p, gradeLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {['7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
            <textarea value={courseInfo.description} onChange={e => setCourseInfo(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          {(['DRAFT', 'PUBLISHED'] as const).map(s => (
            <button key={s} onClick={() => setCourseInfo(p => ({ ...p, status: s }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                courseInfo.status === s
                  ? s === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Curriculum</h2>
          <button onClick={addChapter} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700">
            <Plus className="h-3.5 w-3.5" /> Add Chapter
          </button>
        </div>

        {chapters.map((chapter, ci) => (
          <motion.div key={chapter.id} layout className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Chapter header */}
            <div className="flex items-center gap-3 p-4">
              <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
              <button onClick={() => toggleChapter(chapter.id)} className="flex-shrink-0">
                {chapter.isOpen
                  ? <ChevronDown className="h-4 w-4 text-slate-400" />
                  : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
              {editingChapter === chapter.id ? (
                <input
                  autoFocus
                  value={chapter.title}
                  onChange={e => updateChapterTitle(chapter.id, e.target.value)}
                  onBlur={() => setEditingChapter(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingChapter(null)}
                  className="flex-1 text-sm font-semibold bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white"
                />
              ) : (
                <span className="flex-1 text-sm font-semibold text-slate-900 dark:text-white">{chapter.title}</span>
              )}
              <span className="text-xs text-slate-400">{chapter.lessons.length} lessons</span>
              <button onClick={() => setEditingChapter(chapter.id)} className="p-1 text-slate-400 hover:text-slate-600">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteChapter(chapter.id)} className="p-1 text-slate-400 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lessons */}
            <AnimatePresence initial={false}>
              {chapter.isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-slate-100 dark:border-slate-700"
                >
                  {chapter.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab" />
                      {typeIcon[lesson.type]}
                      {editingLesson?.lessonId === lesson.id ? (
                        <input
                          autoFocus
                          value={lesson.title}
                          onChange={e => updateLesson(chapter.id, lesson.id, { title: e.target.value })}
                          onBlur={() => setEditingLesson(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingLesson(null)}
                          className="flex-1 text-sm bg-transparent border-b border-primary-500 outline-none text-slate-900 dark:text-white"
                        />
                      ) : (
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{lesson.title}</span>
                      )}
                      <select
                        value={lesson.type}
                        onChange={e => updateLesson(chapter.id, lesson.id, { type: e.target.value as LessonType })}
                        className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="quiz">Quiz</option>
                      </select>
                      <input
                        value={lesson.duration}
                        onChange={e => updateLesson(chapter.id, lesson.id, { duration: e.target.value })}
                        placeholder="Duration"
                        className="w-20 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 outline-none"
                      />
                      <button onClick={() => setEditingLesson({ chapterId: chapter.id, lessonId: lesson.id })} className="p-1 text-slate-400 hover:text-slate-600">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteLesson(chapter.id, lesson.id)} className="p-1 text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="px-4 py-3">
                    <button onClick={() => addLesson(chapter.id)}
                      className="flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-700">
                      <Plus className="h-3.5 w-3.5" /> Add Lesson
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
