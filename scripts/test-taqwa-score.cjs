const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Run the repo's pure TypeScript modules without adding a test-runtime dependency.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith("@/") ? path.join(__dirname, "../src", request.slice(2)) : request, ...args);
};
require.extensions[".ts"] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  module._compile(source, filename);
};

const { defaultAssessment } = require("../src/data/demo.ts");
const { calculateTaqwaScore, getScorePriorities, simulateScore } = require("../src/lib/taqwa-score.ts");
const { updateAssessmentState, readDemoState, completeTask } = require("../src/lib/storage.ts");
const { normalizePlanningTask, updatePlanningTask, taskDeadline, jakartaDay } = require("../src/lib/planning.ts");
const { financingProducts } = require("../src/data/financing.ts");
const { lessons } = require("../src/data/learning.ts");
const { lessonProgress, updateLesson, openLessonSection, checkLessonQuiz, finishLesson, recommendedLessons, learningPercent } = require("../src/lib/learning.ts");
const { initialFinancingDraft, evaluateFinancing, financingSimulation, createFinancingApplication, editFinancingApplication, submitFinancingApplication, withdrawFinancingApplication } = require("../src/lib/financing.ts");
let values;
beforeEach(() => {
  values = new Map();
  global.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } };
});

test("learning recommendations reflect assessment gaps and unfinished lessons", () => {
  assert.equal(recommendedLessons(readDemoState())[0].lesson.id, "separation");
  const state = updateAssessmentState({ ...defaultAssessment, bookkeeping: "Tidak Ada" });
  assert.equal(recommendedLessons(state)[0].lesson.id, "records");
  const next = updateLesson(state, "records", { completed: true });
  assert.notEqual(recommendedLessons(next)[0].lesson.id, "records");
});

test("reading and quizzes enforce completion without altering business scores", () => {
  const state = updateAssessmentState(defaultAssessment);
  const lesson = lessons[0];
  assert.throws(() => checkLessonQuiz(state, lesson.id), /Jawab semua/);
  assert.throws(() => finishLesson(state, lesson.id), /Baca semua/);
  let next = openLessonSection(state, lesson.id, 0);
  next = openLessonSection(next, lesson.id, 0);
  assert.deepEqual(lessonProgress(next, lesson).readSections, [0]);
  for (let i = 1; i < lesson.sections.length; i++) next = openLessonSection(next, lesson.id, i);
  next = updateLesson(next, lesson.id, { answers: lesson.questions.map(q => (q.correct + 1) % q.options.length) });
  next = checkLessonQuiz(next, lesson.id);
  assert.equal(lessonProgress(next, lesson).bestScore, 0);
  assert.throws(() => finishLesson(next, lesson.id), /Baca semua/);
  next = updateLesson(next, lesson.id, { answers: lesson.questions.map(q => q.correct), checked: false });
  next = finishLesson(checkLessonQuiz(next, lesson.id), lesson.id);
  assert.equal(learningPercent(lessonProgress(next, lesson), lesson), 100);
  assert.deepEqual(next.score, state.score);
  assert.deepEqual(next.assessment, state.assessment);
  assert.deepEqual(next.history, state.history);
  values.set("taqwafund-demo-state", JSON.stringify(next));
  assert.deepEqual(updateAssessmentState(defaultAssessment).learningProgress, next.learningProgress);
});

test("loss-making businesses get truthful cash-flow insight and bounded scores", () => {
  const result = calculateTaqwaScore({ ...defaultAssessment, monthlyExpense: 50000000, revenueStability: "sangat_fluktuatif", transactionMethods: ["Tunai"] });
  assert.match(result.indicators.find(item => item.key === "cashFlow").description, /melebihi omzet/);
  assert(!result.strengths.some(item => item.includes("digital aktif") || item.includes("Pendapatan cukup stabil")));
  assert(result.score >= 0 && result.score <= 100);
});

test("good bookkeeping is not described as manual or insufficient", () => {
  const data = { ...defaultAssessment, financingNeed: 0, bookkeeping: "Aplikasi Pembukuan", financialSeparation: "Sudah Dipisahkan", cashBuffer: "1–3 Bulan Biaya", revenueStability: "stabil" };
  assert.match(calculateTaqwaScore(data).indicators.find(item => item.key === "records").description, /menggunakan aplikasi/);
  assert.equal(getScorePriorities(data).length, 0);
});

test("combined simulations use the real calculation and never mutate answers", () => {
  const original = structuredClone(defaultAssessment);
  const priorities = getScorePriorities(original);
  const patch = priorities.reduce((data, item) => ({ ...data, ...item.patch }), original);
  assert.deepEqual(simulateScore(original, priorities, priorities.map(item => item.id)), calculateTaqwaScore(patch));
  assert.deepEqual(original, defaultAssessment);
  assert.equal(simulateScore(original, priorities, []).score, calculateTaqwaScore(original).score);
});

