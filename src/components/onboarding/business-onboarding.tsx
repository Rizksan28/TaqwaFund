"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, FileCheck2, Leaf, LockKeyhole, LogIn, MessageCircle, Pencil, ShieldCheck, Store, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { defaultAssessment } from "@/data/demo";
import { formatCurrencyIDR } from "@/lib/format";
import { readDemoState, updateAssessmentState } from "@/lib/storage";
import type { AssessmentData } from "@/types";

const DRAFT_KEY = "taqwafund-onboarding-draft";
const titles = ["Identitas Usaha", "Data Keuangan", "Dokumen & Syariah", "Tinjau Penilaian"];
const initialAssessment: AssessmentData = {
  ...defaultAssessment,
  businessName: "", category: "", age: "", location: "", employeeCount: "1–2", monthlyRevenue: 0, monthlyExpense: 0,
  financingNeed: 0, financingPurpose: "", financingGoal: "", transactionMethods: [],
  bookkeeping: "Belum teratur", hasQris: false, hasBusinessAccount: false, hasNib: false,
  financialSeparation: "Belum Dipisahkan", cashBuffer: "Tidak Ada", revenueStability: "cukup",
  financingTimeline: "Belum ditentukan", halalStatus: "Belum Memiliki", halalCertificateNumber: "", halalMaterials: [],
  shariaPractices: { prohibitedProductsFree: false, noMaysir: false, transparentTransactions: false, understandsRiba: false }
};
type Draft = { step: number; mode: "register" | "login"; name: string; phone: string; assessment: AssessmentData };
const initialDraft: Draft = { step: -1, mode: "register", name: "", phone: "", assessment: initialAssessment };
const inputClass = "min-h-12 w-full min-w-0 rounded-lg border border-[#bdc9c2] bg-white px-3 text-sm text-[#00201b] outline-none transition focus:border-[#078664] focus:ring-2 focus:ring-[#078664]/15";
const primaryClass = "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#078664] px-4 text-sm font-bold text-white transition hover:bg-[#006a4f] disabled:opacity-50";

