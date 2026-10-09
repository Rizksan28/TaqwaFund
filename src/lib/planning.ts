import type { AssessmentData, DemoState, ImprovementTask } from "@/types";
import { formatCurrencyIDR } from "./format";

export type PlanningTask = ImprovementTask & {
  steps: { id: string; title: string; completed: boolean }[];
  notes: string;
  dueDate: string;
};

const taskKinds: Record<string, string> = {
  "reconcile-revenue": "records", "separate-account": "separation", "cash-buffer": "buffer", proposal: "proposal"
};
const checklists: Record<string, string[]> = {
  records: ["Pilih aplikasi atau format pencatatan yang sesuai", "Catat seluruh pemasukan dan pengeluaran harian", "Cocokkan catatan dengan saldo tunai dan rekening", "Tinjau ringkasan transaksi di akhir minggu"],
  separation: ["Petakan transaksi pribadi dan transaksi usaha", "Tentukan rekening atau tempat penyimpanan dana usaha", "Alihkan transaksi usaha ke rekening atau tempat tersebut", "Catat pengambilan pribadi secara terpisah"],
  buffer: ["Hitung rata-rata biaya operasional bulanan", "Tentukan target cadangan sesuai kondisi usaha", "Sisihkan dana saat tersedia surplus operasional", "Catat saldo cadangan dan tinjau secara berkala"],
  stability: ["Catat pola pendapatan beberapa periode terakhir", "Identifikasi pelanggan dan pesanan berulang", "Susun langkah menjaga pemasukan di periode sepi", "Tinjau kembali perubahan pola pendapatan"],
  costs: ["Kelompokkan pengeluaran rutin dan tidak rutin", "Tandai biaya yang dapat ditinjau tanpa mengganggu usaha", "Catat perubahan biaya yang sudah dilakukan", "Bandingkan pengeluaran dengan omzet terbaru"],
  sharia: ["Tinjau produk dan asal bahan yang digunakan", "Tinjau transparansi harga dan ketentuan transaksi", "Periksa praktik yang belum sesuai dengan jawaban penilaian", "Catat perbaikan dan informasi yang masih perlu dikonfirmasi"],
  financing: ["Rinci kebutuhan dana sesuai tujuan usaha", "Pisahkan kebutuhan utama dan kebutuhan yang bisa ditunda", "Bandingkan beberapa skenario nominal dan biaya", "Catat nominal serta tujuan yang akan dinilai ulang"],
  proposal: ["Rinci alat atau kebutuhan yang akan dibiayai", "Kumpulkan estimasi harga dan biaya terkait", "Catat manfaat dan risiko untuk kegiatan usaha", "Susun ringkasan kebutuhan pembiayaan"],
  general: ["Tinjau kondisi usaha yang terkait dengan tugas", "Tentukan tindakan perbaikan yang dapat dilakukan", "Lakukan tindakan dan catat hasilnya", "Periksa hasil sebelum memperbarui penilaian"]
};

function taskKind(task: ImprovementTask): string {
  return task.id.startsWith("score-") ? task.id.slice(6) : taskKinds[task.id] ?? "general";
}

export function normalizePlanningTask(task: ImprovementTask): PlanningTask {
  const titles = checklists[taskKind(task)] ?? checklists.general;
  const steps = titles.map((title, index) => {
    const id = `${task.id}-step-${index + 1}`;
    return { id, title, completed: task.steps ? task.steps.some(step => step.id === id && step.completed) : task.status === "Selesai" };
  });
  const complete = steps.filter(step => step.completed).length;
  // Legacy partial percentages remain until a checklist is explicitly changed.
  const progress = task.steps ? Math.round(complete / steps.length * 100) : task.progress;
  const status = complete === steps.length ? "Selesai" : complete > 0 || task.status === "Sedang Berjalan" ? "Sedang Berjalan" : "Belum Dimulai";
  return { ...task, steps, progress, status, dueDate: task.dueDate ?? "", notes: task.notes ?? "" };
}

export function updatePlanningTask(state: DemoState, taskId: string, patch: Partial<Pick<PlanningTask, "steps" | "dueDate" | "notes" | "status">>): DemoState {
  const now = new Date().toISOString();
  return {
    ...state,
    tasks: state.tasks.map(task => {
      if (task.id !== taskId) return task;
      const current = normalizePlanningTask(task);
      const steps = patch.steps ?? current.steps;
      const complete = steps.filter(step => step.completed).length;
      const status = complete === steps.length ? "Selesai" : complete > 0 || patch.status === "Sedang Berjalan" || current.status === "Sedang Berjalan" ? "Sedang Berjalan" : "Belum Dimulai";
      return {
        ...current, ...patch, steps: patch.steps ?? task.steps, status,
        progress: patch.steps ? Math.round(complete / steps.length * 100) : current.progress,
        startedAt: current.startedAt ?? (status !== "Belum Dimulai" ? now : undefined),
        completedAt: status === "Selesai" ? current.completedAt ?? now : undefined,
        updatedAt: now
      };
    })
  };
}

export function planningReason(task: ImprovementTask, assessment: AssessmentData): { indicator: string; reason: string } {
  switch (taskKind(task)) {
    case "records": return { indicator: "Pencatatan Keuangan", reason: `Metode saat ini: ${assessment.bookkeeping}. Catatan transaksi yang konsisten memudahkan peninjauan kondisi usaha.` };
    case "separation": return { indicator: "Pemisahan Dana", reason: `Pemisahan keuangan saat ini: ${assessment.financialSeparation.toLowerCase()}. Dana pribadi dan usaha yang tercampur menyulitkan penelusuran transaksi.` };
    case "buffer": return { indicator: "Dana Cadangan", reason: `Cadangan saat ini: ${assessment.cashBuffer.toLowerCase()}. Catat dana cadangan agar kebutuhan operasional dapat dipantau.` };
    case "stability": return { indicator: "Stabilitas Pendapatan", reason: `Pola pendapatan yang Anda isi: ${assessment.revenueStability.replace("_", " ")}. Tinjau sumber pemasukan dan perubahan antarbulan.` };
    case "costs": return { indicator: "Arus Kas", reason: `Omzet ${formatCurrencyIDR(assessment.monthlyRevenue)} dan pengeluaran ${formatCurrencyIDR(assessment.monthlyExpense)} per bulan. Tinjau biaya yang memengaruhi surplus operasional.` };
    case "sharia": return { indicator: "Kesiapan Syariah", reason: `${Object.values(assessment.shariaPractices).filter(Boolean).length} dari 4 praktik dinyatakan terpenuhi. Tinjauan ini berdasarkan jawaban Anda, bukan sertifikasi kepatuhan.` };
    case "financing":
    case "proposal": return { indicator: "Kesiapan Pembiayaan", reason: `Kebutuhan dana yang diisi sebesar ${formatCurrencyIDR(assessment.financingNeed)}. Rincian kebutuhan membantu membandingkan skenario sebelum penilaian ulang.` };
    default: return { indicator: "Kesiapan Usaha", reason: task.description };
  }
}

export function jakartaDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)!.value).join("-");
}

export function taskDeadline(task: ImprovementTask, today = jakartaDay()): "none" | "overdue" | "today" | "upcoming" | "done" {
  if (task.status === "Selesai") return "done";
  if (!task.dueDate) return "none";
  return task.dueDate < today ? "overdue" : task.dueDate === today ? "today" : "upcoming";
}
