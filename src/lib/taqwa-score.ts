import type { AssessmentData, ScoreIndicator, ScoreStatus, TaqwaScoreResult } from "@/types";
import { clamp } from "./format";

export const indicatorWeights: Record<ScoreIndicator["key"], number> = {
  cashFlow: 20, records: 20, revenueStability: 15, financingCapacity: 20, businessProfile: 10, shariaReadiness: 15
};

function statusFromScore(score: number): ScoreStatus {
  if (score < 50) return "Belum Siap";
  if (score < 70) return "Perlu Ditingkatkan";
  if (score < 80) return "Cukup Siap";
  return "Siap Pembiayaan";
}

function bookkeepingScore(method: string): number {
  if (method === "Aplikasi Pembukuan") return 86;
  if (method === "Spreadsheet") return 76;
  if (method === "Catatan Manual" || method === "Semi teratur") return 60;
  return 42;
}

export function calculateTaqwaScore(assessment: AssessmentData): TaqwaScoreResult {
  const profit = assessment.monthlyRevenue - assessment.monthlyExpense;
  const margin = profit / Math.max(assessment.monthlyRevenue, 1);
  const financingRatio = assessment.financingNeed / Math.max(profit, 1);
  const practiceCount = Object.values(assessment.shariaPractices).filter(Boolean).length;
  const hasHalalEvidence = assessment.halalStatus === "Sudah Memiliki" || assessment.halalStatus === "Tidak Relevan untuk Jenis Usaha";
  const indicators: ScoreIndicator[] = [
    { key: "cashFlow", label: "Arus Kas", value: clamp(Math.round(55 + margin * 45)), description: profit <= 0 ? "Pengeluaran sama dengan atau melebihi omzet. Tinjau biaya dan pendapatan usaha." : `Selisih omzet dan biaya sebesar ${Math.round(margin * 100)}% dari omzet bulanan.` },
    { key: "records", label: "Pencatatan Keuangan", value: bookkeepingScore(assessment.bookkeeping), description: assessment.bookkeeping === "Aplikasi Pembukuan" ? "Anda menggunakan aplikasi pembukuan untuk mencatat keuangan." : assessment.bookkeeping === "Spreadsheet" ? "Anda menggunakan spreadsheet. Jaga konsistensi pencatatan dan rekonsiliasi." : assessment.bookkeeping === "Catatan Manual" || assessment.bookkeeping === "Semi teratur" ? "Catatan masih manual. Pencatatan digital dapat membantu keterlacakan transaksi." : "Pencatatan belum teratur. Mulai mencatat pemasukan dan pengeluaran harian." },
    { key: "revenueStability", label: "Stabilitas Pendapatan", value: assessment.revenueStability === "stabil" ? 82 : assessment.revenueStability === "cukup" ? 72 : assessment.revenueStability === "fluktuatif" ? 54 : 42, description: assessment.revenueStability === "stabil" ? "Pendapatan dinyatakan stabil oleh Anda." : assessment.revenueStability === "cukup" ? "Pendapatan cukup stabil, berdasarkan jawaban Anda." : "Pendapatan berfluktuasi. Pantau pola pemasukan sebelum menambah kewajiban." },
    { key: "financingCapacity", label: "Kesiapan Pembiayaan", value: clamp(Math.round(78 - financingRatio * 8)), description: assessment.financingNeed === 0 ? "Belum ada kebutuhan pembiayaan. Kapasitas untuk nominal tertentu belum diuji." : profit <= 0 ? "Belum ada surplus operasional untuk menopang kebutuhan dana yang diisi." : `Kebutuhan dana setara ${financingRatio.toFixed(1)} kali surplus bulanan. Ini bukan perhitungan kemampuan angsuran.` },
    { key: "businessProfile", label: "Profil Usaha", value: assessment.businessName.trim() && assessment.location.trim() && assessment.employeeCount ? 80 : 58, description: assessment.businessName.trim() && assessment.location.trim() ? "Nama, lokasi, dan skala usaha sudah diisi. Identitas belum diverifikasi." : "Lengkapi identitas dan lokasi agar profil usaha dapat ditinjau." },
    { key: "shariaReadiness", label: "Kesiapan Syariah", value: clamp(55 + practiceCount * 5 + (hasHalalEvidence ? 8 : 0)), description: `${practiceCount} dari 4 praktik usaha dinyatakan terpenuhi. Status halal: ${assessment.halalStatus.toLowerCase()}.` }
  ];
  const weighted = indicators.reduce((total, indicator) => total + indicator.value * indicatorWeights[indicator.key] / 100, 0);
  const readinessPenalty = (assessment.financialSeparation !== "Sudah Dipisahkan" ? 1 : 0) + (assessment.cashBuffer === "Tidak Ada" || assessment.cashBuffer === "< 1 Bulan Biaya" ? 1 : 0);
  const score = clamp(Math.round(weighted - readinessPenalty));
  return {
    score, status: statusFromScore(score), indicators,
    strengths: indicators.filter(item => item.value >= 70).sort((a, b) => b.value - a.value).slice(0, 3).map(item => `${item.label}: ${item.description}`),
    weaknesses: indicators.filter(item => item.value < 70).sort((a, b) => a.value - b.value).map(item => item.label)
  };
}

