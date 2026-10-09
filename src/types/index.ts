export type ScoreStatus = "Belum Siap" | "Perlu Ditingkatkan" | "Cukup Siap" | "Siap Pembiayaan";

export type User = {
  name: string;
  greetingName: string;
};

export type BusinessProfile = {
  businessName: string;
  category: string;
  age: string;
  monthlyRevenue: number;
  monthlyExpense: number;
  financingNeed: number;
  financingPurpose: string;
  transactionMethods: string[];
  bookkeeping: string;
};

export type AssessmentData = BusinessProfile & {
  hasQris: boolean;
  hasBusinessAccount: boolean;
  revenueStability: "stabil" | "cukup" | "fluktuatif" | "sangat_fluktuatif";
  financingGoal: string;
  location: string;
  employeeCount: "1–2" | "3–5" | "6–10" | ">10";
  hasNib: boolean;
  financialSeparation: "Sudah Dipisahkan" | "Sebagian" | "Belum Dipisahkan";
  cashBuffer: "Tidak Ada" | "< 1 Bulan Biaya" | "1–3 Bulan Biaya" | "> 3 Bulan Biaya";
  financingTimeline: "< 1 bulan" | "1–3 bulan" | "3–6 bulan" | "Belum ditentukan";
  halalStatus: "Sudah Memiliki" | "Sedang Dalam Proses" | "Belum Memiliki" | "Tidak Relevan untuk Jenis Usaha";
  halalCertificateNumber: string;
  halalMaterials: string[];
  shariaPractices: {
    prohibitedProductsFree: boolean;
    noMaysir: boolean;
    transparentTransactions: boolean;
    understandsRiba: boolean;
  };
};

export type ScoreIndicator = {
  key: "cashFlow" | "records" | "revenueStability" | "financingCapacity" | "businessProfile" | "shariaReadiness";
  label: string;
  value: number;
  description: string;
};

export type TaqwaScoreResult = {
  score: number;
  status: ScoreStatus;
  indicators: ScoreIndicator[];
  strengths: string[];
  weaknesses: string[];
};

export type ImprovementTask = {
  id: string;
  title: string;
  description: string;
  priority: "Selesai" | "Prioritas Tinggi" | "Target" | "Dampak";
  impact: string;
  progress: number;
  status: "Belum Dimulai" | "Sedang Berjalan" | "Selesai";
  actionLabel: string;
  steps?: { id: string; title: string; completed: boolean }[];
  dueDate?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt?: string;
};

export type FinancingOption = {
  id: string;
  partnerType: string;
  product: string;
  matchScore: number;
  purpose: string;
  estimatedRange: string;
  akad: string;
  tenor: string;
  reasons: string[];
  cta: string;
};

export type EducationContent = {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  progress: number;
  summary: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type DemoState = {
  learningProgress: Record<string, LearningProgress>;
  financingApplications: FinancingApplication[];
  history: AssessmentHistoryEntry[];
  assessment: AssessmentData;
  score: TaqwaScoreResult;
  tasks: ImprovementTask[];
  pastScore: number;
  completedAssessment: boolean;
  assessmentProgress: {
    profile: boolean;
    financial: boolean;
    financing: boolean;
    sharia: boolean;
  };
};

export type LearningProgress = {
  section: number;
  readSections: number[];
  answers: (number | null)[];
  checked: boolean;
  bestScore: number;
  completed: boolean;
  completedAt?: string;
};

export type AssessmentHistoryEntry = {
  id: string;
  assessedAt: string;
  result: TaqwaScoreResult;
  changedFields: string[];
};

export type FinancingPurpose = "equipment" | "inventory" | "renovation" | "working-capital" | "expansion";
export type FinancingDocument = "identity" | "nib" | "records" | "quotation";
export type FinancingDraft = {
  amount: number;
  tenor: number;
  purpose: FinancingPurpose | "";
  purposeDetail: string;
  province: string;
  documents: Partial<Record<FinancingDocument, boolean>>;
  monthlyObligations: number;
  pricingRate: number;
  expectedProfit: number;
  operatingMonths: number | null;
};

export type FinancingApplication = {
  id: string;
  productId: string;
  status: "draft" | "simulated" | "withdrawn";
  draft: FinancingDraft;
  assessment: AssessmentData;
  score: number;
  assessmentComplete: boolean;
  ruleVersion: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  consentAt?: string;
  events: { at: string; label: string }[];
};
