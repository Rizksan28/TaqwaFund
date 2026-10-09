import { lessons } from "@/data/learning";
import type { Lesson } from "@/data/learning";
import type { DemoState, LearningProgress } from "@/types";

export function lessonProgress(state: DemoState, lesson: Lesson): LearningProgress {
  return state.learningProgress[lesson.id] ?? { section: 0, readSections: [], answers: lesson.questions.map(() => null), checked: false, bestScore: 0, completed: false };
}

export function learningPercent(progress: LearningProgress, lesson: Lesson): number {
  return progress.completed ? 100 : Math.round(progress.readSections.length / lesson.sections.length * 60) + (progress.checked ? 20 : 0);
}

export function updateLesson(state: DemoState, id: string, patch: Partial<LearningProgress>): DemoState {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) throw new Error("Materi tidak ditemukan.");
  return { ...state, learningProgress: { ...state.learningProgress, [id]: { ...lessonProgress(state, lesson), ...patch } } };
}

export function openLessonSection(state: DemoState, id: string, section: number): DemoState {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson || section < 0 || section > lesson.sections.length) throw new Error("Bagian materi tidak valid.");
  const progress = lessonProgress(state, lesson);
  return updateLesson(state, id, { section, readSections: section < lesson.sections.length ? [...new Set([...progress.readSections, section])] : progress.readSections });
}

export function checkLessonQuiz(state: DemoState, id: string): DemoState {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) throw new Error("Materi tidak ditemukan.");
  const progress = lessonProgress(state, lesson);
  if (lesson.questions.some((question, index) => !Number.isInteger(progress.answers[index]) || progress.answers[index]! < 0 || progress.answers[index]! >= question.options.length)) throw new Error("Jawab semua pertanyaan terlebih dahulu.");
  const score = Math.round(lesson.questions.filter((question, index) => question.correct === progress.answers[index]).length / lesson.questions.length * 100);
  return updateLesson(state, id, { checked: true, bestScore: Math.max(progress.bestScore, score) });
}

export function finishLesson(state: DemoState, id: string): DemoState {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) throw new Error("Materi tidak ditemukan.");
  const progress = lessonProgress(state, lesson);
  if (progress.readSections.length !== lesson.sections.length || !progress.checked || !lesson.questions.every((question, index) => question.correct === progress.answers[index])) throw new Error("Baca semua bagian dan jawab kuis dengan benar sebelum menyelesaikan materi.");
  return updateLesson(state, id, { completed: true, completedAt: progress.completedAt ?? new Date().toISOString() });
}

export function recommendedLessons(state: DemoState) {
  const order: { id: string; reason: string }[] = [];
  if (!state.completedAssessment) order.push({ id: "separation", reason: "Dasar pengelolaan keuangan usaha" });
  else {
    if (!["Spreadsheet", "Aplikasi Pembukuan"].includes(state.assessment.bookkeeping)) order.push({ id: "records", reason: "Untuk memperkuat pencatatan usaha Anda" });
    if (state.assessment.financialSeparation !== "Sudah Dipisahkan") order.push({ id: "separation", reason: "Untuk membantu pemisahan dana usaha" });
    if (["Tidak Ada", "< 1 Bulan Biaya"].includes(state.assessment.cashBuffer)) order.push({ id: "buffer", reason: "Untuk memahami kebutuhan dana cadangan" });
    if (state.assessment.financingNeed > 0 || state.financingApplications.length) order.push({ id: "akad", reason: "Untuk memahami pilihan akad pembiayaan" }, { id: "risk", reason: "Persiapan sebelum melanjutkan pengajuan" });
    if (Object.values(state.assessment.shariaPractices).some(value => !value)) order.push({ id: "principles", reason: "Untuk meninjau praktik transaksi usaha" });
  }
  lessons.forEach(lesson => { if (!order.some(item => item.id === lesson.id)) order.push({ id: lesson.id, reason: "Bekal praktis untuk usaha Anda" }); });
  return order.map(item => ({ lesson: lessons.find(lesson => lesson.id === item.id)!, reason: item.reason })).sort((a,b) => Number(Boolean(state.learningProgress[a.lesson.id]?.completed)) - Number(Boolean(state.learningProgress[b.lesson.id]?.completed)));
}
