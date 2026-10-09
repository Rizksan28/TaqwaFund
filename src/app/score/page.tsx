"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, CheckCircle2, ChevronRight, ClipboardCheck, FileText, History, Info, Pencil, ShieldCheck, SlidersHorizontal, Store, Target, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { BusinessOnboarding } from "@/components/onboarding/business-onboarding";
import { Button, LinkButton } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { useDemoState } from "@/hooks/use-demo-state";
import { calculateTaqwaScore, getScorePriorities, indicatorWeights, simulateScore } from "@/lib/taqwa-score";
import { formatCurrencyIDR } from "@/lib/format";

function assessmentDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export default function ScorePage() {
  const { state } = useDemoState();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [hasDraft, setHasDraft] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"indicators" | "history">("indicators");

  useEffect(() => {
    try { setHasDraft(Boolean(localStorage.getItem("taqwafund-assessment-draft"))); } catch { /* Draft saving is optional. */ }
    setReady(true);
  }, [editing]);

  if (editing) return <BusinessOnboarding assessmentOnly onExit={() => setEditing(false)} />;
  if (!ready) return <div className="min-h-dvh w-full max-w-[390px] bg-mint" aria-label="Memuat TaqwaScore" />;

  const result = calculateTaqwaScore(state.assessment);
  const priorities = getScorePriorities(state.assessment);
  const simulation = simulateScore(state.assessment, priorities, selected);
  const latest = state.history.at(-1);
  const previous = state.history.at(-2);
  const difference = latest && previous ? latest.result.score - previous.result.score : null;
  const net = state.assessment.monthlyRevenue - state.assessment.monthlyExpense;
  const weakest = [...result.indicators].sort((a, b) => a.value - b.value)[0];

  if (!state.completedAssessment) return (
    <AppShell>
      <div className="flex items-center gap-2 text-xs font-semibold text-emeraldDark"><ChartNoAxesCombined className="h-4 w-4" />KESIAPAN USAHA</div>
      <h1 className="mt-3 text-[26px] font-bold leading-8">TaqwaScore</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Kenali kondisi usaha Anda sebelum mengambil langkah pembiayaan.</p>
      <section className="mt-5 border-y border-emeraldDark/15 py-6">
        <div className="flex items-center gap-5"><div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full border-[10px] border-[#bfe9de] bg-white"><ChartNoAxesCombined className="h-10 w-10 text-emeraldDark" /><span className="absolute -bottom-3 rounded-full bg-[#ffdea1] px-3 py-1 text-[10px] font-bold text-[#715300]">BELUM DINILAI</span></div><div><h2 className="text-lg font-bold leading-6">Seberapa siap<br />usaha Anda?</h2><p className="mt-2 text-xs leading-5 text-muted">Mulai dari data usaha yang Anda miliki.</p></div></div>
        <Button className="mt-7 w-full" onClick={() => setEditing(true)}><ClipboardCheck className="h-4 w-4" />{hasDraft ? "Lanjutkan Analisis" : "Mulai Analisis"}<ArrowRight className="h-4 w-4" /></Button>
      </section>
      <section className="py-6"><h2 className="text-base font-bold">Data yang Akan Dinilai</h2><div className="mt-3 divide-y divide-emeraldDark/10">{[
        { icon: Store, title: "Identitas usaha", detail: "Sektor, lama usaha, lokasi, dan tenaga kerja" },
        { icon: WalletCards, title: "Keuangan & kebutuhan dana", detail: "Omzet, biaya, pencatatan, dan rencana modal" },
        { icon: ShieldCheck, title: "Dokumen & praktik syariah", detail: "NIB, status halal, dan praktik usaha" }
      ].map(({ icon: Icon, title, detail }, i) => <div key={title} className="flex items-center gap-3 py-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${i === 1 ? "bg-[#fff0c2] text-[#795900]" : "bg-white text-emeraldDark"}`}><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-muted">{detail}</p></div></div>)}</div></section>
      <div className="flex items-start gap-2 border-t border-emeraldDark/10 py-4 text-xs leading-5 text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" /><p>Penilaian berdasarkan jawaban Anda. Tidak perlu menghubungkan rekening atau mengunggah dokumen untuk mulai.</p></div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-emeraldDark">KESIAPAN USAHA</p><h1 className="mt-2 text-[26px] font-bold">TaqwaScore</h1></div><button type="button" title="Perbarui data penilaian" aria-label="Perbarui Data" onClick={() => setEditing(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-emeraldDark/15 bg-white text-emeraldDark"><Pencil className="h-4 w-4" /></button></div>
      <p className="mt-1 break-words text-sm text-muted">{state.assessment.businessName}</p>
      <section className="-mx-4 mt-5 bg-emeraldDark px-5 py-6 text-white">
        <div className="flex items-center gap-5"><ScoreGauge score={result.score} status={result.status} size={132} dark compact /><div className="min-w-0"><p className="text-xs text-[#c7f5e6]">Kesiapan Saat Ini</p><h2 className="mt-2 text-lg font-bold leading-6">{result.status}</h2>{difference !== null && <p className="mt-2 flex items-center gap-1 text-xs text-[#ffdea1]"><ArrowUpRight className="h-4 w-4" />{difference > 0 ? "+" : ""}{difference} poin dari penilaian sebelumnya</p>}</div></div>
        <div className="mt-5 border-t border-white/20 pt-4"><p className="text-[11px] text-[#c7f5e6]">{latest ? `Diperbarui ${assessmentDate(latest.assessedAt)} WIB` : "Penilaian sebelumnya belum memiliki tanggal tersimpan"}</p><p className="mt-2 text-xs text-[#c7f5e6]">Berdasarkan jawaban Anda · Belum diverifikasi</p></div>
      </section>
      <section className="border-b border-emeraldDark/15 py-5"><h2 className="text-base font-bold">Ringkasan Kondisi</h2><p className="mt-2 text-sm leading-6 text-muted">{result.score >= 80 ? "Indikator kesiapan Anda relatif kuat. Pertahankan pencatatan dan tinjau kebutuhan dana sebelum melanjutkan." : `Aspek dengan nilai terendah adalah ${weakest.label.toLowerCase()} (${weakest.value}/100). Mulai perbaikan dari kondisi yang paling perlu diperkuat.`}</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="border-l-2 border-emeraldDark pl-3"><p className="text-[11px] text-muted">Surplus Operasional</p><strong className={`mt-1 block text-sm ${net < 0 ? "text-red-700" : "text-emeraldDark"}`}>{formatCurrencyIDR(net)}</strong></div><div className="border-l-2 border-[#d9a62e] pl-3"><p className="text-[11px] text-muted">Kebutuhan Dana</p><strong className="mt-1 block text-sm">{formatCurrencyIDR(state.assessment.financingNeed)}</strong></div></div></section>

      <section className="py-5"><div className="flex items-center justify-between"><h2 className="text-base font-bold">Prioritas Perbaikan</h2><Target className="h-5 w-5 text-emeraldDark" /></div>{priorities.length ? <div className="mt-4 space-y-3">{priorities.map((item, i) => <article key={item.id} className="rounded-lg border border-emeraldDark/10 bg-white p-4"><div className="flex items-start gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fff0c2] text-xs font-bold text-[#795900]">{i + 1}</span><h3 className="text-sm font-bold leading-5">{item.title}</h3></div><p className="mt-2 text-xs leading-5 text-muted">{item.description}</p><a href="/planning" className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-emeraldDark">Buka Rencana Perbaikan<ChevronRight className="h-4 w-4" /></a></article>)}</div> : <p className="mt-3 text-sm leading-6 text-muted">Pertahankan kondisi yang sudah baik. Perbarui penilaian ketika kondisi usaha berubah.</p>}</section>

      {priorities.length > 0 && <section className="border-y border-emeraldDark/15 py-5"><h2 className="flex items-center gap-2 text-base font-bold"><SlidersHorizontal className="h-4 w-4 text-emeraldDark" />Simulasi Perbaikan</h2><p className="mt-2 text-xs leading-5 text-muted">Pilih perubahan untuk melihat perkiraan berdasarkan rumus yang sama. Data asli tetap tersimpan.</p><div className="mt-4 space-y-3">{priorities.map(item => <label key={item.id} className="flex cursor-pointer items-start gap-3 text-xs leading-5"><input type="checkbox" checked={selected.includes(item.id)} onChange={e => setSelected(current => e.target.checked ? [...current, item.id] : current.filter(id => id !== item.id))} className="mt-0.5 h-4 w-4 shrink-0 accent-[#075d46]" /><span className="flex-1">{item.title}</span><span className="shrink-0 font-bold text-emeraldDark">+{item.gain}</span></label>)}</div><div aria-live="polite" className="mt-5 flex items-center justify-between border-t border-emeraldDark/10 pt-4"><div><p className="text-xs text-muted">Perkiraan Skor</p><strong className="text-3xl text-emeraldDark">{simulation.score}<span className="ml-1 text-sm font-normal text-muted">/100</span></strong></div><span className="rounded-full bg-[#ffdea1] px-3 py-1 text-xs font-bold text-[#715300]">{simulation.score - result.score >= 0 ? "+" : ""}{simulation.score - result.score} poin</span></div><p className="mt-2 text-[11px] leading-5 text-muted">Tambahan tiap pilihan dihitung terpisah; gabungannya dihitung ulang. Hasil simulasi bukan jaminan kenaikan skor.</p></section>}

      <div role="tablist" aria-label="Detail TaqwaScore" className="mt-6 grid grid-cols-2 border-b border-emeraldDark/15">{([{ value: "indicators", label: "Rincian Indikator", icon: ChartNoAxesCombined }, { value: "history", label: "Riwayat", icon: History }] as const).map(item => <button key={item.value} id={`tab-${item.value}`} type="button" role="tab" aria-selected={tab === item.value} aria-controls={`panel-${item.value}`} onClick={() => setTab(item.value)} className={`flex min-h-12 items-center justify-center gap-2 border-b-2 px-1 text-xs font-bold ${tab === item.value ? "border-emeraldDark text-emeraldDark" : "border-transparent text-muted"}`}><item.icon className="h-4 w-4" />{item.label}</button>)}</div>
      {tab === "indicators" ? <section id="panel-indicators" role="tabpanel" aria-labelledby="tab-indicators" className="divide-y divide-emeraldDark/10">{result.indicators.map(item => <details key={item.key} className="py-4"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{item.label}</h3><span className="flex items-center gap-2"><strong className={item.value < 70 ? "text-[#795900]" : "text-emeraldDark"}>{item.value}<span className="text-[10px] font-normal text-muted">/100</span></strong><ChevronRight className="h-3.5 w-3.5 text-muted" /></span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#c5eae1]"><div className={`h-full rounded-full ${item.value < 70 ? "bg-[#d9a62e]" : "bg-emeraldDark"}`} style={{width:`${item.value}%`}} /></div></summary><p className="mt-3 text-xs leading-5 text-muted">{item.description}</p><p className="mt-2 text-[11px] text-emeraldDark">Bobot {indicatorWeights[item.key]}% dari skor dasar</p></details>)}</section> : <section id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="py-4">{state.history.length ? <ol className="divide-y divide-emeraldDark/10">{[...state.history].reverse().map((entry, i, entries) => { const older = entries[i + 1]; const delta = older ? entry.result.score - older.result.score : null; return <li key={entry.id} className="py-4"><div className="flex items-center justify-between gap-3"><time dateTime={entry.assessedAt} className="text-xs text-muted">{assessmentDate(entry.assessedAt)} WIB</time><strong className="text-lg text-emeraldDark">{entry.result.score}<span className="text-[10px] font-normal text-muted">/100</span></strong></div><p className="mt-1 text-xs font-semibold">{entry.result.status}{delta !== null ? ` · ${delta > 0 ? "+" : ""}${delta} poin` : ""}</p><p className="mt-2 text-xs leading-5 text-muted">{entry.changedFields.length ? `Data diperbarui: ${entry.changedFields.join(", ")}.` : older ? "Penilaian ulang dengan data yang sama." : "Awal riwayat penilaian tersimpan."}</p></li>; })}</ol> : <div className="py-5 text-center"><History className="mx-auto h-6 w-6 text-emeraldDark" /><p className="mt-3 text-sm font-semibold">Belum Ada Riwayat Tersimpan</p><p className="mt-2 text-xs leading-5 text-muted">Jalankan penilaian berikutnya untuk mulai mencatat perkembangan usaha Anda.</p></div>}</section>}

      <details className="border-t border-emeraldDark/15 py-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-bold"><FileText className="h-4 w-4 text-emeraldDark" />Bagaimana Skor Dihitung?</summary><p className="mt-3 text-xs leading-5 text-muted">Enam indikator dijumlahkan sesuai bobotnya. Satu poin dikurangi jika dana pribadi belum sepenuhnya dipisahkan, dan satu poin jika cadangan kurang dari satu bulan. Skor dibulatkan ke rentang 0–100.</p><p className="mt-2 text-xs leading-5 text-muted">Rumus ini merupakan model penilaian prototipe, bukan model kredit yang telah divalidasi atau sertifikasi syariah.</p></details>
      <details className="border-t border-emeraldDark/15 py-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4 text-emeraldDark" />Yang Sudah Baik</summary>{result.strengths.length ? <ul className="mt-3 space-y-3">{result.strengths.map(item => <li key={item} className="text-xs leading-5 text-muted">{item}</li>)}</ul> : <p className="mt-3 text-xs leading-5 text-muted">Belum ada indikator mencapai 70. Mulai dengan prioritas perbaikan di atas.</p>}</details>
      <section className="border-t border-emeraldDark/15 py-5"><h2 className="text-base font-bold">Data Penilaian</h2><div className="mt-3 flex items-center justify-between text-xs"><span>Kelengkapan Jawaban</span><strong className="text-emeraldDark">100%</strong></div><p className="mt-2 text-xs leading-5 text-muted">Jawaban lengkap tidak berarti dokumen telah diverifikasi. Data bersumber dari isian Anda.</p><Button variant="secondary" className="mt-4 w-full" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{hasDraft ? "Lanjutkan Pembaruan Data" : "Perbarui Data & Analisis Ulang"}</Button><LinkButton href="/planning" className="mt-3 w-full">Lihat Rencana Perbaikan<ArrowRight className="h-4 w-4" /></LinkButton></section>
      <p className="mb-3 flex items-start gap-2 text-[11px] leading-5 text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0" />TaqwaScore adalah indikator kesiapan, bukan jaminan persetujuan pembiayaan.</p>
    </AppShell>
  );
}
