import type {
  AssessmentData,
  BusinessProfile,
  EducationContent,
  FinancingOption,
  ImprovementTask,
  User
} from "@/types";

export const demoUser: User = {
  name: "Aisyah",
  greetingName: "Bu Aisyah"
};

export const demoBusiness: BusinessProfile = {
  businessName: "Rumah Kue Aisyah",
  category: "Kuliner",
  age: "3 tahun",
  monthlyRevenue: 30000000,
  monthlyExpense: 20000000,
  financingNeed: 25000000,
  financingPurpose: "Membeli oven produksi",
  transactionMethods: ["QRIS", "Transfer", "Cash"],
  bookkeeping: "Semi teratur"
};

export const defaultAssessment: AssessmentData = {
  ...demoBusiness,
  category: "Kuliner & Minuman",
  age: "3–5 Tahun",
  bookkeeping: "Catatan Manual",
  transactionMethods: ["QRIS / E-Wallet", "Transfer Bank"],
  hasQris: true,
  hasBusinessAccount: true,
  revenueStability: "cukup",
  financingGoal: "Pembelian Mesin / Alat Produksi",
  location: "Bandung, Jawa Barat",
  employeeCount: "3–5",
  hasNib: true,
  financialSeparation: "Sebagian",
  cashBuffer: "< 1 Bulan Biaya",
  financingTimeline: "1–3 bulan",
  halalStatus: "Sudah Memiliki",
  halalCertificateNumber: "",
  halalMaterials: ["Menggunakan bahan berlabel halal", "Menggunakan pemasok terpercaya"],
  shariaPractices: {
    prohibitedProductsFree: true,
    noMaysir: true,
    transparentTransactions: true,
    understandsRiba: true
  }
};

export const defaultImprovementTasks: ImprovementTask[] = [
  {
    id: "reconcile-revenue",
    title: "Rapikan pencatatan transaksi harian",
    description: "Sinkronkan catatan POS, QRIS, transfer, dan transaksi tunai agar omzet bulanan mudah diverifikasi.",
    priority: "Selesai",
    impact: "+4 poin",
    progress: 100,
    status: "Selesai",
    actionLabel: "Tinjau Catatan"
  },
  {
    id: "separate-account",
    title: "Pisahkan rekening pribadi dan usaha",
    description: "Gunakan rekening khusus usaha untuk menerima pembayaran dan membayar kebutuhan operasional.",
    priority: "Prioritas Tinggi",
    impact: "+6 poin",
    progress: 65,
    status: "Sedang Berjalan",
    actionLabel: "Tandai Selesai"
  },
  {
    id: "cash-buffer",
    title: "Bangun cash-flow buffer",
    description: "Sisihkan laba usaha secara bertahap sampai tersedia dana cadangan operasional minimal 2 minggu.",
    priority: "Target",
    impact: "+5 poin",
    progress: 0,
    status: "Belum Dimulai",
    actionLabel: "Tandai Selesai"
  },
  {
    id: "proposal",
    title: "Lengkapi proposal pembelian oven",
    description: "Siapkan estimasi produksi, dampak omzet, dan jadwal utilisasi oven untuk diskusi dengan mitra.",
    priority: "Dampak",
    impact: "+4 poin",
    progress: 0,
    status: "Belum Dimulai",
    actionLabel: "Tandai Selesai"
  }
];

export const financingOptions: FinancingOption[] = [
  {
    id: "murabahah-bank",
    partnerType: "Bank Syariah Partner",
    product: "Pembiayaan Modal Kerja",
    matchScore: 94,
    purpose: "Alat produksi",
    estimatedRange: "Rp25.000.000 - Rp40.000.000",
    akad: "Murabahah",
    tenor: "12 - 24 bulan",
    reasons: ["Kebutuhan jelas untuk pembelian aset", "TaqwaScore memenuhi ambang eksplorasi", "Riwayat omzet cukup stabil"],
    cta: "Pelajari Pembiayaan"
  },
  {
    id: "bprs-investasi",
    partnerType: "BPRS Partner",
    product: "Pembiayaan Investasi",
    matchScore: 89,
    purpose: "Pengadaan oven dan perlengkapan",
    estimatedRange: "Rp20.000.000 - Rp35.000.000",
    akad: "Murabahah / Ijarah",
    tenor: "12 - 30 bulan",
    reasons: ["Cocok untuk aset produktif", "Dokumen usaha sudah cukup rapi", "Kapasitas margin mulai sehat"],
    cta: "Lihat Simulasi"
  },
  {
    id: "fintech-umkm",
    partnerType: "Fintech Syariah Partner",
    product: "Pembiayaan UMKM",
    matchScore: 84,
    purpose: "Modal kerja ringan",
    estimatedRange: "Rp10.000.000 - Rp25.000.000",
    akad: "Musyarakah",
    tenor: "6 - 18 bulan",
    reasons: ["Kebutuhan jangka pendek", "Data transaksi digital tersedia", "Target perbaikan sudah berjalan"],
    cta: "Cek Kesesuaian"
  }
];

export const educationContents: EducationContent[] = [
  {
    id: "murabahah",
    title: "Mengenal Akad Murabahah untuk Pembelian Alat Usaha",
    category: "Mengenal Pembiayaan Syariah",
    readingTime: "2 mnt",
    progress: 70,
    summary: "Pahami jual-beli dengan margin terbuka untuk pembelian oven, mesin, atau perlengkapan produksi."
  },
  {
    id: "cash-flow",
    title: "Mengelola Arus Kas Usaha Harian",
    category: "Mengelola Arus Kas Usaha",
    readingTime: "4 mnt",
    progress: 35,
    summary: "Cara sederhana memisahkan uang masuk, biaya bahan baku, cicilan, dan dana cadangan."
  },
  {
    id: "account-separation",
    title: "Memisahkan Keuangan Pribadi dan Usaha",
    category: "Kesiapan Pembiayaan",
    readingTime: "3 mnt",
    progress: 50,
    summary: "Langkah praktis agar data usaha lebih mudah dibaca oleh calon mitra pembiayaan."
  },
  {
    id: "musyarakah",
    title: "Murabahah, Mudharabah, Musyarakah, dan Ijarah",
    category: "Akad Syariah",
    readingTime: "5 mnt",
    progress: 20,
    summary: "Perbedaan high-level beberapa akad umum tanpa istilah yang terlalu akademik."
  }
];
