import type { AssessmentData, DemoState, FinancingApplication, FinancingDraft, FinancingPurpose } from "@/types";
import { financingProducts, provinceOptions } from "@/data/financing";
import type { FinancingProduct } from "@/data/financing";
import { formatCurrencyIDR } from "./format";

export type EligibilityStatus = "eligible" | "incomplete" | "mismatch" | "unknown";
export const eligibilityLabels: Record<EligibilityStatus, string> = {
  eligible: "Memenuhi syarat awal", incomplete: "Perlu dilengkapi", mismatch: "Tidak sesuai syarat awal", unknown: "Belum dapat dinilai"
};
type Check = { id: string; label: string; status: "pass" | "missing" | "fail" | "unknown"; detail: string };

export function initialFinancingDraft(product: FinancingProduct, assessment: AssessmentData): FinancingDraft {
  const purposes: Record<string, FinancingPurpose> = {
    "Pembelian Mesin / Alat Produksi": "equipment", "Modal Tambahan Bahan Baku": "inventory", "Pengembangan Cabang": "expansion",
    "Renovasi Tempat Usaha": "renovation", "Modal Kerja": "working-capital"
  };
  return {
    amount: assessment.financingNeed, tenor: product.tenors[0], purpose: purposes[assessment.financingGoal] ?? "",
    purposeDetail: assessment.financingPurpose, province: provinceOptions.find(item => assessment.location.includes(item)) ?? "",
    documents: { nib: assessment.hasNib }, monthlyObligations: 0, pricingRate: product.exampleRate,
    expectedProfit: Math.max(0, assessment.monthlyRevenue - assessment.monthlyExpense), operatingMonths: null
  };
}

export function financingSimulation(product: FinancingProduct, draft: FinancingDraft) {
  const amount = Number.isFinite(draft.amount) && draft.amount > 0 ? draft.amount : 0;
  const tenor = Number.isFinite(draft.tenor) && draft.tenor > 0 ? draft.tenor : 1;
  const rate = Number.isFinite(draft.pricingRate) ? Math.max(0, Math.min(100, draft.pricingRate)) : 0;
  if (product.akad === "Musyarakah") {
    return { kind: "profit" as const, monthly: Math.max(0, draft.expectedProfit || 0) * rate / 100, total: null, extra: null };
  }
  if (product.akad === "Ijarah") {
    const monthly = amount * rate / 100;
    return { kind: "rent" as const, monthly, total: monthly * tenor, extra: null };
  }
  const extra = amount * rate / 100;
  return { kind: "purchase" as const, monthly: (amount + extra) / tenor, total: amount + extra, extra };
}

export function evaluateFinancing(product: FinancingProduct, assessment: AssessmentData, draft: FinancingDraft, assessmentComplete: boolean) {
  const checks: Check[] = [];
  checks.push({ id: "profile", label: "Data penilaian usaha", status: assessmentComplete && assessment.businessName.trim() && assessment.location.trim() ? "pass" : "unknown", detail: assessmentComplete ? `${assessment.businessName || "Nama belum diisi"} · ${assessment.location || "Lokasi belum diisi"}` : "Selesaikan penilaian usaha terlebih dahulu." });
  const amountValid = Number.isFinite(draft.amount) && draft.amount > 0;
  checks.push({ id: "amount", label: "Nominal kebutuhan", status: !amountValid ? "unknown" : draft.amount >= product.minAmount && draft.amount <= product.maxAmount ? "pass" : "fail", detail: `Rentang contoh ${formatCurrencyIDR(product.minAmount)}–${formatCurrencyIDR(product.maxAmount)}.` });
  checks.push({ id: "purpose", label: "Tujuan pembiayaan", status: !draft.purpose ? "unknown" : product.purposes.includes(draft.purpose) ? "pass" : "fail", detail: !draft.purpose ? "Pilih kategori tujuan agar bisa dibandingkan dengan produk." : product.purposes.includes(draft.purpose) ? "Kategori tujuan sesuai dengan skenario produk." : "Kategori tujuan tidak dilayani oleh skenario produk ini." });
  const ages: Record<string, { min: number; max: number }> = {
    "< 1 Tahun": { min: 0, max: 11 }, "1–3 Tahun": { min: 12, max: 36 }, "3–5 Tahun": { min: 36, max: 60 }, "> 5 Tahun": { min: 60, max: Infinity }
  };
  const age = ages[assessment.age];
  const exactMonths = draft.operatingMonths;
  const exactAge = exactMonths !== null && Number.isInteger(exactMonths) && exactMonths >= 0 && exactMonths <= 1200;
  checks.push({ id: "age", label: "Lama usaha", status: exactAge ? exactMonths >= product.minAgeMonths ? "pass" : "fail" : !age ? "unknown" : age.min >= product.minAgeMonths ? "pass" : age.max < product.minAgeMonths ? "fail" : "unknown", detail: `Minimum contoh ${product.minAgeMonths} bulan. Data Anda: ${exactAge ? `${exactMonths} bulan` : assessment.age || "belum diisi"}${!exactAge && age && age.min < product.minAgeMonths && age.max >= product.minAgeMonths ? "; isi lama usaha dalam bulan pada draf untuk memastikan syarat ini" : ""}.` });
  checks.push({ id: "province", label: "Wilayah layanan", status: !draft.province ? "unknown" : !product.provinces || product.provinces.includes(draft.province) ? "pass" : "fail", detail: product.provinces ? `Wilayah contoh: ${product.provinces.join(", ")}.` : "Skenario tersedia untuk semua wilayah yang dipilih." });
  checks.push({ id: "tenor", label: "Jangka waktu", status: product.tenors.includes(draft.tenor) ? "pass" : "fail", detail: `Pilihan contoh: ${product.tenors.join(", ")} bulan.` });
  const missingDocuments = product.documents.filter(id => !draft.documents[id]);
  checks.push({ id: "documents", label: "Kesiapan dokumen", status: missingDocuments.length ? "missing" : "pass", detail: `${product.documents.length - missingDocuments.length} dari ${product.documents.length} dokumen dinyatakan siap. Belum ada verifikasi dokumen.` });
  const simulation = financingSimulation(product, draft);
  const surplus = assessment.monthlyRevenue - assessment.monthlyExpense;
  const obligationsValid = Number.isFinite(draft.monthlyObligations) && draft.monthlyObligations >= 0;
  checks.push({ id: "cash", label: "Tinjauan surplus operasional", status: !assessmentComplete || !obligationsValid ? "unknown" : surplus <= 0 || (simulation.kind !== "profit" && simulation.monthly + draft.monthlyObligations > surplus) ? "missing" : "pass", detail: surplus <= 0 ? "Belum ada surplus operasional positif. Tinjau kembali data keuangan." : simulation.kind === "profit" ? "Laba aktual dan pengembalian modal perlu ditinjau dalam akad; bukan angsuran tetap." : `Surplus ${formatCurrencyIDR(surplus)} dibanding pembayaran contoh dan kewajiban lain ${formatCurrencyIDR(simulation.monthly + (draft.monthlyObligations || 0))}. Bukan batas kemampuan pembiayaan.` });
  const status: EligibilityStatus = checks.some(item => item.status === "fail") ? "mismatch" : checks.some(item => item.status === "unknown") ? "unknown" : checks.some(item => item.status === "missing") ? "incomplete" : "eligible";
  return { status, checks };
}

