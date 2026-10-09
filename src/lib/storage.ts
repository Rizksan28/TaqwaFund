"use client";

import { defaultAssessment, defaultImprovementTasks } from "@/data/demo";
import { calculateTaqwaScore, getScorePriorities } from "@/lib/taqwa-score";
import { normalizePlanningTask, updatePlanningTask } from "@/lib/planning";
import type { AssessmentData, DemoState, ImprovementTask } from "@/types";

const STORAGE_KEY = "taqwafund-demo-state";

export function createDefaultDemoState(): DemoState {
  return {
    learningProgress: {},
    financingApplications: [],
    history: [],
    assessment: defaultAssessment,
    score: calculateTaqwaScore(defaultAssessment),
    tasks: defaultImprovementTasks,
    pastScore: 68,
    completedAssessment: false,
    assessmentProgress: {
      profile: true,
      financial: false,
      financing: false,
      sharia: true
    }
  };
}

export function readDemoState(): DemoState {
  if (typeof window === "undefined") return createDefaultDemoState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultDemoState();
    const defaults = createDefaultDemoState();
    const saved = JSON.parse(raw) as Partial<DemoState>;
    const assessment = {
      ...defaults.assessment,
      ...saved.assessment,
      shariaPractices: { ...defaults.assessment.shariaPractices, ...saved.assessment?.shariaPractices }
    };
    return {
      ...defaults,
      ...saved,
      learningProgress: saved.learningProgress && typeof saved.learningProgress === "object" && !Array.isArray(saved.learningProgress) ? saved.learningProgress : {},
      financingApplications: Array.isArray(saved.financingApplications) ? saved.financingApplications : [],
      history: Array.isArray(saved.history) ? saved.history : [],
      assessment,
      score: calculateTaqwaScore(assessment),
      assessmentProgress: {
        ...defaults.assessmentProgress,
        ...saved.assessmentProgress
      }
    } as DemoState;
  } catch {
    return createDefaultDemoState();
  }
}

export function writeDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetDemoState(): DemoState {
  const state = createDefaultDemoState();
  writeDemoState(state);
  return state;
}

export function updateAssessmentState(assessment: AssessmentData): DemoState {
  const previous = readDemoState();
  const result = calculateTaqwaScore(assessment);
  const fieldLabels: Partial<Record<keyof AssessmentData, string>> = {
    businessName: "Nama usaha", category: "Sektor", age: "Lama usaha", location: "Lokasi", employeeCount: "Tenaga kerja",
    monthlyRevenue: "Omzet", monthlyExpense: "Pengeluaran", bookkeeping: "Pencatatan", revenueStability: "Stabilitas pendapatan",
    transactionMethods: "Metode transaksi", financialSeparation: "Pemisahan dana", cashBuffer: "Dana cadangan", hasBusinessAccount: "Rekening usaha",
    financingNeed: "Kebutuhan dana", financingPurpose: "Tujuan pembiayaan", financingGoal: "Kategori pembiayaan", financingTimeline: "Waktu pembiayaan",
    hasNib: "NIB", halalStatus: "Status halal", halalCertificateNumber: "Nomor sertifikat", halalMaterials: "Bahan baku", shariaPractices: "Praktik syariah"
  };
  const changedFields = previous.completedAssessment ? (Object.keys(fieldLabels) as (keyof AssessmentData)[])
    .filter(key => JSON.stringify(previous.assessment[key]) !== JSON.stringify(assessment[key])).map(key => fieldLabels[key]!) : [];
  const state = {
    ...previous,
    assessment,
    tasks: getScorePriorities(assessment).map((priority): ImprovementTask => {
      const savedTask = previous.tasks.find(task => task.id === `score-${priority.id}`);
      return {
        ...savedTask,
        id: `score-${priority.id}`, title: priority.title, description: priority.description,
        priority: "Prioritas Tinggi", impact: `Simulasi +${priority.gain}`, progress: savedTask?.progress ?? 0,
        status: savedTask?.status ?? "Belum Dimulai", actionLabel: "Tandai Selesai"
      };
    }),
    score: result,
    history: [...previous.history, { id: crypto.randomUUID(), assessedAt: new Date().toISOString(), result, changedFields }].slice(-20),
    pastScore: previous.completedAssessment ? previous.score.score : result.score,
    completedAssessment: true,
    assessmentProgress: {
      profile: true,
      financial: true,
      financing: true,
      sharia: true
    }
  };
  writeDemoState(state);
  return state;
}

export function completeTask(taskId: string): DemoState {
  const state = readDemoState();
  const task = state.tasks.find(item => item.id === taskId);
  if (!task) return state;
  const nextState = updatePlanningTask(state, taskId, {
    steps: normalizePlanningTask(task).steps.map(step => ({ ...step, completed: true }))
  });
  writeDemoState(nextState);
  return nextState;
}
