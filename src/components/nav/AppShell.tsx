"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Home, Swords, Map, LineChart, CircleUserRound, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config/app";
import { getDB } from "@/lib/db/db";
import { CURRENT_USER_ID } from "@/lib/db/repo";
import { DebugPanel } from "@/components/dev/DebugPanel";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/journey", label: "Journey", icon: Map },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/you", label: "You", icon: CircleUserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isSos = pathname?.startsWith("/battle/sos");
  const isOnboarding = pathname?.startsWith("/onboarding");
  const profileQuery = useLiveQuery(
    async () => ({ profile: await getDB().userProfile.get(CURRENT_USER_ID) }),
    [],
    "loading" as const
  );
  const profileLoading = profileQuery === "loading";
  const profile = profileLoading ? undefined : profileQuery.profile;

  useEffect(() => {
    if (isOnboarding || profileLoading) return;
    if (!profile || !profile.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isOnboarding, profileLoading, profile, router]);

  if (isOnboarding) {
    return (
      <div className="min-h-dvh bg-[var(--bg)]">
        {children}
        <DebugPanel />
      </div>
    );
  }

  if (profileLoading || !profile || !profile.onboardingComplete) {
    return <div className="min-h-dvh bg-[var(--bg)]" />;
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)] lg:flex">
      {!isSos && (
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--border)] lg:px-4 lg:py-6">
          <div className="mb-8 px-3 text-lg font-bold tracking-tight">{APP_NAME}</div>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} variant="side" />
            ))}
          </nav>
          <div className="mt-auto">
            <Link
              href="/battle/sos"
              className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--danger)] px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame size={18} /> I WANT TO SMOKE
            </Link>
          </div>
        </aside>
      )}

      <div className="flex min-h-dvh flex-1 flex-col">
        <main className={cn("flex-1", !isSos && "pb-24 lg:pb-8")}>{children}</main>

        {!isSos && (
          <>
            <Link
              href="/battle/sos"
              className="fixed bottom-24 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-[var(--danger)] px-5 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(220,59,59,0.5)] transition-transform hover:scale-105 active:scale-95 lg:hidden"
              aria-label="I want to smoke — start a craving battle"
            >
              <Flame size={20} />
              SOS
            </Link>

            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
              <div className="flex items-stretch justify-around">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} variant="bottom" />
                ))}
              </div>
            </nav>
          </>
        )}
        <DebugPanel />
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  variant,
}: {
  item: (typeof NAV_ITEMS)[number];
  pathname: string | null;
  variant: "side" | "bottom";
}) {
  const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
  const Icon = item.icon;

  if (variant === "bottom") {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
          active ? "text-[var(--accent)]" : "text-[var(--fg-subtle)]"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "text-[var(--fg-muted)] hover:bg-[var(--accent-soft)]/60"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={19} strokeWidth={active ? 2.4 : 2} />
      {item.label}
    </Link>
  );
}