export type ScorePriority = { id: string; title: string; description: string; patch: Partial<AssessmentData>; gain: number };

export function getScorePriorities(assessment: AssessmentData): ScorePriority[] {
  const actions: Omit<ScorePriority, "gain">[] = [];
  if (bookkeepingScore(assessment.bookkeeping) < 86) actions.push({ id: "records", title: "Rapikan pencatatan keuangan", description: "Catat transaksi secara konsisten dengan aplikasi pembukuan. Simulasi mengubah metode pencatatan menjadi aplikasi.", patch: { bookkeeping: "Aplikasi Pembukuan" } });
  if (assessment.financialSeparation !== "Sudah Dipisahkan") actions.push({ id: "separation", title: "Pisahkan uang pribadi dan usaha", description: "Pisahkan seluruh aliran dana pribadi dari usaha agar catatan lebih mudah ditinjau.", patch: { financialSeparation: "Sudah Dipisahkan" } });
  if (assessment.cashBuffer === "Tidak Ada" || assessment.cashBuffer === "< 1 Bulan Biaya") actions.push({ id: "buffer", title: "Bangun dana cadangan operasional", description: "Sisihkan surplus secara bertahap. Simulasi menggunakan cadangan 1–3 bulan biaya.", patch: { cashBuffer: "1–3 Bulan Biaya" } });
  if (assessment.revenueStability !== "stabil") actions.push({ id: "stability", title: "Perkuat stabilitas pendapatan", description: "Pantau pola pemasukan dan pelanggan berulang. Simulasi mengasumsikan pendapatan menjadi stabil.", patch: { revenueStability: "stabil" } });
  if (assessment.monthlyExpense >= assessment.monthlyRevenue && assessment.monthlyRevenue > 0) actions.push({ id: "costs", title: "Tinjau biaya operasional", description: "Cari pengeluaran yang dapat dihemat. Simulasi menurunkan biaya menjadi 80% dari omzet, bukan target yang dijamin.", patch: { monthlyExpense: Math.round(assessment.monthlyRevenue * 0.8) } });
  if (Object.values(assessment.shariaPractices).some(value => !value)) actions.push({ id: "sharia", title: "Tinjau praktik usaha syariah", description: "Tinjau produk dan transparansi transaksi. Simulasi mengasumsikan empat praktik usaha terpenuhi, bukan sertifikasi kepatuhan.", patch: { shariaPractices: { prohibitedProductsFree: true, noMaysir: true, transparentTransactions: true, understandsRiba: true } } });
  const surplus = assessment.monthlyRevenue - assessment.monthlyExpense;
  if (surplus > 0 && assessment.financingNeed > surplus * 2) actions.push({ id: "financing", title: "Tinjau kembali kebutuhan dana", description: "Bandingkan skenario kebutuhan dana lebih kecil. Simulasi memakai dua kali surplus bulanan, bukan batas pembiayaan atau kemampuan angsuran.", patch: { financingNeed: surplus * 2 } });
  const baseline = calculateTaqwaScore(assessment).score;
  return actions.map(action => ({ ...action, gain: calculateTaqwaScore({ ...assessment, ...action.patch }).score - baseline })).sort((a, b) => b.gain - a.gain).slice(0, 3);
}

export function simulateScore(assessment: AssessmentData, priorities: ScorePriority[], selected: string[]): TaqwaScoreResult {
  const projected = priorities.filter(item => selected.includes(item.id)).reduce((current, item) => ({ ...current, ...item.patch }), assessment);
  return calculateTaqwaScore(projected);
}
