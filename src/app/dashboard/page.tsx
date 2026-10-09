"use client";

import { ArrowRight, Bot, CheckCircle2, HandCoins, ListChecks } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/button";
import { IndicatorCard } from "@/components/ui/indicator-card";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { useDemoState } from "@/hooks/use-demo-state";
import { formatCurrencyIDR } from "@/lib/format";

export default function DashboardPage() {
  const { state } = useDemoState();

  return (
    <AppShell>
      <PageHeader title="Assalamu'alaikum, Bu Aisyah" subtitle="Mari persiapkan usaha Anda menuju pembiayaan syariah." />
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-lg bg-emeraldDark p-6 text-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/72">TaqwaScore</p>
              <h2 className="mt-1 text-2xl font-black">{state.score.status}</h2>
            </div>
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">Sertifikasi Halal Aktif</span>
          </div>
          <div className="mt-6 flex justify-center"><ScoreGauge score={state.score.score} status={state.score.status} dark /></div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/assessment" variant="secondary">Lanjutkan Penilaian</LinkButton>
            <LinkButton href="/planning" variant="ghost" className="bg-white/10 text-white hover:bg-white/15">Lihat Planning</LinkButton>
            <LinkButton href="/financing-match" variant="ghost" className="bg-white/10 text-white hover:bg-white/15">Cari Pembiayaan</LinkButton>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-lg bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-emeraldDark" />
              <h2 className="text-xl font-black">Insight AI</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">Ada 3 hal yang dapat Anda perbaiki untuk meningkatkan TaqwaScore: pencatatan, pemisahan rekening, dan dana cadangan.</p>
            <LinkButton href="/planning" variant="secondary" className="mt-4">Lihat Taqwa AI Insight <ArrowRight className="h-4 w-4" /></LinkButton>
          </article>
          <article className="rounded-lg bg-white p-5 shadow-card">
            <h2 className="text-xl font-black">Buku Kas Bulan Ini</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-mint p-4"><p className="text-xs text-muted">Omzet</p><p className="mt-2 text-lg font-black">{formatCurrencyIDR(state.assessment.monthlyRevenue)}</p></div>
              <div className="rounded-lg bg-mint p-4"><p className="text-xs text-muted">Beban Operasional</p><p className="mt-2 text-lg font-black">{formatCurrencyIDR(state.assessment.monthlyExpense)}</p></div>
              <div className="rounded-lg bg-emeraldDark p-4 text-white"><p className="text-xs text-white/72">Laba Bersih</p><p className="mt-2 text-lg font-black">{formatCurrencyIDR(state.assessment.monthlyRevenue - state.assessment.monthlyExpense)}</p></div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><ListChecks className="h-6 w-6" /> Perjalanan Menuju Siap Pembiayaan</h2>
        <div className="grid gap-4 md:grid-cols-5">
          {state.score.indicators.map((indicator) => <IndicatorCard key={indicator.key} indicator={indicator} />)}
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-mint p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emeraldDark" />
            <p className="font-semibold">Data Anda digunakan untuk membantu analisis kesiapan finansial sesuai persetujuan Anda.</p>
          </div>
          <LinkButton href="/profile" variant="secondary">Kelola Profil</LinkButton>
        </div>
      </section>
    </AppShell>
  );
}
