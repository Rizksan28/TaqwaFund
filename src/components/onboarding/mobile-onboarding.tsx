"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HandCoins,
  Handshake,
  HeartHandshake,
  LineChart,
  Medal,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  WalletCards
} from "lucide-react";

export const ONBOARDING_STORAGE_KEY = "taqwafund_onboarding_completed";

type HeroVariant = "assessment" | "readiness" | "matching";

type Benefit = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: "green" | "gold";
};

type OnboardingScreen = {
  badge: string;
  stepLabel: string;
  variant: HeroVariant;
  title: string;
  description: string;
  benefits: Benefit[];
};

const screens: OnboardingScreen[] = [
  {
    badge: "LANGKAH AWAL",
    stepLabel: "Tahap 1/3",
    variant: "assessment",
    title: "Kenali Kondisi Keuangan Usaha Anda",
    description:
      "Pahami kesehatan finansial dan tingkat kesiapan usaha melalui analisis sederhana sebelum mengambil pembiayaan.",
    benefits: [
      {
        title: "Analisis Kesehatan Usaha",
        description: "Pahami arus kas, pendapatan, dan pengeluaran secara sederhana.",
        icon: LineChart
      },
      {
        title: "TaqwaScore 0-100",
        description: "Ketahui tingkat kesiapan finansial berdasarkan kondisi usaha.",
        icon: Medal,
        tone: "gold"
      },
      {
        title: "Berbasis Data Usaha",
        description: "Penilaian menggunakan informasi usaha dan pencatatan yang diberikan pengguna.",
        icon: ClipboardCheck
      }
    ]
  },
  {
    badge: "KESIAPAN FINANSIAL",
    stepLabel: "Tahap 2/3",
    variant: "readiness",
    title: "Tingkatkan Kesiapan Pembiayaan",
    description:
      "Dapatkan rencana perbaikan yang relevan untuk membantu usaha Anda menjadi lebih siap sebelum mengajukan pembiayaan syariah.",
    benefits: [
      {
        title: "Rekomendasi Personal",
        description: "Dapatkan saran berdasarkan kondisi keuangan usaha Anda.",
        icon: Target
      },
      {
        title: "Planning Berbasis Analisis",
        description: "Susun langkah perbaikan arus kas dan pencatatan usaha.",
        icon: BarChart3,
        tone: "gold"
      },
      {
        title: "Edukasi Keuangan Syariah",
        description: "Pahami prinsip dan risiko pembiayaan sebelum mengambil keputusan.",
        icon: ShieldCheck
      }
    ]
  },
  {
    badge: "PEMBIAYAAN SYARIAH",
    stepLabel: "Tahap 3/3",
    variant: "matching",
    title: "Temukan Pembiayaan Syariah yang Sesuai",
    description:
      "Jelajahi alternatif pembiayaan syariah berdasarkan kebutuhan dan kesiapan usaha, secara lebih transparan dan bertanggung jawab.",
    benefits: [
      {
        title: "Financing Match",
        description: "Temukan alternatif pembiayaan syariah sesuai kebutuhan usaha.",
        icon: Handshake
      },
      {
        title: "Informasi Akad Transparan",
        description: "Pelajari akad, biaya, kewajiban, dan risiko pembiayaan.",
        icon: FileCheck2,
        tone: "gold"
      },
      {
        title: "Keputusan Lebih Terarah",
        description: "Bandingkan alternatif sebelum melanjutkan ke mitra pembiayaan.",
        icon: CheckCircle2
      }
    ]
  }
];

export function markOnboardingCompleted() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
}

export function resetOnboardingCompletion() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function hasCompletedOnboarding() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
}