export function BusinessOnboarding({ assessmentOnly = false, onExit }: { assessmentOnly?: boolean; onExit?: () => void }) {
  const draftKey = assessmentOnly ? "taqwafund-assessment-draft" : DRAFT_KEY;
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const { step, mode, name, phone, assessment: form } = draft;

  useEffect(() => {
    try {
      if (assessmentOnly) {
        const state = readDemoState();
        setDraft({ ...initialDraft, step: 0, assessment: state.completedAssessment ? state.assessment : initialAssessment });
      }
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Draft>;
        if (saved.assessment && typeof saved.assessment.businessName === "string") {
          setDraft({ ...initialDraft, ...saved, step: typeof saved.step === "number" && saved.step >= (assessmentOnly ? 0 : -1) && saved.step <= 3 ? saved.step : assessmentOnly ? 0 : -1,
            assessment: { ...initialAssessment, ...saved.assessment, shariaPractices: { ...initialAssessment.shariaPractices, ...saved.assessment.shariaPractices } } });
        }
      }
    } catch { setStorageAvailable(false); }
    setReady(true);
  }, [assessmentOnly, draftKey]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(draftKey, JSON.stringify(draft)); }
    catch { setStorageAvailable(false); }
  }, [draft, ready, draftKey]);

  function update<K extends keyof AssessmentData>(key: K, value: AssessmentData[K]) {
    setDraft(current => ({ ...current, assessment: { ...current.assessment, [key]: value } }));
  }
  function goTo(next: number) { setError(""); setDraft(current => ({ ...current, step: next })); window.scrollTo({ top: 0 }); }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (step === -1) {
      const digits = phone.replace(/\D/g, "").replace(/^(62|0)/, "");
      if (!/^8\d{8,11}$/.test(digits)) { setError("Masukkan nomor WhatsApp Indonesia yang valid, misalnya 81234567890."); return; }
      if (mode === "register" && !name.trim()) { setError("Isi nama pemilik usaha."); return; }
    }
    if (step === 0 && (!form.businessName.trim() || !form.category || !form.age || !form.location.trim())) {
      setError("Lengkapi nama usaha, sektor, lama usaha, dan lokasi."); return;
    }
    if (step === 1 && (form.monthlyRevenue <= 0 || form.monthlyExpense < 0 || form.financingNeed < 0 || !form.transactionMethods.length || (form.financingNeed > 0 && !form.financingPurpose.trim()))) {
      setError("Isi omzet, metode transaksi, dan tujuan jika Anda membutuhkan pembiayaan."); return;
    }
    if (step === 3) {
      if (!consent) { setError("Setujui penggunaan data untuk menghitung TaqwaScore."); return; }
      setSaving(true);
      try {
        updateAssessmentState(form);
        if (!assessmentOnly) localStorage.setItem("taqwafund-onboarding-account", JSON.stringify({ name: name.trim() || "Pengguna Demo", phone, simulated: true }));
        localStorage.setItem("taqwafund_onboarding_completed", "true");
        localStorage.removeItem(draftKey);
        window.location.assign("/score");
      } catch { setSaving(false); setError("Data belum bisa disimpan. Izinkan penyimpanan browser lalu coba lagi."); }
      return;
    }
    goTo(step + 1);
  }

  if (!ready) return <div className="min-h-dvh w-full max-w-[390px] bg-[#e5fff8]" aria-label="Memuat onboarding" />;

  return (
    <div className="mobile-app min-h-dvh w-full max-w-[390px] bg-[#e5fff8] text-[#00201b] shadow-[0_18px_60px_rgba(7,93,70,0.18)]">
      <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-2 border-b border-[#006a4f]/10 bg-[#e5fff8]/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        <button type="button" aria-label="Kembali" onClick={() => assessmentOnly && step === 0 ? onExit?.() : step === -1 ? window.location.assign("/") : goTo(step - 1)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-white"><ArrowLeft className="h-5 w-5" /></button>
        <BrandLogo className="h-9 w-9" />
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-[#795900]">TAQWAFUND</p><p className="text-sm font-bold">{assessmentOnly ? "Penilaian TaqwaScore" : step === -1 ? "Mulai Perjalanan" : "Profil Kesiapan Usaha"}</p></div>
        {assessmentOnly ? <button type="button" onClick={onExit} className="min-h-11 px-2 text-xs text-[#3e4943]">Simpan & Keluar</button> : <a href="/" className="flex min-h-11 items-center px-2 text-xs text-[#3e4943]">Nanti</a>}
      </header>

      <main className="px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5">
        {step === -1 ? <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#cff6ed] px-3 py-1 text-[10px] font-bold text-[#006a4f]"><ShieldCheck className="h-3.5 w-3.5" />Perjalanan usaha yang lebih siap</span>
          <h1 className="mt-3 text-[24px] font-bold leading-8">Mulai Perjalanan<br />Usaha Berkah</h1>
          <p className="mt-2 text-sm leading-5 text-[#3e4943]">Kenali kondisi usaha Anda dan siapkan langkah menuju pembiayaan syariah.</p>
          <div className="relative my-5 h-28 overflow-hidden rounded-lg bg-[#006a4f]">
            {/* The photo comes from the supplied design reference. */}
            <Image unoptimized width={175} height={112} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkt-wuYHlK7_bjLu95W-XeSywmiozL-95tBgXKEtJt4SF9Q1p2Wj3mzzVmH4eNLxPIviXfUMiKH9skadB2Ag5aD5ZRhh3J0wK_S4VsQ6TvVIE23LwETSp1y9v4rdXByAoKQFMaovTkayTEihpyNSbkcllOfHJYMWCRP1RsKJX9wZ2o-mpSxI28c3F9vsI1341sE58br9qFRXDLJtYaXsvY_1nWTCqHMFkYAw3jzVAU6f4GrCaPrT0wsw" alt="Pemilik usaha kuliner Indonesia" className="absolute right-0 h-full w-1/2 object-cover" onError={event => { event.currentTarget.style.display = "none"; }} />
            <div className="relative flex h-full w-3/5 items-center gap-3 bg-[#006a4f] px-4 text-white"><Store className="h-8 w-8 shrink-0 text-[#fdc74c]" /><div><p className="text-[10px] font-bold text-[#ffdf9f]">MITRA UMKM MANDIRI</p><p className="mt-1 text-sm font-semibold">Usaha tumbuh,<br />langkah terarah.</p></div></div>
          </div>
        </> : <>
          <div className="flex items-center justify-between text-xs"><span className="font-semibold text-[#006a4f]">Langkah {step + 1} dari 4</span><span>{Math.round((step + 1) * 25)}%</span></div>
          <div className="mt-3 grid grid-cols-4 gap-1.5" role="progressbar" aria-label="Progres penilaian" aria-valuenow={(step + 1) * 25} aria-valuemin={0} aria-valuemax={100}>{titles.map((title, i) => <span key={title} className={`h-1.5 rounded-full ${i <= step ? "bg-[#078664]" : "bg-[#c4eae1]"}`} />)}</div>
          <h1 className="mt-5 text-[24px] font-bold leading-8">{titles[step]}</h1>
          <p className="mt-2 text-sm leading-5 text-[#3e4943]">{["Bantu kami mengenal jenis dan skala usaha Anda.", "Gunakan perkiraan rata-rata bulanan dari usaha Anda.", "Lengkapi kondisi dokumen dan praktik usaha saat ini.", "Periksa jawaban sebelum menghitung kesiapan usaha."][step]}</p>
          {step === 0 && <div className="my-5 flex items-center gap-3 border-y border-[#006a4f]/10 py-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#fdc74c]"><Leaf className="h-6 w-6 text-[#795900]" /></span><div><p className="text-xs font-bold text-[#006a4f]">LANGKAH AWAL TAQWASCORE</p><p className="mt-1 text-sm">Kenali usaha, siapkan masa depan.</p></div></div>}
        </>}

        <form onSubmit={next} className="mt-5 space-y-6">
          {step === -1 && <>
            <div role="tablist" aria-label="Pilihan akun" className="grid grid-cols-2 gap-1 rounded-lg bg-[#cff6ed] p-1">{(["register", "login"] as const).map(value => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => { setError(""); setDraft(current => ({ ...current, mode: value })); }} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-bold ${mode === value ? "bg-[#006a4f] text-white" : "text-[#3e4943]"}`}>{value === "register" ? <Store className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{value === "register" ? "Daftar Usaha Baru" : "Masuk Akun"}</button>)}</div>
            <Field label="Nomor WhatsApp Aktif"><div className="flex items-center gap-2"><span className="flex h-12 shrink-0 items-center gap-1.5 text-sm font-bold"><MessageCircle className="h-5 w-5 text-[#078664]" />+62</span><input aria-label="Nomor WhatsApp Aktif" className={inputClass} type="tel" inputMode="tel" autoComplete="tel-national" required placeholder="81234567890" value={phone} onChange={e => setDraft(current => ({ ...current, phone: e.target.value }))} /></div></Field>
            {mode === "register" && <Field label="Nama Pemilik Usaha"><input className={inputClass} autoComplete="name" required maxLength={100} placeholder="Nama lengkap Anda" value={name} onChange={e => setDraft(current => ({ ...current, name: e.target.value }))} /></Field>}
            <p className="flex items-start gap-2 rounded-lg border border-[#e1c575] bg-[#fff7df] p-3 text-xs leading-5 text-[#715300]"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />Mode simulasi. Tidak ada OTP yang dikirim dan belum ada akun sungguhan yang dibuat.</p>
          </>}

          {step === 0 && <>
            <Field label="Nama Usaha / Merek Dagang"><input className={inputClass} required maxLength={100} placeholder="Contoh: Dapur Berkah Bunda" value={form.businessName} onChange={e => update("businessName", e.target.value)} /></Field>
            <Choice label="Kategori & Sektor Usaha" value={form.category} options={["Kuliner & Minuman", "Fashion Muslim", "Retail / Kelontong", "Jasa & Kerajinan", "Agribisnis"]} onChange={value => update("category", value)} />
            <Choice label="Lama Usaha Beroperasi" value={form.age} options={["< 1 Tahun", "1–3 Tahun", "3–5 Tahun", "> 5 Tahun"]} onChange={value => update("age", value)} />
            <Field label="Lokasi Usaha (Kota/Kabupaten)"><input className={inputClass} required maxLength={150} placeholder="Contoh: Bandung, Jawa Barat" value={form.location} onChange={e => update("location", e.target.value)} /></Field>
            <Choice label="Jumlah Tenaga Kerja" hint="Termasuk pemilik aktif dan staf harian." value={form.employeeCount} options={["1–2", "3–5", "6–10", ">10"]} onChange={value => update("employeeCount", value as AssessmentData["employeeCount"])} />
          </>}

          {step === 1 && <>
            <Money label="Omzet Bulanan" value={form.monthlyRevenue} min={1} onChange={value => update("monthlyRevenue", value)} />
            <Money label="Pengeluaran Bulanan" value={form.monthlyExpense} onChange={value => update("monthlyExpense", value)} />
            <div className="flex items-center justify-between border-y border-[#006a4f]/15 py-3 text-sm"><span>Selisih omzet & pengeluaran</span><strong className={form.monthlyRevenue < form.monthlyExpense ? "text-red-700" : "text-[#006a4f]"}>{formatCurrencyIDR(form.monthlyRevenue - form.monthlyExpense)}</strong></div>
            <Select label="Stabilitas Pendapatan" value={form.revenueStability} options={[{ value: "stabil", label: "Stabil" }, { value: "cukup", label: "Cukup stabil" }, { value: "fluktuatif", label: "Fluktuatif" }, { value: "sangat_fluktuatif", label: "Sangat fluktuatif" }]} onChange={value => update("revenueStability", value as AssessmentData["revenueStability"])} />
            <Select label="Metode Pencatatan" value={form.bookkeeping} options={["Belum teratur", "Catatan Manual", "Spreadsheet", "Aplikasi Pembukuan"]} onChange={value => update("bookkeeping", value)} />
            <Choice label="Metode Transaksi" multiple value={form.transactionMethods} options={["Tunai", "QRIS / E-Wallet", "Transfer Bank"]} onChange={value => {
              const methods = form.transactionMethods.includes(value) ? form.transactionMethods.filter(item => item !== value) : [...form.transactionMethods, value];
              update("transactionMethods", methods); update("hasQris", methods.includes("QRIS / E-Wallet"));
            }} />
            <Select label="Pemisahan Keuangan Usaha" value={form.financialSeparation} options={["Belum Dipisahkan", "Sebagian", "Sudah Dipisahkan"]} onChange={value => update("financialSeparation", value as AssessmentData["financialSeparation"])} />
            <Select label="Dana Cadangan Usaha" value={form.cashBuffer} options={["Tidak Ada", "< 1 Bulan Biaya", "1–3 Bulan Biaya", "> 3 Bulan Biaya"]} onChange={value => update("cashBuffer", value as AssessmentData["cashBuffer"])} />
            <Toggle label="Memiliki rekening khusus usaha" checked={form.hasBusinessAccount} onChange={value => update("hasBusinessAccount", value)} />
            <Money label="Kebutuhan Pembiayaan" hint="Isi 0 jika belum membutuhkan pembiayaan." value={form.financingNeed} onChange={value => update("financingNeed", value)} />
            {form.financingNeed > 0 && <>
              <Field label="Tujuan Pembiayaan"><input className={inputClass} required maxLength={200} placeholder="Contoh: membeli oven produksi" value={form.financingPurpose} onChange={e => { update("financingPurpose", e.target.value); update("financingGoal", e.target.value); }} /></Field>
              <Select label="Rencana Waktu Pembiayaan" value={form.financingTimeline} options={["< 1 bulan", "1–3 bulan", "3–6 bulan", "Belum ditentukan"]} onChange={value => update("financingTimeline", value as AssessmentData["financingTimeline"])} />
            </>}
          </>}

          {step === 2 && <>
            <Toggle label="Memiliki Nomor Induk Berusaha (NIB)" checked={form.hasNib} onChange={value => update("hasNib", value)} />
            <Select label="Status Sertifikat Halal" value={form.halalStatus} options={["Belum Memiliki", "Sedang Dalam Proses", "Sudah Memiliki", "Tidak Relevan untuk Jenis Usaha"]} onChange={value => update("halalStatus", value as AssessmentData["halalStatus"])} />
            {form.halalStatus === "Sudah Memiliki" && <Field label="Nomor Sertifikat Halal (Opsional)"><input className={inputClass} maxLength={100} value={form.halalCertificateNumber} onChange={e => update("halalCertificateNumber", e.target.value)} placeholder="Nomor pada sertifikat Anda" /></Field>}
            <Choice label="Bahan Baku & Pemasok" multiple value={form.halalMaterials} options={["Menggunakan bahan berlabel halal", "Menggunakan pemasok terpercaya", "Memeriksa asal bahan baku"]} onChange={value => update("halalMaterials", form.halalMaterials.includes(value) ? form.halalMaterials.filter(item => item !== value) : [...form.halalMaterials, value])} />
            <fieldset className="space-y-3"><legend className="mb-3 text-sm font-bold">Praktik Usaha Saat Ini</legend>{([
              ["prohibitedProductsFree", "Tidak menjual produk yang dilarang"], ["noMaysir", "Tidak melibatkan praktik perjudian"],
              ["transparentTransactions", "Harga dan transaksi dijelaskan transparan"], ["understandsRiba", "Memahami prinsip menghindari riba"]
            ] as const).map(([key, label]) => <Toggle key={key} label={label} checked={form.shariaPractices[key]} onChange={value => update("shariaPractices", { ...form.shariaPractices, [key]: value })} />)}</fieldset>
            <div className="flex items-start gap-3 border-y border-[#006a4f]/10 py-4"><FileCheck2 className="h-6 w-6 shrink-0 text-[#006a4f]" /><p className="text-xs leading-5 text-[#3e4943]">Belum memiliki dokumen? Anda tetap bisa melanjutkan. Penilaian ini berdasarkan jawaban Anda, bukan verifikasi atau sertifikasi resmi.</p></div>
          </>}

          {step === 3 && <>
            <Review title="Identitas Usaha" onEdit={() => goTo(0)} rows={[["Nama usaha", form.businessName], ["Sektor", form.category], ["Lama usaha", form.age], ["Lokasi", form.location], ["Tenaga kerja", `${form.employeeCount} orang`]]} />
            <Review title="Data Keuangan" onEdit={() => goTo(1)} rows={[["Omzet bulanan", formatCurrencyIDR(form.monthlyRevenue)], ["Pengeluaran", formatCurrencyIDR(form.monthlyExpense)], ["Pendapatan", form.revenueStability.replace("_", " ")], ["Pencatatan", form.bookkeeping], ["Transaksi", form.transactionMethods.join(", ")], ["Pemisahan dana", form.financialSeparation], ["Cadangan", form.cashBuffer], ["Rekening usaha", form.hasBusinessAccount ? "Ada" : "Belum"], ["Kebutuhan dana", formatCurrencyIDR(form.financingNeed)], ...(form.financingNeed > 0 ? [["Tujuan", form.financingPurpose], ["Waktu", form.financingTimeline]] : [])]} />
            <Review title="Dokumen & Syariah" onEdit={() => goTo(2)} rows={[["NIB", form.hasNib ? "Ada" : "Belum ada"], ["Sertifikat halal", form.halalStatus], ...(form.halalStatus === "Sudah Memiliki" && form.halalCertificateNumber ? [["Nomor sertifikat", form.halalCertificateNumber]] : []), ["Bahan & pemasok", form.halalMaterials.join(", ") || "Belum dipilih"], ["Praktik usaha", `${Object.values(form.shariaPractices).filter(Boolean).length} dari 4 terpenuhi`]]} />
            <Toggle label="Saya menyetujui penggunaan jawaban ini untuk penilaian kesiapan usaha di perangkat ini." checked={consent} onChange={setConsent} />
            <p className="text-xs leading-5 text-[#3e4943]">TaqwaScore adalah indikator kesiapan dari data yang Anda isi, bukan jaminan persetujuan pembiayaan.</p>
          </>}

          {!storageAvailable && <p role="status" className="text-xs text-[#795900]">Penyimpanan browser tidak tersedia. Draf mungkin hilang saat halaman ditutup.</p>}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={saving} className={primaryClass}>{saving ? "Menyimpan penilaian..." : step === -1 ? mode === "register" ? "Daftar & Lanjutkan" : "Masuk & Lanjutkan" : step === 3 ? "Hitung TaqwaScore" : ["Lanjut ke Keuangan", "Lanjut ke Dokumen", "Tinjau Jawaban"][step]}{!saving && <ArrowRight className="h-4 w-4 shrink-0" />}</button>
          {step === -1 && <>
            <div className="flex items-center gap-3 text-xs text-[#3e4943]"><span className="h-px flex-1 bg-[#bdc9c2]" />atau<span className="h-px flex-1 bg-[#bdc9c2]" /></div>
            <button type="button" onClick={() => { setDraft(current => ({ ...current, name: current.name || "Pengguna Demo", step: 0 })); setError(""); window.scrollTo({ top: 0 }); }} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#bdc9c2] bg-white text-sm font-semibold"><UserRound className="h-4 w-4" />Lanjut dengan Akun Demo</button>
            <div className="flex items-center justify-center gap-4 border-y border-[#006a4f]/10 py-3 text-[11px] font-semibold text-[#006a4f]"><span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Gratis</span><span className="flex items-center gap-1"><LockKeyhole className="h-4 w-4" />Data di perangkat</span><span className="flex items-center gap-1"><BadgeCheck className="h-4 w-4" />Prinsip syariah</span></div>
          </>}
          {step >= 0 && <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#3e4943]"><CheckCircle2 className="h-3.5 w-3.5 text-[#006a4f]" />{storageAvailable ? "Draf tersimpan otomatis di perangkat ini" : "Draf belum tersimpan"}</p>}
        </form>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span>{hint && <span className="mb-2 block text-xs leading-5 text-[#3e4943]">{hint}</span>}{children}</label>;
}

function Money({ label, hint, value, min = 0, onChange }: { label: string; hint?: string; value: number; min?: number; onChange: (value: number) => void }) {
  return <Field label={label} hint={hint}><div className="flex items-center gap-2"><span className="text-sm font-bold text-[#006a4f]">Rp</span><input className={inputClass} required type="number" inputMode="numeric" min={min} max={1000000000000} step={1} value={value} onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))} /></div></Field>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: (string | { value: string; label: string })[]; onChange: (value: string) => void }) {
  return <Field label={label}><select className={inputClass} value={value} onChange={e => onChange(e.target.value)}>{options.map(option => typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>;
}

function Choice({ label, hint, value, options, multiple = false, onChange }: { label: string; hint?: string; value: string | string[]; options: string[]; multiple?: boolean; onChange: (value: string) => void }) {
  return <fieldset><legend className="text-sm font-bold">{label}</legend>{hint && <p className="mt-1 text-xs text-[#3e4943]">{hint}</p>}<div className={`mt-3 grid gap-2 ${!multiple && options.length <= 4 ? "grid-cols-2" : "grid-cols-1"}`}>{options.map(option => {
    const selected = Array.isArray(value) ? value.includes(option) : value === option;
    return <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${selected ? "border-[#078664] bg-white text-[#006a4f]" : "border-[#bdc9c2] bg-[#d5fcf2]/50"}`}><input type={multiple ? "checkbox" : "radio"} name={label} checked={selected} onChange={() => onChange(option)} className="h-4 w-4 shrink-0 accent-[#078664]" /><span className="min-w-0 flex-1">{option}</span>{selected && <Check className="h-4 w-4 shrink-0" />}</label>;
  })}</div></fieldset>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-3 text-sm leading-5"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#078664]" /><span>{label}</span></label>;
}

function Review({ title, rows, onEdit }: { title: string; rows: string[][]; onEdit: () => void }) {
  return <section className="border-b border-[#006a4f]/15 pb-5"><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-bold">{title}</h2><button type="button" onClick={onEdit} className="flex min-h-11 items-center gap-1.5 text-xs font-bold text-[#006a4f]" aria-label={`Ubah ${title}`}><Pencil className="h-3.5 w-3.5" />Ubah<ChevronRight className="h-3.5 w-3.5" /></button></div><dl className="space-y-3">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-3 text-xs leading-5"><dt className="text-[#3e4943]">{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>)}</dl></section>;
}