test("zero financing needs are supported without claiming a financing limit", () => {
  const result = calculateTaqwaScore({ ...defaultAssessment, financingNeed: 0 });
  assert.match(result.indicators.find(item => item.key === "financingCapacity").description, /belum diuji/);
});

test("assessments persist actual history, changed fields, and previous score", () => {
  const first = updateAssessmentState(defaultAssessment);
  assert.equal(first.history.length, 1);
  assert.deepEqual(first.history[0].changedFields, []);
  const second = updateAssessmentState({ ...defaultAssessment, bookkeeping: "Aplikasi Pembukuan" });
  assert.equal(second.history.length, 2);
  assert.equal(second.pastScore, first.score.score);
  assert.deepEqual(second.history[1].changedFields, ["Pencatatan"]);
  assert.equal(readDemoState().history.length, 2);
  const unchanged = updateAssessmentState(second.assessment);
  assert.deepEqual(unchanged.history[2].changedFields, []);
});

test("completing plans does not invent a score or assessment history", () => {
  const state = updateAssessmentState(defaultAssessment);
  for (const task of state.tasks) completeTask(task.id);
  const final = readDemoState();
  assert.equal(final.score.score, state.score.score);
  assert.equal(final.history.length, 1);
  assert(final.tasks.every(task => task.status === "Selesai"));
  assert(updateAssessmentState(defaultAssessment).tasks.every(task => task.status === "Selesai"));
});

test("legacy data is read without creating a fictional history", () => {
  values.set("taqwafund-demo-state", JSON.stringify({ assessment: defaultAssessment, completedAssessment: true }));
  assert.deepEqual(readDemoState().history, []);
});

test("planning checklists progress, complete, and reopen without changing score", () => {
  const state = updateAssessmentState(defaultAssessment);
  const task = normalizePlanningTask(state.tasks[0]);
  let next = updatePlanningTask(state, task.id, { steps: task.steps.map((step, i) => ({ ...step, completed: i === 0 })) });
  assert.equal(next.tasks[0].status, "Sedang Berjalan");
  assert.equal(next.tasks[0].progress, 25);
  next = updatePlanningTask(next, task.id, { steps: task.steps.map(step => ({ ...step, completed: true })) });
  assert.equal(next.tasks[0].status, "Selesai");
  assert.equal(next.tasks[0].progress, 100);
  assert(next.tasks[0].completedAt);
  next = updatePlanningTask(next, task.id, { steps: task.steps.map((step, i) => ({ ...step, completed: i !== 0 })) });
  assert.equal(next.tasks[0].status, "Sedang Berjalan");
  assert.equal(next.tasks[0].progress, 75);
  assert.equal(next.tasks[0].completedAt, undefined);
  assert.deepEqual(next.score, state.score);
  assert.deepEqual(next.history, state.history);
});

test("notes and deadlines survive reassessment of a still-relevant task", () => {
  const state = updateAssessmentState(defaultAssessment);
  const task = state.tasks[0];
  const next = updatePlanningTask(state, task.id, { notes: "Catatan hasil uji", dueDate: "2026-10-15" });
  values.set("taqwafund-demo-state", JSON.stringify(next));
  const saved = updateAssessmentState(defaultAssessment).tasks.find(item => item.id === task.id);
  assert.equal(saved.notes, "Catatan hasil uji");
  assert.equal(saved.dueDate, "2026-10-15");
});

test("legacy partial progress is preserved without inventing checked steps", () => {
  const legacy = { id: "legacy", title: "Test", description: "", priority: "Target", impact: "", progress: 65, status: "Sedang Berjalan", actionLabel: "" };
  const task = normalizePlanningTask(legacy);
  assert.equal(task.progress, 65);
  assert(task.steps.every(step => !step.completed));
  const next = updatePlanningTask({ tasks: [legacy] }, "legacy", { notes: "Note" });
  assert.equal(normalizePlanningTask(next.tasks[0]).progress, 65);
});

test("deadlines use Jakarta calendar dates and ignore completed tasks", () => {
  assert.equal(jakartaDay(new Date("2026-10-08T18:00:00Z")), "2026-10-09");
  assert.equal(taskDeadline({ status: "Sedang Berjalan", dueDate: "2026-10-08" }, "2026-10-09"), "overdue");
  assert.equal(taskDeadline({ status: "Belum Dimulai", dueDate: "2026-10-09" }, "2026-10-09"), "today");
  assert.equal(taskDeadline({ status: "Selesai", dueDate: "2026-10-08" }, "2026-10-09"), "done");
});

function readyFinancingDraft(product) {
  return { ...initialFinancingDraft(product, defaultAssessment), documents: Object.fromEntries(product.documents.map(id => [id, true])) };
}

