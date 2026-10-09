"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, ChartNoAxesCombined, CheckCircle2, ChevronRight, ClipboardList, Clock3, FilePenLine, ListChecks, Play, ShieldCheck, SlidersHorizontal, Target } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { useDemoState } from "@/hooks/use-demo-state";
import { getScorePriorities, simulateScore } from "@/lib/taqwa-score";
import { jakartaDay, normalizePlanningTask, planningReason, taskDeadline, updatePlanningTask } from "@/lib/planning";
import type { PlanningTask } from "@/lib/planning";

type Filter = "priority" | "active" | "done";
const filters = [{ key: "priority", label: "Prioritas" }, { key: "active", label: "Dikerjakan" }, { key: "done", label: "Selesai" }] as const;
const statusLabels = { "Belum Dimulai": "Belum dimulai", "Sedang Berjalan": "Dikerjakan", "Selesai": "Selesai" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${value}T12:00:00+07:00`));
}

function Deadline({ task }: { task: PlanningTask }) {
  const deadline = taskDeadline(task);
  return <span className={`flex items-center gap-1.5 text-[11px] ${deadline === "overdue" ? "text-red-700" : deadline === "today" ? "text-[#795900]" : "text-muted"}`}><CalendarDays className="h-3.5 w-3.5 shrink-0" />{deadline === "overdue" ? "Lewat target · " : deadline === "today" ? "Hari ini · " : ""}{task.dueDate ? formatDate(task.dueDate) : "Belum ada target"}</span>;
}

export default function PlanningPage() {
  const { state, setState } = useDemoState();
  const [filter, setFilter] = useState<Filter>("priority");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simulationSelection, setSimulationSelection] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const tasks = state.tasks.map(normalizePlanningTask);
  const selectedTask = tasks.find(task => task.id === selectedId);
  const completed = tasks.filter(task => task.status === "Selesai").length;
  const active = tasks.filter(task => task.status === "Sedang Berjalan").length;
  const overdue = tasks.filter(task => taskDeadline(task) === "overdue").length;
  const progress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0;
  const priorities = getScorePriorities(state.assessment);
  const potential = simulateScore(state.assessment, priorities, simulationSelection);
  const pendingTasks = tasks.filter(task => task.status !== "Selesai");
  const nextTask = [...pendingTasks].sort((a, b) => {
    const rank = (task: PlanningTask) => taskDeadline(task) === "overdue" ? 0 : taskDeadline(task) === "today" ? 1 : task.status === "Sedang Berjalan" ? 2 : 3;
    return rank(a) - rank(b);
  })[0];
  const filtered = tasks.filter(task => filter === "priority" ? task.status !== "Selesai" : filter === "active" ? task.status === "Sedang Berjalan" : task.status === "Selesai");

  function openTask(id: string) { setSelectedId(id); setError(""); window.scrollTo({ top: 0 }); }
  function closeTask() { setSelectedId(null); setError(""); window.scrollTo({ top: 0 }); }
  function saveTask(id: string, patch: Parameters<typeof updatePlanningTask>[2]) {
    try { setState(updatePlanningTask(state, id, patch)); setError(""); }
    catch { setError("Perubahan belum tersimpan. Izinkan penyimpanan browser lalu coba lagi."); }
  }

  if (!ready) return <div className="min-h-dvh w-full max-w-[390px] bg-mint" aria-label="Memuat Planning" />;

  if (selectedTask) {
    const task = selectedTask;
    const reason = planningReason(task, state.assessment);
    const doneSteps = task.steps.filter(step => step.completed).length;
    return (
      <AppShell hideNavigation>
        <div className="flex items-center justify-between"><button type="button" aria-label="Kembali ke Planning" title="Kembali ke Planning" onClick={closeTask} className="grid h-11 w-11 place-items-center rounded-lg border border-emeraldDark/15 bg-white text-emeraldDark"><ArrowLeft className="h-5 w-5" /></button><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${task.status === "Selesai" ? "bg-[#d0f6ed] text-emeraldDark" : task.status === "Sedang Berjalan" ? "bg-[#fff0c2] text-[#795900]" : "bg-white text-muted"}`}>{statusLabels[task.status]}</span></div>
        <p className="mt-5 text-[11px] font-bold text-emeraldDark">RENCANA PERBAIKAN</p>
        <h1 className="mt-2 break-words text-[24px] font-bold leading-8">{task.title}</h1>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted"><Target className="h-4 w-4 text-emeraldDark" />{reason.indicator}</div>

        <section className="mt-5 border-y border-emeraldDark/15 py-5"><h2 className="text-sm font-bold">Mengapa Ini Menjadi Prioritas?</h2><p className="mt-2 text-sm leading-6 text-muted">{reason.reason}</p></section>

        <section className="py-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-bold"><ListChecks className="h-5 w-5 text-emeraldDark" />Langkah Pengerjaan</h2><span className="text-xs font-semibold text-emeraldDark">{doneSteps}/{task.steps.length}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#c5eae1]"><div className="h-full rounded-full bg-emeraldDark transition-all" style={{ width: `${doneSteps / task.steps.length * 100}%` }} /></div>
          <div className="mt-4 divide-y divide-emeraldDark/10">{task.steps.map((step, index) => <label key={step.id} className="flex min-h-16 cursor-pointer items-start gap-3 py-4"><input type="checkbox" checked={step.completed} onChange={event => saveTask(task.id, { steps: task.steps.map(item => item.id === step.id ? { ...item, completed: event.target.checked } : item) })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#075d46]" /><span className={`min-w-0 text-sm leading-5 ${step.completed ? "text-muted line-through" : "text-ink"}`}><span className="mb-1 block text-[10px] font-bold text-muted">LANGKAH {index + 1}</span>{step.title}</span></label>)}</div>
          {task.status === "Belum Dimulai" && <Button className="mt-3 w-full" onClick={() => saveTask(task.id, { status: "Sedang Berjalan" })}><Play className="h-4 w-4" />Mulai Kerjakan</Button>}
          {task.status === "Selesai" && <div role="status" className="mt-3 flex items-start gap-3 border-l-4 border-emeraldDark bg-[#d0f6ed] p-4"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emeraldDark" /><div><p className="text-sm font-bold text-emeraldDark">Semua langkah telah selesai</p><p className="mt-1 text-xs leading-5 text-muted">Perbarui data usaha untuk mengukur dampak perbaikan ini.</p></div></div>}
        </section>

        <section className="border-t border-emeraldDark/15 py-5"><label htmlFor="task-deadline" className="flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4 text-emeraldDark" />Target Penyelesaian</label><div className="mt-3 flex gap-2"><input id="task-deadline" type="date" value={task.dueDate} onInput={event => saveTask(task.id, { dueDate: event.currentTarget.value })} className="min-h-12 min-w-0 flex-1 rounded-lg border border-emeraldDark/20 bg-white px-3 text-sm outline-none focus:border-emeraldDark" />{task.dueDate && <button type="button" onClick={() => saveTask(task.id, { dueDate: "" })} className="min-h-12 px-2 text-xs font-semibold text-muted">Hapus Target</button>}</div><div className="mt-3"><Deadline task={task} /></div></section>

        <section className="border-t border-emeraldDark/15 py-5"><label htmlFor="task-notes" className="flex items-center gap-2 text-sm font-bold"><FilePenLine className="h-4 w-4 text-emeraldDark" />Catatan Hasil</label><textarea id="task-notes" value={task.notes} maxLength={1500} onChange={event => saveTask(task.id, { notes: event.target.value })} placeholder="Contoh: Transaksi minggu ini sudah dicatat dan dicocokkan dengan saldo." rows={5} className="mt-3 min-h-32 w-full resize-y rounded-lg border border-emeraldDark/20 bg-white p-3 text-sm leading-6 outline-none focus:border-emeraldDark" /><div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted"><span aria-live="polite">{error ? "Belum tersimpan" : task.updatedAt ? "Perubahan tersimpan di perangkat" : "Catatan disimpan di perangkat"}</span><span>{task.notes.length}/1500</span></div></section>

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {task.completedAt && <p className="mb-4 text-xs text-muted">Selesai pada {formatDate(jakartaDay(new Date(task.completedAt)))}</p>}
        <LinkButton href="/assessment" className="w-full"><ChartNoAxesCombined className="h-4 w-4" />Perbarui Data & Hitung Ulang<ArrowRight className="h-4 w-4" /></LinkButton>
        <p className="mt-3 text-[11px] leading-5 text-muted">Progres tugas tidak otomatis mengubah TaqwaScore. Skor dihitung dari jawaban pada penilaian terbaru.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <p className="flex items-center gap-2 text-[11px] font-bold text-emeraldDark"><ClipboardList className="h-4 w-4" />LANGKAH UNTUK USAHA ANDA</p>
      <h1 className="mt-3 text-[26px] font-bold leading-8">Planning Usaha</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{state.completedAssessment ? "Kerjakan prioritas, catat hasil, dan pantau perkembangan usaha." : "Mulai dari penilaian kondisi usaha untuk menyusun prioritas perbaikan."}</p>

      {!state.completedAssessment ? <section className="mt-6 border-y border-emeraldDark/15 py-6"><Target className="h-8 w-8 text-emeraldDark" /><h2 className="mt-4 text-lg font-bold">Rencana Anda Dimulai dari Data</h2><p className="mt-2 text-sm leading-6 text-muted">Belum ada penilaian yang selesai. Isi kondisi usaha terlebih dahulu agar rencana perbaikan sesuai kebutuhan Anda.</p><LinkButton href="/assessment" className="mt-5 w-full">Mulai Penilaian<ArrowRight className="h-4 w-4" /></LinkButton></section> : <>
        <section className="-mx-4 mt-5 border-y border-emeraldDark/10 bg-white px-5 py-5"><div className="flex items-center gap-4"><div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full" style={{background:`conic-gradient(#075d46 ${progress * 3.6}deg, #d6efe6 0deg)`}}><div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-white"><span className="text-xl font-bold text-emeraldDark">{progress}%</span></div></div><div className="min-w-0"><p className="text-[11px] font-semibold text-muted">PROGRES RENCANA</p><h2 className="mt-1 text-lg font-bold">{completed} dari {tasks.length} tugas selesai</h2><p className="mt-1 text-xs text-muted">{tasks.length ? `${tasks.length - completed} tugas tersisa` : "Tidak ada prioritas aktif"}</p></div></div><div className="mt-5 grid grid-cols-3 divide-x divide-emeraldDark/10 border-t border-emeraldDark/10 pt-4"><div className="text-center"><strong className="text-lg text-emeraldDark">{active}</strong><p className="mt-1 text-[10px] text-muted">Dikerjakan</p></div><div className="text-center"><strong className={overdue ? "text-lg text-red-700" : "text-lg text-ink"}>{overdue}</strong><p className="mt-1 text-[10px] text-muted">Lewat Target</p></div><div className="text-center"><strong className="text-lg text-[#795900]">{state.score.score}</strong><p className="mt-1 text-[10px] text-muted">TaqwaScore</p></div></div></section>

        {nextTask && <section className="my-5 border-l-4 border-[#d9a62e] py-1 pl-4"><p className="flex items-center gap-1.5 text-[10px] font-bold text-[#795900]"><Target className="h-3.5 w-3.5" />LANGKAH BERIKUTNYA</p><h2 className="mt-2 text-sm font-bold leading-5">{nextTask.title}</h2><button type="button" onClick={() => openTask(nextTask.id)} className="mt-1 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-emeraldDark">{nextTask.status === "Sedang Berjalan" ? "Lanjutkan Pengerjaan" : "Lihat Langkah Pengerjaan"}<ArrowRight className="h-4 w-4" /></button></section>}
        {tasks.length > 0 && completed === tasks.length && <section className="my-5 border-l-4 border-emeraldDark py-1 pl-4"><p className="flex items-center gap-2 text-sm font-bold text-emeraldDark"><CheckCircle2 className="h-5 w-5" />Seluruh rencana telah selesai</p><p className="mt-2 text-xs leading-5 text-muted">Perbarui data untuk melihat perubahan kesiapan usaha.</p><LinkButton href="/assessment" className="mt-3 w-full">Hitung Ulang TaqwaScore<ArrowRight className="h-4 w-4" /></LinkButton></section>}

        <div role="tablist" aria-label="Status rencana" className="mt-5 grid grid-cols-3 border-b border-emeraldDark/15">{filters.map(item => <button key={item.key} id={`tab-${item.key}`} role="tab" type="button" aria-selected={filter === item.key} aria-controls="planning-task-list" onClick={() => setFilter(item.key)} className={`flex min-h-12 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-bold ${filter === item.key ? "border-emeraldDark text-emeraldDark" : "border-transparent text-muted"}`}>{item.label}<span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px]">{item.key === "priority" ? pendingTasks.length : item.key === "active" ? active : completed}</span></button>)}</div>
        <section id="planning-task-list" role="tabpanel" aria-labelledby={`tab-${filter}`} className="py-4">
          {filtered.length ? <div className="space-y-3">{filtered.map(task => { const taskIndex = tasks.findIndex(item => item.id === task.id); const reason = planningReason(task, state.assessment); const done = task.status === "Selesai"; const stepsDone = task.steps.filter(step => step.completed).length; return <article key={task.id} className="rounded-lg border border-emeraldDark/10 bg-white p-4"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-[#795900]">PRIORITAS {taskIndex + 1}</span><span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${done ? "text-emeraldDark" : "text-muted"}`}>{done ? <CheckCircle2 className="h-3.5 w-3.5" /> : task.status === "Sedang Berjalan" ? <Clock3 className="h-3.5 w-3.5" /> : null}{statusLabels[task.status]}</span></div><h3 className="mt-3 break-words text-base font-bold leading-6"><button type="button" onClick={() => openTask(task.id)} className="text-left">{task.title}</button></h3><p className="mt-2 text-xs text-muted">{reason.indicator}</p><div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#d6efe6]"><div className="h-full rounded-full bg-emeraldDark" style={{width:`${task.progress}%`}} /></div><span className="text-[10px] font-semibold text-muted">{stepsDone}/{task.steps.length} langkah</span></div><div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><Deadline task={task} /><button type="button" onClick={() => openTask(task.id)} aria-label={`Buka tugas: ${task.title}`} className="flex min-h-11 items-center gap-1 text-xs font-bold text-emeraldDark">{done ? "Lihat Hasil" : "Buka Tugas"}<ChevronRight className="h-4 w-4" /></button></div>{task.notes && <p className="mt-2 line-clamp-2 border-t border-emeraldDark/10 pt-3 text-xs leading-5 text-muted">{task.notes}</p>}</article>; })}</div> : <div className="py-8 text-center"><ListChecks className="mx-auto h-7 w-7 text-emeraldDark" /><h2 className="mt-3 text-sm font-bold">{filter === "active" ? "Belum Ada Tugas Dikerjakan" : filter === "done" ? "Belum Ada Tugas Selesai" : "Tidak Ada Prioritas Tersisa"}</h2><p className="mx-auto mt-2 max-w-[270px] text-xs leading-5 text-muted">{filter === "active" ? "Tugas yang mulai dikerjakan akan tampil di sini." : filter === "done" ? "Tugas dengan semua langkah selesai akan tampil di sini." : tasks.length ? "Lihat hasil pekerjaan di tab Selesai atau perbarui penilaian." : "Pertahankan kondisi usaha dan perbarui penilaian saat data berubah."}</p>{filter !== "priority" && pendingTasks.length > 0 && <Button variant="ghost" className="mt-3" onClick={() => setFilter("priority")}>Lihat Prioritas<ArrowRight className="h-4 w-4" /></Button>}</div>}
        </section>

        {priorities.length > 0 && <details className="border-y border-emeraldDark/15 py-4"><summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold"><span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-emeraldDark" />Simulasi Perbaikan</span><ChevronRight className="h-4 w-4 text-muted" /></summary><p className="mt-3 text-xs leading-5 text-muted">Pilih perubahan data untuk melihat perkiraan dari model penilaian yang sama.</p><div className="mt-4 space-y-3">{priorities.map(item => <label key={item.id} className="flex cursor-pointer items-start gap-3 text-xs leading-5"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#075d46]" checked={simulationSelection.includes(item.id)} onChange={event => setSimulationSelection(current => event.target.checked ? [...current, item.id] : current.filter(id => id !== item.id))} /><span>{item.title}</span></label>)}</div><div aria-live="polite" className="mt-4 flex items-end justify-between border-t border-emeraldDark/10 pt-4"><div><p className="text-[11px] text-muted">Skor Saat Ini</p><strong className="text-2xl">{state.score.score}</strong></div><ArrowRight className="mb-1 h-5 w-5 text-muted" /><div className="text-right"><p className="text-[11px] text-muted">Perkiraan</p><strong className="text-2xl text-emeraldDark">{potential.score}</strong></div></div><p className="mt-3 text-[11px] leading-5 text-muted">Simulasi tidak mengubah jawaban atau skor aktual, dan bukan jaminan hasil pembiayaan.</p></details>}
        <section className="py-5"><LinkButton href="/assessment" className="w-full"><ChartNoAxesCombined className="h-4 w-4" />Perbarui Data & Hitung Ulang</LinkButton><LinkButton href="/score" variant="ghost" className="mt-2 w-full">Lihat TaqwaScore<ArrowRight className="h-4 w-4" /></LinkButton></section>
      </>}
      <p className="mb-3 flex items-start gap-2 text-[11px] leading-5 text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" />Rencana, tenggat, dan catatan tersimpan di perangkat ini.</p>
    </AppShell>
  );
}
