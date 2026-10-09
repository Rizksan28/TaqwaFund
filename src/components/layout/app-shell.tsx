"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CheckSquare, Gauge, HandCoins, Home, UserRound } from "lucide-react";
import { hasCompletedOnboarding, MobileOnboarding } from "@/components/onboarding/mobile-onboarding";
import { useDemoState } from "@/hooks/use-demo-state";
import { BrandLogo } from "@/components/ui/brand-logo";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/score", label: "TaqwaScore", icon: Gauge },
  { href: "/planning", label: "Planning", icon: CheckSquare },
  { href: "/financing-match", label: "Pembiayaan", icon: HandCoins },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function AppShell({ children, hideNavigation = false }: { children: React.ReactNode; hideNavigation?: boolean }) {
  const pathname = usePathname();
  const { state } = useDemoState();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!hasCompletedOnboarding());
    setCheckedOnboarding(true);
  }, []);

  if (!checkedOnboarding) {
    return <div className="mobile-app min-h-dvh w-full max-w-[390px] bg-[#e5fff8]" />;
  }

  if (showOnboarding) {
    return <MobileOnboarding />;
  }

  return (
    <div className="mobile-app min-h-[844px] w-full max-w-[390px] overflow-x-hidden bg-mint shadow-[0_18px_60px_rgba(7,93,70,0.18)]">
      <header className="sticky top-0 z-20 border-b border-emeraldDark/10 bg-mint/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex items-center justify-between">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            <BrandLogo />
            <div className="min-w-0">
              <div className="text-base font-black">TaqwaFund</div>
              <p className="max-w-[210px] truncate text-xs text-muted">{state.assessment.businessName}</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <button aria-label="Notifikasi" className="relative grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-mint" />
            </button>
            <Link href="/profile" aria-label="Buka profil" className="grid h-11 w-11 place-items-center rounded-full bg-emeraldDark text-white">
              <UserRound className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className={`w-full px-4 pt-5 ${hideNavigation ? "pb-8" : "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"}`}>{children}</main>

      {!hideNavigation && <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-emeraldDark/10 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(7,93,70,0.08)] backdrop-blur">
        <div className="mx-auto grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`rounded-lg px-1 py-2 text-center text-[11px] font-semibold ${active ? "text-emeraldDark" : "text-ink"}`}>
                <Icon className={`mx-auto mb-1 h-5 w-5 ${active ? "fill-mint" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