export function createFinancingApplication(state: DemoState, product: FinancingProduct): { state: DemoState; id: string } {
  const existing = state.financingApplications.find(item => item.productId === product.id && item.status === "draft");
  if (existing) return { state, id: existing.id };
  const now = new Date().toISOString();
  const application: FinancingApplication = {
    id: crypto.randomUUID(), productId: product.id, status: "draft", draft: initialFinancingDraft(product, state.assessment),
    assessment: structuredClone(state.assessment), score: state.score.score, assessmentComplete: state.completedAssessment,
    ruleVersion: product.ruleVersion, createdAt: now, updatedAt: now, events: [{ at: now, label: "Draf pengajuan dibuat" }]
  };
  return { state: { ...state, financingApplications: [...state.financingApplications, application] }, id: application.id };
}

export function editFinancingApplication(state: DemoState, id: string, patch: Partial<FinancingDraft>, refreshAssessment = false): DemoState {
  return { ...state, financingApplications: state.financingApplications.map(item => item.id !== id || item.status !== "draft" ? item : {
    ...item, draft: { ...item.draft, ...patch, documents: patch.documents ? { ...item.draft.documents, ...patch.documents } : item.draft.documents },
    ...(refreshAssessment ? { assessment: structuredClone(state.assessment), score: state.score.score, assessmentComplete: state.completedAssessment } : {}),
    updatedAt: new Date().toISOString()
  }) };
}

export function validateFinancingApplication(application: FinancingApplication): string | null {
  const product = financingProducts.find(item => item.id === application.productId);
  if (!product) return "Produk tidak ditemukan.";
  if (application.status !== "draft") return "Pengajuan ini tidak dapat diubah atau dikirim ulang.";
  if (!application.draft.purposeDetail.trim()) return "Isi rincian tujuan penggunaan dana.";
  if (application.draft.operatingMonths !== null && (!Number.isInteger(application.draft.operatingMonths) || application.draft.operatingMonths < 0 || application.draft.operatingMonths > 1200)) return "Isi lama usaha dalam bulan dengan nilai yang valid.";
  if (!Number.isFinite(application.draft.pricingRate) || application.draft.pricingRate < 0 || application.draft.pricingRate > 100 || !Number.isFinite(application.draft.expectedProfit) || application.draft.expectedProfit < 0) return "Periksa nilai asumsi simulasi.";
  if (evaluateFinancing(product, application.assessment, application.draft, application.assessmentComplete).status !== "eligible") return "Lengkapi data dan sesuaikan syarat awal sebelum menjalankan simulasi pengajuan.";
  return null;
}

export function submitFinancingApplication(state: DemoState, id: string, consent: boolean): DemoState {
  const application = state.financingApplications.find(item => item.id === id);
  if (!application) throw new Error("Draf pengajuan tidak ditemukan.");
  const error = validateFinancingApplication(application);
  if (error) throw new Error(error);
  if (!consent) throw new Error("Setujui pencatatan simulasi pengajuan terlebih dahulu.");
  const now = new Date().toISOString();
  return { ...state, financingApplications: state.financingApplications.map(item => item.id !== id ? item : {
    ...item, status: "simulated", submittedAt: now, consentAt: now, updatedAt: now,
    events: [...item.events, { at: now, label: "Simulasi pengajuan dicatat di perangkat; tidak dikirim ke mitra" }]
  }) };
}

export function withdrawFinancingApplication(state: DemoState, id: string): DemoState {
  const now = new Date().toISOString();
  return { ...state, financingApplications: state.financingApplications.map(item => item.id !== id || item.status !== "simulated" ? item : {
    ...item, status: "withdrawn", updatedAt: now, events: [...item.events, { at: now, label: "Simulasi dibatalkan; riwayat tetap tersimpan" }]
  }) };
}
