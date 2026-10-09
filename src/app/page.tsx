"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronRight, HandCoins, Info, Lightbulb, LockKeyhole, Route, Sparkles, TrendingUp, Utensils, WalletCards } from "lucide-react";
import { TaqwaLearnSection } from "@/components/ui/taqwa-learn-section";
import { AppShell } from "@/components/layout/app-shell";
import { LinkButton } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { useDemoState } from "@/hooks/use-demo-state";
import { formatCurrencyIDR } from "@/lib/format";

const journey = [
  { label: "Nilai", note: "Selesai", icon: Check, state: "done" },
  { label: "Tingkatkan", note: "Sedang aktif", icon: TrendingUp, state: "active" },
  { label: "Temukan", note: "BPRS / Bank Syariah", icon: HandCoins, state: "next" },
  { label: "Tumbuh", note: "Ekspansi", icon: Sparkles, state: "next" }
];

export default function HomePage() {
  const { state } = useDemoState();
  const revenue = state.assessment.monthlyRevenue;
  const expense = state.assessment.monthlyExpense;
  const profit = revenue - expense;
  const primaryIndicators = state.score.indicators.slice(0, 4);

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emeraldBrand via-emeraldDark to-[#133630] p-5 text-white shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rotate-45 rounded-[2rem] border-[18px] border-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#8cd5b8]"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/15"><Sparkles className="h-4 w-4" /></span>Ahlan wa Sahlan <span className="text-xs font-normal text-white/55">· Sertifikasi Halal Aktif</span></div>
          <h1 className="mt-5 text-[24px] font-black leading-8">Assalamu&apos;alaikum, Bu Aisyah!</h1><p className="mt-1 text-sm leading-6 text-[#8cd5b8]">Rumah Kue Aisyah · Usaha Kuliner &amp; Bakery</p>
          <div className="mt-5 rounded-xl bg-white/10 p-4 backdrop-blur"><p className="text-xs font-semibold text-white/75">Kesiapan Finansial</p><div className="mt-1 flex items-end justify-between gap-3"><strong className="text-lg text-[#ffdea1]">{state.score.status}</strong><div className="text-right"><strong className="text-2xl text-[#ffdea1]">{state.score.score}</strong><span className="text-xs text-white/60"> /100</span></div></div></div>
        </div>
      </section>

      <TaqwaLearnSection state={state} />

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-card"><div className="mb-5 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Route className="h-5 w-5 text-emeraldDark" /><span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Jalur Kesiapan Modal</span></div><span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-emeraldDark">Tahap 2 dari 4</span></div><div className="grid grid-cols-4 gap-1">{journey.map((step) => { const Icon = step.icon; const active = step.state === "active"; return <div key={step.label} className={`text-center ${step.state === "next" ? "opacity-55" : ""}`}><div className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${active ? "bg-gold text-ink ring-4 ring-[#ffdea1]/50" : step.state === "done" ? "bg-emeraldDark text-white" : "bg-[#d0f6ed] text-muted"}`}><Icon className="h-4 w-4" /></div><p className={`mt-2 text-[11px] font-bold ${active ? "text-[#806000]" : "text-ink"}`}>{step.label}</p><p className="mt-0.5 text-[11px] leading-4 text-muted">{step.note}</p></div>; })}</div><div className="mt-5 flex items-start gap-2 rounded-xl bg-mint p-3 text-[13px] leading-5 text-muted"><Info className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" /><p>Langkah Anda saat ini: <strong className="text-ink">Perbaikan indikator keuangan</strong> agar siap dihubungkan ke mitra syariah.</p></div></section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-soft"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Diagnostik Mandiri</p><h2 className="mt-1 text-xl font-black">TaqwaScore Usaha</h2></div><span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-emeraldDark">Dari data usaha</span></div><div className="mt-5 flex items-center gap-4 rounded-xl bg-mint p-4"><ScoreGauge score={state.score.score} status={state.score.status} size={112} compact /><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wide text-emeraldDark">Status kesiapan</p><p className="mt-1 text-lg font-black leading-6">{state.score.status}</p><p className="mt-2 text-[13px] leading-5 text-muted">Tingkatkan beberapa indikator untuk mendekati zona siap pembiayaan.</p></div></div><div className="mt-5 space-y-4">{primaryIndicators.map((indicator) => <div key={indicator.key}><div className="flex items-center justify-between gap-2 text-[13px]"><span className="font-semibold text-ink">{indicator.label}</span><strong className="shrink-0 text-emeraldDark">{indicator.value}/100</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#c5eae1]"><div className={`h-full rounded-full ${indicator.value >= 80 ? "bg-success" : "bg-gold"}`} style={{ width: `${indicator.value}%` }} /></div></div>)}</div><LinkButton href="/score" variant="secondary" className="mt-5 w-full">Lihat Rincian TaqwaScore <ArrowRight className="h-4 w-4" /></LinkButton></section>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-card"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Buku Kas Bulan Ini</p><h2 className="mt-1 text-xl font-black">Kinerja Keuangan Usaha</h2></div><span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-muted">Okt 2024</span></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-mint p-4"><div className="flex items-center justify-between text-[13px] text-muted"><span>Omzet</span><TrendingUp className="h-4 w-4 text-emeraldDark" /></div><strong className="mt-3 block text-base">{formatCurrencyIDR(revenue)}</strong><span className="mt-1 block text-[11px] font-bold text-emeraldDark">+12% bulan lalu</span></div><div className="rounded-xl bg-mint p-4"><div className="flex items-center justify-between text-[13px] text-muted"><span>Pengeluaran Operasional</span><WalletCards className="h-4 w-4 text-muted" /></div><strong className="mt-3 block text-base">{formatCurrencyIDR(expense)}</strong><span className="mt-1 block text-[11px] text-muted">Bahan baku &amp; utilitas</span></div><div className="col-span-2 flex items-center justify-between rounded-xl bg-gradient-to-r from-emeraldBrand to-emeraldDark p-4 text-white"><div><span className="text-[11px] font-bold uppercase tracking-wider text-[#8cd5b8]">Laba Bersih Usaha</span><strong className="mt-1 block text-2xl">{formatCurrencyIDR(profit)}</strong><span className="text-[11px] text-[#c5eae1]">Margin sehat untuk usaha bakery</span></div><span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><WalletCards className="h-6 w-6 text-[#ffdea1]" /></span></div></div><Link href="/financing-match" className="mt-4 flex items-center gap-3 rounded-xl bg-[#d0f6ed] p-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#c5eae1] text-emeraldDark"><Utensils className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-[11px] font-bold uppercase tracking-wide text-muted">Target kebutuhan modal</span><strong className="block truncate text-sm">Pengadaan Oven Konveksi 12 Loyang</strong><span className="block text-xs font-bold text-emeraldDark">Kebutuhan: Rp25.000.000</span></span><ChevronRight className="h-4 w-4 shrink-0 text-muted" /></Link></section>

      <section className="relative mt-4 overflow-hidden rounded-2xl bg-[#6a4d00] p-5 text-white shadow-card"><div className="relative z-10"><div className="flex items-center gap-2 text-[#ffdea1]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#ffdea1] text-[#6a4d00]"><Lightbulb className="h-4 w-4" /></span><span className="text-[13px] font-black uppercase tracking-wide">Taqwa AI Insight</span></div><p className="mt-3 text-sm leading-6">Tiga indikator masih dapat ditingkatkan untuk membantu usaha Anda menjadi lebih siap mengakses pembiayaan.</p><div className="mt-5 grid grid-cols-2 gap-2"><Link href="/planning" className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg bg-[#ffdea1] px-2 text-center text-[11px] font-bold text-[#6a4d00]"><LockKeyhole className="h-4 w-4" />Lihat Planning</Link><Link href="/financing-match" className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg bg-white/15 px-2 text-center text-[11px] font-semibold"><HandCoins className="h-4 w-4" />Simulasi Akad</Link></div></div></section>

      <section className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card"><div className="h-20 w-20 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDd00-kbqXCOJx53J-1of6B_J_2PU3xrlnCuLYhIWOV8PsUgVJcJSygXrbW1JU0rJvNHnQr8MzVL0Ypb3PfYllglTA119yhT8XEIN5GRBiudaWUeY9Yt9XgQivRcyNQaIrGKLGyle4UZWLmtw-FssnIgPfJHiJBYHCI3EhCmGPBQ_RZ9yApEKA8SXnI1LGXz3tThQIUgG6E8lU8_vRTKO0alNRKUuK8n8AABA19tXo')" }} /><div className="min-w-0"><p className="text-[13px] font-bold text-emeraldDark">Validasi Kapasitas Produksi</p><h3 className="truncate text-sm font-black">Rumah Kue Aisyah</h3><p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">Peningkatan kapasitas diproyeksikan menaikkan omzet bulanan hingga Rp55 juta.</p></div></section>

    </AppShell>
  );
}
