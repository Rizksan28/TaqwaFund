import type { FinancingDocument, FinancingPurpose } from "@/types";

export type FinancingProduct = {
  id: string;
  product: string;
  partner: string;
  akad: "Murabahah" | "Ijarah" | "Musyarakah";
  description: string;
  minAmount: number;
  maxAmount: number;
  tenors: number[];
  minAgeMonths: number;
  provinces: string[] | null;
  purposes: FinancingPurpose[];
  documents: FinancingDocument[];
  exampleRate: number;
  ruleVersion: string;
};

export const purposeLabels: Record<FinancingPurpose, string> = {
  equipment: "Mesin / alat produksi", inventory: "Bahan baku / persediaan", renovation: "Renovasi tempat usaha",
  "working-capital": "Modal kerja", expansion: "Pengembangan usaha"
};
export const documentLabels: Record<FinancingDocument, string> = {
  identity: "Identitas pemilik", nib: "Nomor Induk Berusaha (NIB)", records: "Catatan keuangan usaha", quotation: "Penawaran harga / rincian aset"
};
export const provinceOptions = ["Jawa Barat", "DKI Jakarta", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Wilayah lainnya"];

// These are fictional products and rules, not requirements from an actual lender.
export const financingProducts: FinancingProduct[] = [
  {
    id: "demo-murabahah", product: "Pembelian Aset & Persediaan", partner: "Bank Syariah Contoh", akad: "Murabahah",
    description: "Skenario jual beli aset atau persediaan dengan harga dan margin disepakati di awal.",
    minAmount: 5000000, maxAmount: 50000000, tenors: [12, 18, 24], minAgeMonths: 12, provinces: null,
    purposes: ["equipment", "inventory"], documents: ["identity", "nib", "records", "quotation"], exampleRate: 15, ruleVersion: "2026-10-09"
  },
  {
    id: "demo-ijarah", product: "Sewa Aset Produktif", partner: "BPRS Contoh", akad: "Ijarah",
    description: "Skenario sewa pemanfaatan aset. Kepemilikan tidak otomatis berpindah di akhir masa sewa.",
    minAmount: 10000000, maxAmount: 100000000, tenors: [12, 24, 36], minAgeMonths: 24, provinces: ["Jawa Barat", "DKI Jakarta", "Banten"],
    purposes: ["equipment"], documents: ["identity", "nib", "records", "quotation"], exampleRate: 2, ruleVersion: "2026-10-09"
  },
  {
    id: "demo-musyarakah", product: "Kemitraan Modal Usaha", partner: "Mitra Syariah Contoh", akad: "Musyarakah",
    description: "Skenario kemitraan modal dengan bagian laba sesuai nisbah. Laba aktual dapat berubah.",
    minAmount: 5000000, maxAmount: 30000000, tenors: [6, 12, 18], minAgeMonths: 12, provinces: null,
    purposes: ["working-capital", "inventory", "expansion"], documents: ["identity", "nib", "records"], exampleRate: 30, ruleVersion: "2026-10-09"
  }
];
