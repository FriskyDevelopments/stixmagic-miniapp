import { Sparkle, Scissors, Layers, SlidersHorizontal, SwatchBook } from "lucide-react";
import type { TabId } from "@/lib/stix/types";
import { cn } from "@/lib/utils";
import { LambdaMark } from "./runes";

const TABS: { id: TabId; label: string; Icon: typeof Sparkle }[] = [
  { id: "lab", label: "Style", Icon: SwatchBook },
  { id: "cut", label: "BG", Icon: Scissors },
  { id: "forge", label: "Forge", Icon: Sparkle },
  { id: "packs", label: "Packs", Icon: Layers },
  { id: "settings", label: "More", Icon: SlidersHorizontal },
];

export function TelegramShell({
  tab,
  onTab,
  children,
}: {
  tab: TabId;
  onTab: (id: TabId) => void;
  children: React.ReactNode;
}) {
  const title = TABS.find((t) => t.id === tab)?.label ?? "Style";
  const index = Math.max(0, TABS.findIndex((t) => t.id === tab));

  return (
    <div className="flex min-h-dvh justify-center bg-bg">
      <p className="pointer-events-none fixed top-1/2 left-8 hidden -translate-y-1/2 rotate-180 font-display text-xs tracking-widest text-subtle/35 lg:block [writing-mode:vertical-rl]">
        STIX MΛGIC
      </p>
      <p className="pointer-events-none fixed top-1/2 right-8 hidden -translate-y-1/2 font-display text-xs tracking-widest text-subtle/35 lg:block [writing-mode:vertical-rl]">
        Cut · Forge · Pack
      </p>

      <div className="device relative flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-bg lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:rounded-2xl">
        <header className="flex items-center gap-3 px-5 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <LambdaMark className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold tracking-widest text-fg">STIX MΛGIC</p>
            <p className="text-xs tracking-wide text-subtle">{title}</p>
          </div>
        </header>
        <div className="mx-5 h-px bg-border" />

        <main className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>

        <nav
          className="relative grid grid-cols-5 bg-surface/80 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1"
          aria-label="Primary"
        >
          <span
            className="nav-pill pointer-events-none absolute top-1 bottom-[max(0.45rem,env(safe-area-inset-bottom))] w-1/5 px-1.5"
            style={{ transform: `translateX(${index * 100}%)` }}
            aria-hidden="true"
          >
            <span className="block h-full rounded-lg bg-accent/10" />
          </span>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTab(id)}
                className={cn(
                  "relative z-[1] flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs tracking-wide",
                  active ? "text-accent" : "text-subtle hover:text-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.65} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