test("financing evaluates all four preliminary statuses without using score thresholds", () => {
  const product = financingProducts[0];
  const draft = readyFinancingDraft(product);
  assert.equal(evaluateFinancing(product, defaultAssessment, draft, true).status, "eligible");
  assert.equal(evaluateFinancing(product, defaultAssessment, { ...draft, amount: 1 }, true).status, "mismatch");
  assert.equal(evaluateFinancing(product, defaultAssessment, { ...draft, documents: {} }, true).status, "incomplete");
  assert.equal(evaluateFinancing(product, defaultAssessment, draft, false).status, "unknown");
  assert.equal(evaluateFinancing(product, defaultAssessment, { ...draft, amount: 0 }, true).status, "unknown");
});

test("ambiguous business-age ranges are resolved by explicit months", () => {
  const product = financingProducts[1];
  const assessment = { ...defaultAssessment, age: "1–3 Tahun" };
  const draft = readyFinancingDraft(product);
  assert.equal(evaluateFinancing(product, assessment, draft, true).status, "unknown");
  assert.equal(evaluateFinancing(product, assessment, { ...draft, operatingMonths: 24 }, true).status, "eligible");
  assert.equal(evaluateFinancing(product, assessment, { ...draft, operatingMonths: 12 }, true).status, "mismatch");
  assert.equal(evaluateFinancing(product, defaultAssessment, { ...draft, province: "Jawa Timur" }, true).status, "mismatch");
});

test("simulations distinguish purchase price, asset rent, and profit sharing", () => {
  const base = { ...readyFinancingDraft(financingProducts[0]), amount: 10000000, tenor: 10, pricingRate: 20, expectedProfit: 2000000 };
  assert.deepEqual(financingSimulation(financingProducts[0], base), { kind: "purchase", monthly: 1200000, total: 12000000, extra: 2000000 });
  assert.deepEqual(financingSimulation(financingProducts[1], { ...base, pricingRate: 2 }), { kind: "rent", monthly: 200000, total: 2000000, extra: null });
  assert.deepEqual(financingSimulation(financingProducts[2], base), { kind: "profit", monthly: 400000, total: null, extra: null });
});

test("high example payments require a review of the operating surplus", () => {
  const product = financingProducts[0];
  const assessment = { ...defaultAssessment, monthlyRevenue: 20000000, monthlyExpense: 19900000 };
  assert.equal(evaluateFinancing(product, assessment, readyFinancingDraft(product), true).status, "incomplete");
});

test("drafts are reused, editable, and persisted through the existing storage", () => {
  const state = updateAssessmentState(defaultAssessment);
  const created = createFinancingApplication(state, financingProducts[0]);
  assert.equal(createFinancingApplication(created.state, financingProducts[0]).id, created.id);
  const edited = editFinancingApplication(created.state, created.id, { purposeDetail: "Mesin produksi", documents: { identity: true } });
  values.set("taqwafund-demo-state", JSON.stringify(edited));
  const saved = readDemoState().financingApplications[0];
  assert.equal(saved.draft.purposeDetail, "Mesin produksi");
  assert.equal(saved.draft.documents.identity, true);
  assert.equal(saved.draft.documents.nib, true);
  assert.equal(saved.assessment.businessName, defaultAssessment.businessName);
});

test("simulated submissions enforce consent and requirements, and prevent duplicate sending", () => {
  const state = updateAssessmentState(defaultAssessment);
  const product = financingProducts[0];
  const created = createFinancingApplication(state, product);
  assert.throws(() => submitFinancingApplication(created.state, created.id, true), /Lengkapi data/);
  const ready = editFinancingApplication(created.state, created.id, readyFinancingDraft(product));
  assert.throws(() => submitFinancingApplication(ready, created.id, false), /Setujui/);
  const submitted = submitFinancingApplication(ready, created.id, true);
  const application = submitted.financingApplications[0];
  assert.equal(application.status, "simulated");
  assert(application.consentAt);
  assert.match(application.events.at(-1).label, /tidak dikirim ke mitra/);
  assert.throws(() => submitFinancingApplication(submitted, created.id, true), /tidak dapat/);
  assert.equal(editFinancingApplication(submitted, created.id, { amount: 1 }).financingApplications[0].draft.amount, application.draft.amount);
  const withdrawn = withdrawFinancingApplication(submitted, created.id);
  assert.equal(withdrawn.financingApplications[0].status, "withdrawn");
  assert.equal(withdrawn.financingApplications[0].events.length, 3);
  assert.deepEqual(submitted.score, state.score);
});

test("application assessment snapshots do not silently change after re-assessment", () => {
  const state = updateAssessmentState(defaultAssessment);
  const created = createFinancingApplication(state, financingProducts[0]);
  const changed = { ...created.state, assessment: { ...defaultAssessment, businessName: "Usaha Baru" } };
  assert.equal(changed.financingApplications[0].assessment.businessName, defaultAssessment.businessName);
  assert.equal(editFinancingApplication(changed, created.id, {}, true).financingApplications[0].assessment.businessName, "Usaha Baru");
  assert.deepEqual(readDemoState().financingApplications, []);
});