export function MobileOnboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const screen = screens[activeIndex];
  const isLast = activeIndex === screens.length - 1;

  function finish() {
    markOnboardingCompleted();
    window.location.assign("/onboarding");
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    setActiveIndex((index) => index + 1);
  }

  return (
    <div className="mobile-app flex min-h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-[#e5fff8] text-[#00201b] shadow-[0_18px_60px_rgba(7,93,70,0.18)]">
      <OnboardingHeader canGoBack={activeIndex > 0} onBack={() => setActiveIndex((index) => Math.max(0, index - 1))} onSkip={finish} />

      <main className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <section className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#f6fffc] p-4 shadow-[0_8px_28px_rgba(7,93,70,0.08)]">
          <div className="absolute -right-16 -top-12 h-44 w-44 rounded-full bg-[#d5fcf2]" />
          <div className="absolute bottom-20 left-[-4.5rem] h-40 w-40 rounded-full bg-[#fdc74c]/22" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d5fcf2] px-3 py-1.5 text-[10px] font-black text-[#006a4f]">
                <BadgeCheck className="h-3.5 w-3.5" />
                {screen.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-black text-[#6a4d00]">
                <Sparkles className="h-3.5 w-3.5 text-[#d99500]" />
                {screen.stepLabel}
              </span>
            </div>

            <OnboardingHero variant={screen.variant} />

            <div className="mt-3 space-y-2">
              {screen.benefits.map((benefit) => (
                <OnboardingBenefitCard key={benefit.title} benefit={benefit} />
              ))}
            </div>
          </div>
        </section>

        <section className="shrink-0 px-2 pb-2 pt-5 text-center">
          <h1 className="text-[26px] font-black leading-[1.22] text-[#00201b]">{screen.title}</h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[13px] leading-5 text-[#35534c]">{screen.description}</p>
          <OnboardingPagination activeIndex={activeIndex} />
          <button
            type="button"
            onClick={goNext}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#078664] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(0,106,79,0.25)] transition hover:bg-[#006a4f]"
          >
            {isLast ? "Mulai Sekarang" : "Lanjut"}
            <ArrowRight className="h-4 w-4" />
          </button>
          {!isLast && (
            <button type="button" onClick={finish} className="mt-3 min-h-10 px-4 text-xs font-black text-[#006a4f]">
              Lewati ke Masuk
            </button>
          )}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#35534c]">
            <HeartHandshake className="h-3.5 w-3.5 text-[#006a4f]" />
            Dipercaya 12.000+ Pengusaha UMKM Berkah di Indonesia
          </p>
        </section>
      </main>
    </div>
  );
}

function OnboardingHeader({
  canGoBack,
  onBack,
  onSkip
}: {
  canGoBack: boolean;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <header className="flex h-[70px] shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <button
        type="button"
        aria-label="Kembali"
        onClick={onBack}
        disabled={!canGoBack}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#00201b] transition disabled:opacity-35"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <BrandLogo className="h-9 w-9" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black leading-4">TaqwaFund</p>
          <p className="truncate text-xs font-bold text-[#006a4f]">Onboarding Walkthrough</p>
        </div>
      </div>
      <button type="button" onClick={onSkip} className="min-h-10 shrink-0 px-2 text-xs font-bold text-[#35534c]">
        Lewati
      </button>
    </header>
  );
}

function OnboardingBenefitCard({ benefit }: { benefit: Benefit }) {
  const Icon = benefit.icon;
  const gold = benefit.tone === "gold";

  return (
    <article className={"flex min-h-[58px] items-center gap-3 rounded-xl p-3 " + (gold ? "bg-[#fff0c2]" : "bg-[#d5fcf2]")}>
      <span className={"grid h-10 w-10 shrink-0 place-items-center rounded-full " + (gold ? "bg-[#fdc74c] text-[#6a4d00]" : "bg-[#078664] text-white")}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 text-left">
        <h2 className="truncate text-[13px] font-black leading-4 text-[#00201b]">{benefit.title}</h2>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#35534c]">{benefit.description}</p>
      </div>
    </article>
  );
}

function OnboardingPagination({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2" aria-label={`Halaman onboarding ${activeIndex + 1} dari ${screens.length}`}>
      {screens.map((screen, index) => (
        <span
          key={screen.badge}
          className={"h-2 rounded-full transition-all " + (index === activeIndex ? "w-7 bg-[#078664]" : "w-2 bg-[#9fb8b1]")}
        />
      ))}
    </div>
  );
}

function OnboardingHero({ variant }: { variant: HeroVariant }) {
  if (variant === "readiness") return <ReadinessHero />;
  if (variant === "matching") return <MatchingHero />;
  return <AssessmentHero />;
}

function AssessmentHero() {
  return (
    <div className="relative mx-auto mt-4 h-[166px] max-w-[260px]">
      <GeometricLines />
      <div className="absolute left-11 top-2 h-[132px] w-[82px] rotate-[-5deg] rounded-[1.4rem] border-[7px] border-[#00201b] bg-white shadow-[0_14px_24px_rgba(0,32,27,0.12)]">
        <div className="mx-auto mt-2 h-1.5 w-8 rounded-full bg-[#c5eae1]" />
        <div className="px-2 pt-4">
          <div className="h-7 rounded-lg bg-[#d5fcf2]" />
          <div className="mt-3 flex h-12 items-end gap-1 rounded-lg bg-[#f5fffc] px-2 pb-2">
            <span className="h-5 flex-1 rounded-t bg-[#fdc74c]" />
            <span className="h-9 flex-1 rounded-t bg-[#078664]" />
            <span className="h-7 flex-1 rounded-t bg-[#006a4f]" />
          </div>
        </div>
      </div>
      <span className="absolute left-2 top-[50px] grid h-11 w-11 place-items-center rounded-2xl bg-[#fdc74c] text-[#6a4d00] shadow-sm">
        <WalletCards className="h-5 w-5" />
      </span>
      <span className="absolute right-7 top-8 grid h-12 w-12 place-items-center rounded-2xl bg-[#d5fcf2] text-[#006a4f] shadow-sm">
        <ReceiptText className="h-6 w-6" />
      </span>
      <div className="absolute bottom-4 right-14 rounded-2xl bg-white px-3 py-2 shadow-[0_8px_20px_rgba(7,93,70,0.12)]">
        <p className="text-[9px] font-black text-[#006a4f]">TaqwaScore</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d5fcf2] text-sm font-black text-[#006a4f]">?</span>
          <span className="text-[10px] font-bold text-[#35534c]">Analisis data</span>
        </div>
      </div>
    </div>
  );
}

function ReadinessHero() {
  return (
    <div className="relative mx-auto mt-4 h-[166px] max-w-[260px]">
      <GeometricLines />
      <div className="absolute inset-x-0 top-0 mx-auto grid h-[132px] w-[132px] place-items-center rounded-full bg-white shadow-[0_14px_28px_rgba(7,93,70,0.10)]">
        <div
          className="grid h-[116px] w-[116px] place-items-center rounded-full"
          style={{ background: "conic-gradient(#078664 0deg 292deg, #d5fcf2 292deg 360deg)" }}
        >
          <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-white text-center">
            <div>
              <p className="text-[10px] font-black tracking-wide text-[#00201b]">TAQWASCORE</p>
              <strong className="block text-[36px] leading-8 text-[#078664]">82</strong>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#fdc74c] px-3 py-1.5 text-[10px] font-black text-[#6a4d00] shadow-sm">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Siap Berkembang
      </span>
    </div>
  );
}

function MatchingHero() {
  return (
    <div className="relative mx-auto mt-4 h-[166px] max-w-[260px]">
      <GeometricLines />
      <div className="absolute left-6 top-[72px] grid h-20 w-20 place-items-center rounded-[1.4rem] bg-white shadow-[0_12px_22px_rgba(7,93,70,0.12)]">
        <Store className="h-8 w-8 text-[#006a4f]" />
        <span className="mt-[-12px] text-[10px] font-black text-[#35534c]">UMKM</span>
      </div>
      <div className="absolute right-6 top-[72px] grid h-20 w-20 place-items-center rounded-[1.4rem] bg-[#d5fcf2] shadow-[0_12px_22px_rgba(7,93,70,0.12)]">
        <Building2 className="h-8 w-8 text-[#006a4f]" />
        <span className="mt-[-12px] text-[10px] font-black text-[#35534c]">Mitra</span>
      </div>
      <span className="absolute left-1/2 top-14 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-[#fdc74c] text-[#6a4d00] shadow-sm">
        <Handshake className="h-7 w-7" />
      </span>
      <div className="absolute bottom-3 left-1/2 w-[168px] -translate-x-1/2 rounded-2xl bg-white px-3 py-2 shadow-[0_8px_20px_rgba(7,93,70,0.12)]">
        <div className="flex items-center gap-2">
          <HandCoins className="h-4 w-4 text-[#006a4f]" />
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black text-[#00201b]">Rekomendasi Akad</p>
            <p className="text-[9px] font-bold text-[#006a4f]">Murabahah • Ijarah</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeometricLines() {
  return (
    <div className="absolute inset-x-0 bottom-0 mx-auto h-[96px] max-w-[230px] opacity-70">
      <div className="absolute bottom-6 left-2 h-px w-[210px] rotate-[-15deg] bg-[#d7e9e4]" />
      <div className="absolute bottom-6 left-2 h-px w-[210px] rotate-[15deg] bg-[#d7e9e4]" />
      <div className="absolute bottom-6 left-2 h-[62px] w-[210px] rounded-[50%] border border-[#d7e9e4]" />
    </div>
  );
}
