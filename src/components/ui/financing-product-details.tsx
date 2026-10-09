"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Calculator, Check, ChevronDown, ClipboardCheck, FileCheck2, Info, Layers3, MapPin, ShieldCheck } from "lucide-react";
import { documentLabels, provinceOptions, purposeLabels } from "@/data/financing";
import type { FinancingProduct } from "@/data/financing";
import { formatCurrencyIDR } from "@/lib/format";
import type { FinancingDraft, FinancingPurpose } from "@/types";

const inputClass = "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-emeraldDark/20 bg-white px-3 text-sm outline-none focus:border-emeraldDark focus:ring-2 focus:ring-emeraldDark/10";
const documentHints = {
  identity: "Identitas pemilik usaha yang masih berlaku.",
  nib: "Nomor Induk Berusaha sesuai profil usaha.",
  records: "Catatan pemasukan dan pengeluaran usaha.",
  quotation: "Rincian barang, harga, dan pihak penyedia aset."
};

export function FinancingDocuments({ product, draft, onChange }: { product: FinancingProduct; draft: FinancingDraft; onChange: (patch: Partial<FinancingDraft>) => void }) {
  const count = product.documents.filter(id => draft.documents[id]).length;
  return <section className="border-t border-emeraldDark/15 py-5">
    <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-bold"><FileCheck2 className="h-5 w-5 text-emeraldDark" />Kesiapan Dokumen</h2><span className="shrink-0 text-xs font-semibold text-emeraldDark">{count}/{product.documents.length} siap</span></div>
    <p className="mt-2 text-xs leading-5 text-muted">Tandai dokumen yang sudah Anda miliki. Belum ada unggahan atau verifikasi berkas.</p>
    <div role="progressbar" aria-label="Kesiapan dokumen" aria-valuemin={0} aria-valuemax={product.documents.length} aria-valuenow={count} className="mt-4 h-1.5 overflow-hidden rounded-full bg-emeraldDark/10"><div className="h-full bg-emeraldDark transition-[width]" style={{ width: `${count / product.documents.length * 100}%` }} /></div>
    <div className="mt-2 divide-y divide-emeraldDark/10">{product.documents.map(id => <label key={id} className="flex cursor-pointer items-start gap-3 py-4">
      <input type="checkbox" aria-label={documentLabels[id]} checked={Boolean(draft.documents[id])} onChange={event => onChange({ documents: { [id]: event.target.checked } })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#075d46]" />
      <span className="min-w-0"><span className="block text-sm font-semibold leading-5">{documentLabels[id]}</span><span className="mt-1 block text-xs leading-5 text-muted">{documentHints[id]}</span><span className={`mt-1 block text-[10px] font-semibold ${draft.documents[id] ? "text-emeraldDark" : "text-muted"}`}>{draft.documents[id] ? "Dinyatakan siap" : "Belum ditandai siap"}</span></span>
    </label>)}</div>
  </section>;
}

function ScenarioFields({ product, draft, onChange, full = true }: { product: FinancingProduct; draft: FinancingDraft; onChange: (patch: Partial<FinancingDraft>) => void; full?: boolean }) {
  return <div className="space-y-4 py-4">
    <label className="block text-xs font-semibold">Nominal kebutuhan (Rp)<input className={inputClass} type="number" inputMode="numeric" min={0} max={1000000000000} value={draft.amount} onChange={event => onChange({ amount: Number(event.target.value) })} /><span className="mt-1 block text-[11px] font-normal leading-5 text-muted">{formatCurrencyIDR(product.minAmount)} sampai {formatCurrencyIDR(product.maxAmount)}</span></label>
    <label className="block text-xs font-semibold">Jangka waktu<select className={inputClass} value={draft.tenor} onChange={event => onChange({ tenor: Number(event.target.value) })}>{product.tenors.map(value => <option key={value} value={value}>{value} bulan</option>)}</select></label>
    {full && <>
      <label className="block text-xs font-semibold">Kategori tujuan<select className={inputClass} value={draft.purpose} onChange={event => onChange({ purpose: event.target.value as FinancingPurpose | "" })}><option value="">Pilih tujuan</option>{Object.entries(purposeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-xs font-semibold">Wilayah usaha<select className={inputClass} value={draft.province} onChange={event => onChange({ province: event.target.value })}><option value="">Pilih wilayah</option>{provinceOptions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-xs font-semibold">Lama usaha beroperasi (bulan)<input className={inputClass} type="number" inputMode="numeric" min={0} max={1200} placeholder="Contoh: 24" value={draft.operatingMonths ?? ""} onChange={event => onChange({ operatingMonths: event.target.value === "" ? null : Number(event.target.value) })} /><span className="mt-1 block text-[11px] font-normal leading-5 text-muted">Isi angka tepat jika rentang lama usaha pada profil belum cukup jelas.</span></label>
      <label className="block text-xs font-semibold">Kewajiban bulanan lain (Rp)<input className={inputClass} type="number" inputMode="numeric" min={0} max={1000000000000} value={draft.monthlyObligations} onChange={event => onChange({ monthlyObligations: Number(event.target.value) })} /><span className="mt-1 block text-[11px] font-normal leading-5 text-muted">Masukkan 0 jika tidak ada kewajiban lain.</span></label>
    </>}
  </div>;
}

export function FinancingProductDetails({ product, draft, onChange, checks, simulation }: { product: FinancingProduct; draft: FinancingDraft; onChange: (patch: Partial<FinancingDraft>) => void; checks: ReactNode; simulation: ReactNode }) {
  const [active, setActive] = useState<"summary" | "requirements" | "simulation">("summary");
  const tabs = [{ id: "summary" as const, label: "Ringkasan", icon: Layers3 }, { id: "requirements" as const, label: "Syarat", icon: ClipboardCheck }, { id: "simulation" as const, label: "Simulasi", icon: Calculator }];
  return <>
    <div role="tablist" aria-label="Detail produk" className="-mx-4 mt-5 grid grid-cols-3 border-y border-emeraldDark/15 bg-white px-4">{tabs.map(({ id, label, icon: Icon }) => <button key={id} id={`product-tab-${id}`} type="button" role="tab" aria-selected={active === id} aria-controls="product-detail-panel" onClick={() => setActive(id)} className={`flex min-h-14 items-center justify-center gap-1.5 border-b-2 text-xs font-semibold transition-colors ${active === id ? "border-emeraldDark text-emeraldDark" : "border-transparent text-muted hover:text-emeraldDark"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button>)}</div>
    <div id="product-detail-panel" role="tabpanel" aria-labelledby={`product-tab-${active}`}>
      {active === "summary" && <>
        <section className="py-5"><h2 className="text-base font-bold">Ketentuan Produk Contoh</h2><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-emeraldDark/15 py-4">
          <div><dt className="text-[11px] text-muted">Nominal minimum</dt><dd className="mt-1 break-words text-sm font-bold">{formatCurrencyIDR(product.minAmount)}</dd></div>
          <div><dt className="text-[11px] text-muted">Nominal maksimum</dt><dd className="mt-1 break-words text-sm font-bold">{formatCurrencyIDR(product.maxAmount)}</dd></div>
          <div><dt className="text-[11px] text-muted">Jangka waktu</dt><dd className="mt-1 text-sm font-semibold leading-6">{product.tenors.join(" / ")} bulan</dd></div>
          <div><dt className="text-[11px] text-muted">Minimum lama usaha</dt><dd className="mt-1 text-sm font-semibold leading-6">{product.minAgeMonths} bulan</dd></div>
        </dl><h3 className="mt-5 text-xs font-bold">Tujuan yang Dilayani</h3><ul className="mt-3 space-y-2">{product.purposes.map(id => <li key={id} className="flex items-start gap-2 text-xs leading-5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" />{purposeLabels[id]}</li>)}</ul>
        <div className="mt-5 flex items-start gap-2 border-t border-emeraldDark/10 pt-4"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" /><div><h3 className="text-xs font-bold">Wilayah Layanan Contoh</h3><p className="mt-1 text-xs leading-5 text-muted">{product.provinces?.join(", ") ?? "Semua wilayah pada pilihan skenario"}</p></div></div></section>
        <section className="border-t border-emeraldDark/15 py-5"><h2 className="text-base font-bold">Alur Persiapan</h2><ol className="mt-4 space-y-4">{[{ title: "Periksa syarat awal", body: "Bandingkan data usaha dan kesiapan dokumen." }, { title: "Tinjau simulasi", body: "Sesuaikan nominal, tenor, dan asumsi biaya." }, { title: "Siapkan draf", body: "Lengkapi penggunaan dana sebelum mencatat simulasi." }].map((step, i) => <li key={step.title} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold text-emeraldDark">{i + 1}</span><div><h3 className="text-xs font-semibold">{step.title}</h3><p className="mt-1 text-xs leading-5 text-muted">{step.body}</p></div></li>)}</ol><button type="button" onClick={() => setActive("requirements")} className="mt-5 flex min-h-11 w-full items-center justify-between border-t border-emeraldDark/15 text-xs font-bold text-emeraldDark">Periksa Syarat Saya<ArrowRight className="h-4 w-4" /></button></section>
        <div className="mb-5 flex items-start gap-2 border-l-2 border-[#d9a62e] bg-[#fff8e1] p-3"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#795900]" /><p className="text-[11px] leading-5 text-[#795900]">Biaya administrasi, agunan, dan ketentuan resmi belum tersedia. Angka pada simulasi bukan penawaran mitra.</p></div>
      </>}
      {active === "requirements" && <>
        {checks}
        <details className="group border-t border-emeraldDark/15"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden">Sesuaikan Data Kebutuhan<ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><ScenarioFields product={product} draft={draft} onChange={onChange} /></details>
        <FinancingDocuments product={product} draft={draft} onChange={onChange} />
        <p className="mb-5 flex items-start gap-2 text-[11px] leading-5 text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" />Memenuhi syarat awal tidak berarti pembiayaan disetujui. Keputusan mitra belum tersedia dalam simulasi ini.</p>
      </>}
      {active === "simulation" && <><section className="pt-5"><h2 className="text-base font-bold">Skenario Pembiayaan</h2><ScenarioFields product={product} draft={draft} onChange={onChange} full={false} /></section>{simulation}<button type="button" onClick={() => setActive("requirements")} className="mb-5 flex min-h-11 w-full items-center justify-between border-t border-emeraldDark/15 text-xs font-bold text-emeraldDark">Tinjau Syarat Setelah Simulasi<ArrowRight className="h-4 w-4" /></button></>}
    </div>
  </>;
}
