"use client";

import { BookOpenCheck, CheckCircle2, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DemoReset } from "@/components/ui/demo-reset";
import { useDemoState } from "@/hooks/use-demo-state";
import { formatCurrencyIDR } from "@/lib/format";
import { resetOnboardingCompletion } from "@/components/onboarding/mobile-onboarding";

export default function ProfilePage() {
  const { state } = useDemoState();

  return (
    <AppShell>
      <PageHeader title="Profil Usaha" subtitle="Pengguna memiliki kontrol terhadap data yang dipakai untuk analisis kesiapan finansial." />
      <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <article className="rounded-lg bg-white p-5 shadow-card">
          <h2 className="text-2xl font-black">{state.assessment.businessName}</h2>
          <p className="mt-1 text-sm text-muted">{state.assessment.category} • {state.assessment.age}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Omzet Bulanan" value={formatCurrencyIDR(state.assessment.monthlyRevenue)} />
            <Info label="Pengeluaran Bulanan" value={formatCurrencyIDR(state.assessment.monthlyExpense)} />
            <Info label="Kebutuhan Pembiayaan" value={formatCurrencyIDR(state.assessment.financingNeed)} />
            <Info label="Tujuan" value={state.assessment.financingPurpose} />
          </div>
        </article>
        <article className="rounded-lg bg-emeraldDark p-5 text-white shadow-soft">
          <ShieldCheck className="h-7 w-7 text-gold" />
          <h2 className="mt-3 text-xl font-black">Privacy & Consent</h2>
          <p className="mt-2 text-sm leading-6 text-white/78">Data Anda digunakan untuk membantu analisis kesiapan finansial sesuai persetujuan Anda. Prototype ini tidak meminta password bank, PIN, OTP, atau credential keuangan asli.</p>
          <div className="mt-4 rounded-lg bg-white/10 p-4 text-sm font-semibold">Consent aktif untuk analisis demo.</div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["QRIS", "Connected"],
          ["Rekening Usaha", "Connected"],
          ["Manual Bookkeeping", "Active"]
        ].map(([name, status]) => (
          <article key={name} className="rounded-lg bg-white p-5 shadow-card">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <h2 className="mt-3 font-black">{name}</h2>
            <p className="mt-1 text-sm text-muted">{status}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-black"><FileText className="h-5 w-5" /> Dokumen Usaha</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>• NIB & Sertifikat Halal: tersedia</li>
            <li>• Catatan omzet: perlu dirapikan 2 bulan terakhir</li>
            <li>• Proposal pembelian oven: dalam proses</li>
          </ul>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-black"><LockKeyhole className="h-5 w-5" /> Riwayat TaqwaScore</h2>
          <div className="mt-4 flex items-end gap-4">
            <div className="grid gap-2 text-center"><div className="h-24 w-16 rounded-lg bg-warning" /><span className="text-sm font-bold">68</span></div>
            <div className="grid gap-2 text-center"><div className="h-32 w-16 rounded-lg bg-success" /><span className="text-sm font-bold">82</span></div>
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-lg bg-white p-5 shadow-card">
        <h2 className="text-xl font-black">Pengaturan Demo</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Kembalikan data demo atau buka ulang panduan awal aplikasi.</p>
        <div className="mt-4 grid gap-2">
          <Button variant="secondary" className="w-full text-xs" onClick={() => { window.location.href = "/onboarding"; }}>
            <FileText className="h-4 w-4" />
            Mulai Penilaian TaqwaScore
          </Button>
          <Button
            variant="secondary"
            className="w-full text-xs"
            onClick={() => {
              resetOnboardingCompletion();
              window.location.href = "/";
            }}
          >
            <BookOpenCheck className="h-4 w-4" />
            Lihat Panduan Awal
          </Button>
          <DemoReset />
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-mint p-4"><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-1 font-black text-ink">{value}</p></div>;
}
