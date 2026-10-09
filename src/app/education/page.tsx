"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Clock3, ExternalLink, RotateCcw, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { lessons, learningCategories } from "@/data/learning";
import { checkLessonQuiz, finishLesson, learningPercent, lessonProgress, openLessonSection, recommendedLessons, updateLesson } from "@/lib/learning";
import { useDemoState } from "@/hooks/use-demo-state";

function EducationContent() {
  const { state, setState } = useDemoState();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const lesson = lessons.find(item => item.id === lessonId);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [status, setStatus] = useState("Semua progres");
  useEffect(() => setReady(true), []);
  const progress = lesson ? lessonProgress(state, lesson) : null;

  useEffect(() => {
    if (!ready || !lesson || !progress || progress.section >= lesson.sections.length || progress.readSections.includes(progress.section)) return;
    try { setState(openLessonSection(state, lesson.id, progress.section)); }
    catch { setError("Progres belum tersimpan. Izinkan penyimpanan browser lalu coba lagi."); }
  }, [ready, lesson, progress, state, setState]);

  function save(next: typeof state) {
    try { setState(next); setError(""); return true; }
    catch { setError("Progres belum tersimpan. Izinkan penyimpanan browser lalu coba lagi."); return false; }
  }
  function move(section: number) {
    if (lesson && save(openLessonSection(state,lesson.id,section))) window.scrollTo({top:0});
  }

  if (!ready) return <div className="min-h-dvh w-full max-w-[390px] bg-mint" aria-label="Memuat TaqwaLearn" />;
  const alert = error && <p role="alert" className="my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>;

  if (lessonId && !lesson) return <AppShell><h1 className="text-xl font-bold">Materi Tidak Ditemukan</h1><LinkButton href="/education" className="mt-4">Kembali ke TaqwaLearn</LinkButton></AppShell>;

  if (lesson && progress) {
    const section = lesson.sections[progress.section];
    const correctCount = lesson.questions.filter((question,index)=>question.correct===progress.answers[index]).length;
    const canFinish = progress.checked && correctCount===lesson.questions.length && progress.readSections.length===lesson.sections.length;
    return <AppShell hideNavigation>
      <div className="flex items-center justify-between gap-3"><Link href="/education" aria-label="Kembali ke TaqwaLearn" className="grid h-11 w-11 place-items-center rounded-lg border border-emeraldDark/15 bg-white text-emeraldDark"><ArrowLeft className="h-5 w-5" /></Link><span className="text-xs font-semibold text-emeraldDark">{section ? `Bacaan ${progress.section+1}/${lesson.sections.length}` : "Kuis Singkat"}</span></div>
      <p className="mt-5 text-[11px] font-bold text-[#795900]">{lesson.category}</p><h1 className="mt-2 text-[24px] font-bold leading-8">{lesson.title}</h1><p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Clock3 className="h-3.5 w-3.5" />{lesson.minutes} menit termasuk kuis</p><div className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Progres belajar">{[0,1,2,3].map(index=><span key={index} className={`h-1.5 rounded-full ${index===3 ? progress.completed ? "bg-emeraldDark" : "bg-[#d9a62e]" : progress.readSections.includes(index) ? "bg-emeraldDark" : "bg-[#c5eae1]"}`} />)}</div>
      {section ? <>
        <section className="py-6"><h2 className="text-lg font-bold">{section.title}</h2><p className="mt-3 text-sm leading-7 text-muted">{section.body}</p><div className="mt-5 border-l-4 border-[#d9a62e] bg-white p-4"><p className="text-[10px] font-bold text-[#795900]">CONTOH USAHA</p><p className="mt-2 text-sm leading-6">{section.example}</p></div><h3 className="mt-5 text-sm font-bold text-emeraldDark">Langkah Praktis</h3><p className="mt-2 text-sm leading-6 text-muted">{section.action}</p></section>{alert}<div className="flex gap-3"><Button variant="secondary" disabled={progress.section===0} onClick={()=>move(progress.section-1)} aria-label="Bacaan sebelumnya"><ArrowLeft className="h-4 w-4" /></Button><Button className="flex-1" onClick={()=>move(progress.section+1)}>{progress.section===lesson.sections.length-1 ? "Mulai Kuis" : "Lanjutkan Bacaan"}<ArrowRight className="h-4 w-4" /></Button></div>
      </> : <section className="py-6"><h2 className="text-lg font-bold">Uji Pemahaman Anda</h2><p className="mt-2 text-xs leading-5 text-muted">{lesson.questions.length} pertanyaan · dapat diulang</p><div className="mt-5 space-y-6">{lesson.questions.map((question,index)=><fieldset key={question.prompt}><legend className="text-sm font-bold leading-6">{index+1}. {question.prompt}</legend><div className="mt-3 space-y-2">{question.options.map((option,choice)=><label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm leading-5 ${progress.answers[index]===choice ? "border-emeraldDark bg-white" : "border-emeraldDark/15"}`}><input type="radio" name={`question-${index}`} checked={progress.answers[index]===choice} disabled={progress.checked} onChange={()=>save(updateLesson(state,lesson.id,{answers:progress.answers.map((answer,i)=>i===index ? choice : answer),checked:false}))} className="mt-0.5 h-4 w-4 shrink-0 accent-[#075d46]" /><span>{option}</span></label>)}</div>{progress.checked && <p className={`mt-3 border-l-2 pl-3 text-xs leading-5 ${progress.answers[index]===question.correct ? "border-emeraldDark text-emeraldDark" : "border-[#d9a62e] text-[#795900]"}`}>{progress.answers[index]===question.correct ? "Benar. " : `Jawaban yang tepat: ${question.options[question.correct]}. `}{question.explanation}</p>}</fieldset>)}</div>{alert}
        {!progress.checked ? <Button className="mt-6 w-full" onClick={()=>{try{save(checkLessonQuiz(state,lesson.id));}catch(cause){setError(cause instanceof Error ? cause.message : "Periksa jawaban Anda.");}}}>Periksa Jawaban<ArrowRight className="h-4 w-4" /></Button> : <><p role="status" className="mt-5 text-sm font-bold text-emeraldDark">{correctCount}/{lesson.questions.length} jawaban benar · Nilai terbaik {progress.bestScore}%</p>{canFinish && !progress.completed && <Button className="mt-4 w-full" onClick={()=>{try{save(finishLesson(state,lesson.id));}catch(cause){setError(cause instanceof Error ? cause.message : "Materi belum selesai.");}}}><CheckCircle2 className="h-4 w-4" />Selesaikan Materi</Button>}{progress.completed && <div className="mt-4 border-l-4 border-emeraldDark bg-white p-4"><p className="flex items-center gap-2 text-sm font-bold text-emeraldDark"><CheckCircle2 className="h-4 w-4" />Materi Selesai</p><p className="mt-2 text-xs leading-5 text-muted">Progres belajar tercatat. Terapkan langkah praktis pada usaha Anda; TaqwaScore berubah melalui penilaian ulang.</p><LinkButton href="/planning" variant="secondary" className="mt-3 w-full">Buka Planning<ArrowRight className="h-4 w-4" /></LinkButton></div>}<Button variant="secondary" className="mt-3 w-full" onClick={()=>save(updateLesson(state,lesson.id,{answers:lesson.questions.map(()=>null),checked:false}))}><RotateCcw className="h-4 w-4" />Ulangi Kuis</Button></>}
        <Button variant="ghost" className="mt-3 w-full" onClick={()=>move(lesson.sections.length-1)}>Baca Kembali</Button>
      </section>}
      <details className="mt-5 border-t border-emeraldDark/15 py-4"><summary className="cursor-pointer text-xs font-semibold text-emeraldDark">Rujukan & Status Materi</summary><a href={lesson.source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-start gap-2 text-xs leading-5 text-emeraldDark underline">{lesson.source.title}<ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /></a><p className="mt-2 text-[11px] leading-5 text-muted">Rujukan diperiksa 9 Oktober 2026. Ringkasan dan contoh disusun untuk edukasi; belum ditinjau ahli syariah. Bukan fatwa, sertifikasi, atau keputusan pembiayaan.</p></details>
    </AppShell>;
  }

  const recommended = recommendedLessons(state)[0];
  const finished = lessons.filter(item=>state.learningProgress[item.id]?.completed).length;
  const filtered = lessons.filter(item=>{
    const progress=lessonProgress(state,item);
    return (category==="Semua"||item.category===category) && `${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase()) && (status==="Semua progres" || status==="Selesai"&&progress.completed || status==="Sedang belajar"&&!progress.completed&&progress.readSections.length>0 || status==="Belum dibaca"&&!progress.completed&&progress.readSections.length===0);
  });
  return <AppShell>
    <p className="flex items-center gap-2 text-[11px] font-bold text-emeraldDark"><BookOpen className="h-4 w-4" />EDUKASI KEUANGAN SYARIAH</p><h1 className="mt-3 text-[26px] font-bold">TaqwaLearn</h1><p className="mt-2 text-sm leading-6 text-muted">Bekal praktis untuk mengelola usaha, memahami akad, dan meninjau risiko.</p>
    <div className="mt-5 flex items-center justify-between border-y border-emeraldDark/15 py-4"><span className="text-xs text-muted">Progres belajar</span><strong className="text-sm text-emeraldDark">{finished}/{lessons.length} materi selesai</strong></div>
    <Link href={`/education?lesson=${recommended.lesson.id}`} className="mt-5 block border-l-4 border-[#d9a62e] pl-4"><span className="text-[10px] font-bold text-[#795900]">UNTUK USAHA ANDA</span><h2 className="mt-2 text-base font-bold leading-6">{recommended.lesson.title}</h2><p className="mt-2 text-xs leading-5 text-muted">{recommended.reason}</p><span className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-emeraldDark">{state.learningProgress[recommended.lesson.id]?.completed ? "Baca Kembali" : "Mulai / Lanjutkan Belajar"}<ArrowRight className="h-4 w-4" /></span></Link>
    <div className="mt-5"><label htmlFor="lesson-search" className="sr-only">Cari materi</label><div className="flex items-center gap-2 rounded-lg border border-emeraldDark/20 bg-white px-3"><Search className="h-4 w-4 shrink-0 text-muted" /><input id="lesson-search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari materi…" className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[10px] font-semibold text-muted">Kategori<select value={category} onChange={event=>setCategory(event.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-emeraldDark/15 bg-white px-2 text-xs text-ink"><option>Semua</option>{learningCategories.map(value=><option key={value}>{value}</option>)}</select></label><label className="text-[10px] font-semibold text-muted">Progres<select value={status} onChange={event=>setStatus(event.target.value)} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-emeraldDark/15 bg-white px-2 text-xs text-ink">{["Semua progres","Belum dibaca","Sedang belajar","Selesai"].map(value=><option key={value}>{value}</option>)}</select></label></div></div>
    <section className="mt-5 space-y-3">{filtered.map(item=>{const progress=lessonProgress(state,item);return <Link key={item.id} href={`/education?lesson=${item.id}`} className="block rounded-lg border border-emeraldDark/10 bg-white p-4"><div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-bold text-[#795900]">{item.category}</span><span className="flex items-center gap-1 text-muted"><Clock3 className="h-3.5 w-3.5" />{item.minutes} menit</span></div><h2 className="mt-3 text-base font-bold leading-6">{item.title}</h2><p className="mt-2 text-xs leading-5 text-muted">{item.summary}</p><div className="mt-4 flex items-center justify-between text-[11px]"><span className="font-semibold text-emeraldDark">{progress.completed ? "Selesai" : progress.readSections.length ? "Sedang belajar" : "Belum dibaca"}</span><ChevronRight className="h-4 w-4 text-emeraldDark" /></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-[#d6efe6]"><div className="h-full bg-emeraldDark" style={{width:`${learningPercent(progress,item)}%`}} /></div></Link>;})}{!filtered.length && <div className="py-8 text-center"><p className="text-sm font-semibold">Tidak Ada Materi yang Cocok</p><Button variant="ghost" className="mt-3" onClick={()=>{setQuery("");setCategory("Semua");setStatus("Semua progres");}}>Reset Filter</Button></div>}</section>{alert}
  </AppShell>;
}

export default function EducationPage() {
  return <Suspense fallback={<div className="min-h-dvh w-full max-w-[390px] bg-mint" />}><EducationContent /></Suspense>;
}
