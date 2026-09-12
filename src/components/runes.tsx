import { Check } from "lucide-react";
import { PIPELINE } from "@/lib/stix/runes";
import { SIGNATURE } from "@/lib/stix/styles";
import { cn } from "@/lib/utils";

export function LambdaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-accent", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-elevated" />
      <rect
        x="0.6"
        y="0.6"
        width="30.8"
        height="30.8"
        rx="7.4"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <path
        d="M9 24 L16 7 L23 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      <path d="M11.6 17.4 H20.4" stroke="currentColor" strokeWidth="2.8" strokeLinecap="butt" />
    </svg>
  );
}


export function Pipeline({
  active,
  running,
}: {
  active?: number;
  running?: boolean;
}) {
  const current = active ?? 0;
  const fill = Math.min(1, Math.max(0, current / (PIPELINE.length - 1)));

  return (
    <ol className="relative grid grid-cols-4 gap-1" aria-label="Studio tasks">
      <span className="pointer-events-none absolute top-2 right-[12%] left-[12%] h-px bg-border" aria-hidden="true" />
      <span
        className="task-fill pointer-events-none absolute top-2 left-[12%] h-px bg-accent"
        style={{ width: `calc(${fill} * 76%)` }}
        aria-hidden="true"
      />
      {PIPELINE.map((step, i) => {
        const done = i < current || (i === current && !running && current === PIPELINE.length - 1);
        const doing = running && i === current;
        const on = i <= current;
        return (
          <li key={step.id} className="relative z-[1] flex flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                "grid size-4 place-items-center rounded-full",
                done ? "bg-accent text-accent-fg" : doing ? "bg-accent/30 text-accent" : "bg-elevated text-subtle",
                !done && on && "shadow-[0_0_0_1px_var(--color-accent)]",
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-2.5" strokeWidth={3} /> : <span className="size-1 rounded-full bg-current" />}
            </span>
            <span
              className={cn(
                "text-xs tracking-wide",
                doing ? "shimmer" : on ? "text-muted" : "text-subtle",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function BrandSignature({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs tracking-wide text-subtle", className)} translate="no">
      {SIGNATURE}
    </p>
  );
}
