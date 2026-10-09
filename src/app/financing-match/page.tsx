"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Building2, Calculator, CheckCircle2, ChevronDown, ChevronRight, CircleAlert, Clock3, ClipboardCheck, FileText, Handshake, Info, Pencil, Send, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button, LinkButton } from "@/components/ui/button";
import { FinancingDocuments, FinancingProductDetails } from "@/components/ui/financing-product-details";
import { useDemoState } from "@/hooks/use-demo-state";
import { financingProducts, provinceOptions, purposeLabels } from "@/data/financing";
import type { FinancingProduct } from "@/data/financing";
import { createFinancingApplication, editFinancingApplication, eligibilityLabels, evaluateFinancing, financingSimulation, initialFinancingDraft, submitFinancingApplication, validateFinancingApplication, withdrawFinancingApplication } from "@/lib/financing";
import type { EligibilityStatus } from "@/lib/financing";
import { formatCurrencyIDR } from "@/lib/format";
import type { FinancingApplication, FinancingDraft, FinancingPurpose } from "@/types";

const inputClass = "mt-2 min-h-12 w-full min-w-0 rounded-lg border border-emeraldDark/20 bg-white px-3 text-sm outline-none focus:border-emeraldDark focus:ring-2 focus:ring-emeraldDark/10";
const applicationLabels = { draft: "Draf", simulated: "Simulasi tercatat", withdrawn: "Simulasi dibatalkan" };
type View = "list" | "detail" | "form" | "review" | "application";

function displayDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  return <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${status === "eligible" ? "bg-[#d0f6ed] text-emeraldDark" : status === "mismatch" ? "bg-red-50 text-red-700" : status === "incomplete" ? "bg-[#fff0c2] text-[#795900]" : "bg-white text-muted"}`}>{status === "eligible" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Info className="h-3.5 w-3.5 shrink-0" />}{eligibilityLabels[status]}</span>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block text-sm font-semibold">{label}{hint && <span className="mt-1 block text-xs font-normal leading-5 text-muted">{hint}</span>}{children}</label>;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3 border-b border-emeraldDark/10 py-3 text-xs leading-5 last:border-0"><dt className="text-muted">{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>;
}

function EligibilityChecks({ product, application, draft, assessment, complete }: {
  product: FinancingProduct; application?: FinancingApplication; draft: FinancingDraft;
  assessment: ReturnType<typeof useDemoState>["state"]["assessment"]; complete: boolean;
}) {
  const result = evaluateFinancing(product, application?.assessment ?? assessment, draft, application?.assessmentComplete ?? complete);
  const passed = result.checks.filter(item => item.status === "pass");
  const pending = result.checks.filter(item => item.status !== "pass");
  const statusText = { pass: "Terpenuhi", fail: "Tidak sesuai", missing: "Perlu dilengkapi", unknown: "Belum diketahui" };
  function checkRow(item: typeof result.checks[number]) {
    return <div key={item.id} className="flex items-start gap-3 py-4">{item.status === "pass" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emeraldDark" /> : item.status === "fail" ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" /> : <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#795900]" />}<div className="min-w-0 flex-1"><h3 className="text-sm font-semibold leading-5">{item.label}</h3><p className={`mt-1 text-[10px] font-semibold ${item.status === "fail" ? "text-red-700" : item.status === "pass" ? "text-emeraldDark" : "text-[#795900]"}`}>{statusText[item.status]}</p><p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p></div></div>;
  }
  return <section className="py-5"><h2 className="text-base font-bold">Pemeriksaan Syarat Awal</h2><p className="mt-2 text-xs leading-5 text-muted">Berdasarkan data penilaian dan skenario yang Anda isi.</p>
    <div className="mt-4 border-l-4 border-emeraldDark bg-white px-4 py-3"><EligibilityBadge status={result.status} /><p className="mt-2 text-xs font-semibold">{passed.length} dari {result.checks.length} pemeriksaan terpenuhi</p><p className="mt-1 text-[11px] leading-5 text-muted">{pending.length ? `${pending.length} pemeriksaan masih perlu ditinjau. Lengkapi data kebutuhan dan checklist di bawah.` : "Semua pemeriksaan awal terpenuhi. Anda dapat menyiapkan draf simulasi."}</p></div>
    {pending.length > 0 && <div className="mt-5"><h3 className="text-[11px] font-bold text-muted">PERLU DITINJAU</h3><div className="divide-y divide-emeraldDark/10">{pending.map(checkRow)}</div></div>}
    {passed.length > 0 && <details className="group mt-2 border-y border-emeraldDark/15"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-emeraldDark [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Sudah Terpenuhi ({passed.length})</span><ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary><div className="divide-y divide-emeraldDark/10">{passed.map(checkRow)}</div></details>}
    <p className="mt-3 text-[10px] leading-5 text-muted">Ketentuan contoh versi {product.ruleVersion}. Bukan verifikasi atau keputusan mitra.</p>
  </section>;
}

function Simulation({ product, draft, onChange }: { product: FinancingProduct; draft: FinancingDraft; onChange?: (patch: Partial<FinancingDraft>) => void }) {
  const result = financingSimulation(product, draft);
  const label = result.kind === "profit" ? "Bagian laba mitra (contoh)" : result.kind === "rent" ? "Sewa bulanan (contoh)" : "Pembayaran bulanan (contoh)";
  return <section className="border-t border-emeraldDark/15 py-5"><h2 className="flex items-center gap-2 text-base font-bold"><Calculator className="h-4 w-4 text-emeraldDark" />Simulasi {product.akad}</h2><p className="mt-2 text-xs leading-5 text-muted">Angka berikut adalah asumsi yang bisa disesuaikan, bukan tarif atau penawaran mitra.</p>{onChange && <div className="mt-4 space-y-4"><Field label={result.kind === "profit" ? "Nisbah mitra (%)" : result.kind === "rent" ? "Asumsi sewa per bulan (% nilai aset)" : "Asumsi margin total (%)"}><input className={inputClass} type="number" inputMode="decimal" min={0} max={100} step={0.1} value={draft.pricingRate} onChange={event => onChange({ pricingRate: Number(event.target.value) })} /></Field>{result.kind === "profit" && <Field label="Asumsi laba bulanan (Rp)"><input className={inputClass} type="number" inputMode="numeric" min={0} max={1000000000000} value={draft.expectedProfit} onChange={event => onChange({ expectedProfit: Number(event.target.value) })} /></Field>}</div>}<div aria-live="polite" className="mt-4 border-l-4 border-[#d9a62e] bg-white px-4 py-3"><p className="text-xs text-muted">{label}</p><strong className="mt-1 block break-words text-xl text-emeraldDark">{formatCurrencyIDR(result.monthly)}</strong></div><dl className="mt-3">{result.kind === "purchase" && <DataRow label="Margin total contoh" value={formatCurrencyIDR(result.extra ?? 0)} />}{result.total !== null && <DataRow label={result.kind === "rent" ? "Total sewa selama tenor" : "Total harga jual contoh"} value={formatCurrencyIDR(result.total)} />}<DataRow label="Jangka waktu" value={`${draft.tenor} bulan`} /><DataRow label={result.kind === "profit" ? "Nisbah mitra" : result.kind === "rent" ? "Asumsi sewa bulanan" : "Asumsi margin total"} value={`${draft.pricingRate}%`} /></dl><p className="mt-2 text-[11px] leading-5 text-muted">{result.kind === "profit" ? "Bagian laba mengikuti laba aktual. Pengembalian modal dan pembagian risiko harus ditentukan dalam akad; tidak dihitung sebagai angsuran tetap di sini." : result.kind === "rent" ? "Simulasi hanya menghitung sewa. Biaya lain dan perpindahan kepemilikan tidak termasuk." : "Simulasi membagi harga jual contoh secara rata selama tenor. Biaya tambahan dan jadwal resmi belum tersedia."}</p></section>;
}

export default function FinancingMatchPage() {
  const { state, setState } = useDemoState();
  const [view, setView] = useState<View>("list");
  const [tab, setTab] = useState<"recommendations" | "applications">("recommendations");
  const [productId, setProductId] = useState(financingProducts[0].id);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [previewDraft, setPreviewDraft] = useState<FinancingDraft>(() => initialFinancingDraft(financingProducts[0], state.assessment));
  useEffect(() => setReady(true), []);
  const product = financingProducts.find(item => item.id === productId)!;
  const application = state.financingApplications.find(item => item.id === applicationId);
  const draft = application && view !== "detail" ? application.draft : previewDraft;
  const assessment = application && view !== "detail" ? application.assessment : state.assessment;

  function go(next: View) { setError(""); setView(next); window.scrollTo({ top: 0 }); }
  function persist(next: typeof state) {
    try { setState(next); setError(""); return true; }
    catch { setError("Perubahan belum tersimpan. Izinkan penyimpanan browser dan coba lagi."); return false; }
  }
  function openProduct(id: string) {
    const selected = financingProducts.find(item => item.id === id)!;
    setProductId(id); setApplicationId(null); setPreviewDraft(initialFinancingDraft(selected, state.assessment)); go("detail");
  }
  function startDraft() {
    const created = createFinancingApplication(state, product);
    const isNew = !state.financingApplications.some(item => item.id === created.id);
    const next = isNew ? editFinancingApplication(created.state, created.id, previewDraft) : created.state;
    if (persist(next)) { setApplicationId(created.id); go("form"); }
  }
  function openApplication(item: FinancingApplication) {
    setProductId(item.productId); setApplicationId(item.id); setConsent(false); go(item.status === "draft" ? "form" : "application");
  }
  function update(patch: Partial<FinancingDraft>) {
    if (application && view !== "detail") persist(editFinancingApplication(state, application.id, patch));
    else setPreviewDraft(current => ({ ...current, ...patch, documents: patch.documents ? { ...current.documents, ...patch.documents } : current.documents }));
  }
  function review() {
    if (!application) return;
    const invalid = validateFinancingApplication(application);
    if (invalid) { setError(invalid); return; }
    setConsent(false); go("review");
  }
  function submit() {
    if (!application) return;
    try { if (persist(submitFinancingApplication(state, application.id, consent))) { setTab("applications"); go("application"); } }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Simulasi belum berhasil dicatat."); }
  }

  if (!ready) return <div className="min-h-dvh w-full max-w-[390px] bg-mint" aria-label="Memuat pembiayaan" />;

  const alert = error && <p role="alert" className="my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">{error}</p>;
  const notice = <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" />Semua produk dan mitra di sini adalah contoh. Tidak ada data yang dikirim ke bank, BPRS, atau penyedia pembiayaan.</p>;

  if (view !== "list") return (
    <AppShell hideNavigation>
      <div className="flex items-center justify-between gap-3"><button type="button" title="Kembali" aria-label="Kembali" onClick={() => go(view === "review" ? "form" : "list")} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-emeraldDark/15 bg-white text-emeraldDark"><ArrowLeft className="h-5 w-5" /></button><span className="rounded-full bg-[#fff0c2] px-3 py-1.5 text-[10px] font-bold text-[#795900]">{view === "detail" ? "PRODUK CONTOH" : view === "form" ? "DRAF PENGAJUAN" : view === "review" ? "TINJAU SIMULASI" : "RIWAYAT SIMULASI"}</span></div>
      <h1 className="mt-5 break-words text-[24px] font-bold leading-8">{view === "detail" ? product.product : view === "form" ? "Siapkan Pengajuan" : view === "review" ? "Tinjau Pengajuan" : "Detail Pengajuan"}</h1>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted"><Building2 className="h-4 w-4 shrink-0 text-emeraldDark" />{product.partner} · {product.akad}</p>
      {view !== "detail" && notice}

      {view === "detail" && <>
        <p className="mt-4 text-sm leading-6 text-muted">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2"><EligibilityBadge status={evaluateFinancing(product, assessment, draft, state.completedAssessment).status} /><span className="text-[11px] text-muted">Kebutuhan Anda: <strong className="text-ink">{formatCurrencyIDR(draft.amount)}</strong></span></div>
        <FinancingProductDetails key={product.id} product={product} draft={draft} onChange={update} checks={<EligibilityChecks product={product} draft={draft} assessment={assessment} complete={state.completedAssessment} />} simulation={<Simulation product={product} draft={draft} onChange={update} />} />
        {notice}
        {alert}<div aria-hidden="true" className="h-24" /><div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-emeraldDark/15 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Draf lokal · Tidak dikirim ke mitra</p><Button onClick={startDraft} className="w-full"><FileText className="h-4 w-4" />{state.financingApplications.some(item=>item.productId===product.id&&item.status==="draft") ? "Lanjutkan Draf" : "Siapkan Pengajuan"}<ArrowRight className="h-4 w-4" /></Button></div>
        {!state.completedAssessment && <LinkButton href="/assessment" variant="secondary" className="mt-3 w-full">Lengkapi Penilaian Usaha</LinkButton>}
      </>}

      {view === "form" && application && <>
        <section className="mt-5 border-y border-emeraldDark/15 py-4"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-bold">Profil Usaha dalam Draf</h2><button type="button" onClick={()=>persist(editFinancingApplication(state,application.id,{},true))} className="min-h-11 text-xs font-semibold text-emeraldDark">Gunakan Data Terbaru</button></div><dl><DataRow label="Nama usaha" value={assessment.businessName} /><DataRow label="Lokasi" value={assessment.location} /><DataRow label="TaqwaScore saat disalin" value={`${application.score}/100`} /></dl><a href="/assessment" className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-emeraldDark"><Pencil className="h-3.5 w-3.5" />Perbarui Profil Usaha<ChevronRight className="h-3.5 w-3.5" /></a></section>
        <section className="space-y-5 py-5"><Field label="Nominal pengajuan (Rp)"><input className={inputClass} type="number" inputMode="numeric" min={0} max={1000000000000} value={draft.amount} onChange={event=>update({amount:Number(event.target.value)})} /></Field><Field label="Kategori tujuan"><select className={inputClass} value={draft.purpose} onChange={event=>update({purpose:event.target.value as FinancingPurpose | ""})}><option value="">Pilih tujuan</option>{Object.entries(purposeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></Field><Field label="Rincian penggunaan dana"><textarea className={`${inputClass} min-h-24 py-3 leading-5`} rows={3} maxLength={500} placeholder="Contoh: pembelian mesin produksi dan persediaan bahan baku." value={draft.purposeDetail} onChange={event=>update({purposeDetail:event.target.value})} /></Field><Field label="Wilayah usaha"><select className={inputClass} value={draft.province} onChange={event=>update({province:event.target.value})}><option value="">Pilih wilayah</option>{provinceOptions.map(value=><option key={value}>{value}</option>)}</select></Field><Field label="Lama usaha beroperasi (bulan)" hint="Opsional jika rentang pada profil sudah memenuhi syarat. Isi angka tepat jika rentangnya belum cukup jelas."><input className={inputClass} type="number" inputMode="numeric" min={0} max={1200} value={draft.operatingMonths ?? ""} placeholder="Contoh: 24" onChange={event=>update({operatingMonths:event.target.value==="" ? null : Number(event.target.value)})} /></Field><Field label="Jangka waktu"><select className={inputClass} value={draft.tenor} onChange={event=>update({tenor:Number(event.target.value)})}>{product.tenors.map(value=><option key={value} value={value}>{value} bulan</option>)}</select></Field><Field label="Kewajiban bulanan lain (Rp)" hint="Isi 0 jika tidak ada. Angka ini digunakan untuk tinjauan surplus, bukan pemeriksaan rekening."><input className={inputClass} type="number" inputMode="numeric" min={0} max={1000000000000} value={draft.monthlyObligations} onChange={event=>update({monthlyObligations:Number(event.target.value)})} /></Field></section>
        <FinancingDocuments product={product} draft={draft} onChange={update} />
        <Simulation product={product} draft={draft} onChange={update} />
        <EligibilityChecks product={product} application={application} draft={draft} assessment={assessment} complete={state.completedAssessment} />
        {alert}<Button onClick={review} className="w-full"><ClipboardCheck className="h-4 w-4" />Tinjau Pengajuan<ArrowRight className="h-4 w-4" /></Button><Button variant="ghost" className="mt-2 w-full" onClick={()=>{setTab("applications");go("list");}}>Simpan Draf & Keluar</Button><p aria-live="polite" className="mt-2 text-center text-[11px] text-muted">{error ? "Periksa pesan di atas" : "Draf tersimpan otomatis di perangkat"}</p>
      </>}

      {(view === "review" || view === "application") && application && <>
        {view === "application" && <div className="mt-5"><span className="inline-flex rounded-full bg-[#fff0c2] px-3 py-1.5 text-xs font-semibold text-[#795900]">{applicationLabels[application.status]}</span><p className="mt-2 break-all text-[10px] text-muted">Referensi lokal: {application.id}</p></div>}
        <dl className="mt-5 border-y border-emeraldDark/15 py-2"><DataRow label="Produk" value={product.product} /><DataRow label="Penerima skenario" value={`${product.partner} (mitra fiktif)`} /><DataRow label="Nama usaha" value={assessment.businessName} /><DataRow label="Nominal" value={formatCurrencyIDR(draft.amount)} /><DataRow label="Tujuan" value={draft.purpose ? purposeLabels[draft.purpose] : "Belum dipilih"} /><DataRow label="Rincian" value={draft.purposeDetail} /><DataRow label="Wilayah" value={draft.province} /><DataRow label="Dokumen siap" value={`${product.documents.filter(id=>draft.documents[id]).length}/${product.documents.length}`} /><DataRow label="Jangka waktu" value={`${draft.tenor} bulan`} /><DataRow label="Kewajiban lain / bulan" value={formatCurrencyIDR(draft.monthlyObligations)} /><DataRow label="Versi ketentuan contoh" value={application.ruleVersion} /></dl>
        <Simulation product={product} draft={draft} />
        {view === "review" ? <>
          <section className="border-t border-emeraldDark/15 py-5"><h2 className="text-sm font-bold">Pencatatan Data Simulasi</h2><p className="mt-2 text-xs leading-5 text-muted">Profil usaha, TaqwaScore saat disalin, nominal, tujuan, asumsi biaya, dan checklist dokumen akan dicatat di perangkat ini. Tidak ada penerima eksternal atau pengiriman ke mitra.</p><label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#075d46]" /><span>Saya memahami bahwa ini hanya simulasi, memeriksa data di atas, dan menyetujui pencatatannya di perangkat ini.</span></label></section>{alert}<Button disabled={!consent} className="w-full" onClick={submit}><Send className="h-4 w-4" />Catat Simulasi Pengajuan</Button><Button variant="ghost" className="mt-2 w-full" onClick={()=>go("form")}><Pencil className="h-4 w-4" />Ubah Draf</Button>
        </> : <>
          <section className="border-t border-emeraldDark/15 py-5"><h2 className="text-base font-bold">Riwayat Pengajuan</h2><ol className="mt-4 space-y-4">{application.events.map((event,index)=><li key={`${event.at}-${index}`} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emeraldDark" /><div><p className="text-xs font-semibold leading-5">{event.label}</p><time dateTime={event.at} className="mt-1 block text-[10px] text-muted">{displayDate(event.at)} WIB</time></div></li>)}</ol><div className="mt-5 flex items-start gap-3 border-t border-emeraldDark/10 pt-4"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted" /><div><p className="text-xs font-semibold text-muted">Verifikasi & Keputusan Mitra</p><p className="mt-1 text-xs leading-5 text-muted">Belum tersedia. Simulasi ini tidak menandakan data diterima, ditinjau, atau disetujui oleh mitra.</p></div></div></section>{alert}{application.status === "simulated" && <Button variant="secondary" className="w-full" onClick={()=>persist(withdrawFinancingApplication(state,application.id))}>Batalkan Simulasi</Button>}<Button variant="ghost" className="mt-2 w-full" onClick={()=>{setTab("applications");go("list");}}>Kembali ke Pengajuan Saya</Button>
        </>}
      </>}
    </AppShell>
  );

  return (
    <AppShell>
      <p className="flex items-center gap-2 text-[11px] font-bold text-emeraldDark"><Handshake className="h-4 w-4" />KEBUTUHAN MODAL USAHA</p><h1 className="mt-3 text-[26px] font-bold leading-8">Pembiayaan Syariah</h1><p className="mt-2 text-sm leading-6 text-muted">Bandingkan produk, cek syarat awal, dan siapkan pengajuan.</p>
      <section className="-mx-4 mt-5 border-y border-emeraldDark/10 bg-white px-5 py-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold text-muted">KEBUTUHAN DARI PENILAIAN</p><strong className="mt-1 block text-xl text-emeraldDark">{state.completedAssessment ? formatCurrencyIDR(state.assessment.financingNeed) : "Belum dinilai"}</strong></div><span className="flex items-center gap-1.5 text-xs font-semibold text-muted"><ShieldCheck className="h-4 w-4" />Mode simulasi</span></div>{state.completedAssessment && <p className="mt-2 break-words text-xs leading-5 text-muted">{state.assessment.financingPurpose || "Belum ada rincian kebutuhan. Nominal dan tujuan bisa diisi pada draf."}</p>}{!state.completedAssessment && <LinkButton href="/assessment" variant="secondary" className="mt-3 w-full">Mulai Penilaian Usaha<ArrowRight className="h-4 w-4" /></LinkButton>}</section>
      <div role="tablist" aria-label="Pembiayaan" className="mt-5 grid grid-cols-2 border-b border-emeraldDark/15"><button id="tab-recommendations" type="button" role="tab" aria-selected={tab==="recommendations"} aria-controls="financing-panel" onClick={()=>setTab("recommendations")} className={`min-h-12 border-b-2 text-xs font-bold ${tab==="recommendations" ? "border-emeraldDark text-emeraldDark" : "border-transparent text-muted"}`}>Rekomendasi</button><button id="tab-applications" type="button" role="tab" aria-selected={tab==="applications"} aria-controls="financing-panel" onClick={()=>setTab("applications")} className={`flex min-h-12 items-center justify-center gap-2 border-b-2 text-xs font-bold ${tab==="applications" ? "border-emeraldDark text-emeraldDark" : "border-transparent text-muted"}`}>Pengajuan Saya<span className="rounded-full bg-white px-1.5 text-[10px]">{state.financingApplications.length}</span></button></div>
      {alert}<section id="financing-panel" role="tabpanel" aria-labelledby={tab==="recommendations" ? "tab-recommendations" : "tab-applications"} className="py-4">
        {tab==="recommendations" ? <><p className="mb-4 text-[11px] leading-5 text-muted">Produk contoh untuk eksplorasi. Tidak ada persentase peluang persetujuan atau plafon yang dijamin.</p><div className="space-y-3">{financingProducts.map(option=>{const candidate=initialFinancingDraft(option,state.assessment);const result=evaluateFinancing(option,state.assessment,candidate,state.completedAssessment);return <article key={option.id} className="rounded-lg border border-emeraldDark/10 bg-white p-4"><div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold text-emeraldDark"><Building2 className="h-4 w-4" />{option.partner}</span><span className="rounded-full bg-[#fff0c2] px-2 py-1 text-[10px] font-semibold text-[#795900]">{option.akad}</span></div><h2 className="mt-3 text-base font-bold leading-6">{option.product}</h2><p className="mt-2 text-xs leading-5 text-muted">{option.description}</p><dl className="mt-3"><DataRow label="Nominal contoh" value={`${formatCurrencyIDR(option.minAmount)}–${formatCurrencyIDR(option.maxAmount)}`} /><DataRow label="Jangka waktu" value={`${option.tenors.join(" / ")} bulan`} /></dl><div className="mt-3"><EligibilityBadge status={result.status} /></div><button type="button" onClick={()=>openProduct(option.id)} aria-label={`Cek syarat: ${option.product}`} className="mt-3 flex min-h-11 w-full items-center justify-between border-t border-emeraldDark/10 pt-2 text-xs font-bold text-emeraldDark">Cek Syarat & Detail<ChevronRight className="h-4 w-4" /></button></article>;})}</div></> : state.financingApplications.length ? <div className="space-y-3">{[...state.financingApplications].reverse().map(item=>{const option=financingProducts.find(product=>product.id===item.productId);if(!option)return null;return <article key={item.id} className="rounded-lg border border-emeraldDark/10 bg-white p-4"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-muted">{option.partner}</span><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${item.status==="draft" ? "bg-[#d0f6ed] text-emeraldDark" : "bg-[#fff0c2] text-[#795900]"}`}>{applicationLabels[item.status]}</span></div><h2 className="mt-3 text-sm font-bold">{option.product}</h2><strong className="mt-2 block text-lg text-emeraldDark">{formatCurrencyIDR(item.draft.amount)}</strong><p className="mt-1 text-[11px] text-muted">{item.draft.tenor} bulan · {option.akad}</p><p className="mt-3 text-[10px] text-muted">Diperbarui {displayDate(item.updatedAt)} WIB</p><button type="button" onClick={()=>openApplication(item)} aria-label={`${item.status==="draft" ? "Lanjutkan draf" : "Lihat pengajuan"}: ${option.product}`} className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-emeraldDark">{item.status==="draft" ? "Lanjutkan Draf" : "Lihat Riwayat"}<ChevronRight className="h-4 w-4" /></button></article>;})}</div> : <div className="py-8 text-center"><FileText className="mx-auto h-8 w-8 text-emeraldDark" /><h2 className="mt-4 text-base font-bold">Belum Ada Pengajuan</h2><p className="mx-auto mt-2 max-w-[270px] text-xs leading-5 text-muted">Pilih produk dan siapkan draf. Anda bisa melanjutkan draf kapan saja.</p><Button variant="ghost" className="mt-4" onClick={()=>setTab("recommendations")}>Lihat Produk<ArrowRight className="h-4 w-4" /></Button></div>}
      </section>{notice}
    </AppShell>
  );
}
