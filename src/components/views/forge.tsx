import { useState } from "react";
import { toast } from "sonner";
import { Pipeline } from "@/components/runes";
import { Button } from "@/components/ui/button";
import { applyFinish, magicCut, proceduralSticker } from "@/lib/stix/cut";
import { forgeSticker } from "@/lib/stix/forge";
import { useLab } from "@/lib/stix/store";
import { ENERGY_TOLERANCE, FORGE_IDEAS, styleById } from "@/lib/stix/styles";
import { cn } from "@/lib/utils";

export function ForgeView() {
  const { packs, activePackId, setActivePack, addSticker, bumpForge, forgeCount, setTab, settings } =
    useLab();
  const style = styleById(settings.styleId);
  const [prompt, setPrompt] = useState(FORGE_IDEAS[0]!);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const remaining = Math.max(0, 6 - forgeCount);

  async function run() {
    if (!prompt.trim() || remaining <= 0) return;
    if (!bumpForge()) return;
    setRunning(true);
    setNote("Forming the sticker");
    try {
      const res = await Promise.race([
        forgeSticker({ data: { prompt: prompt.trim() } }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 45000)),
      ]);
      let src: string;
      if (res.ok) {
        src = res.src;
        try {
          src = await magicCut(src, {
            tolerance: ENERGY_TOLERANCE[settings.energy],
            keepLight: false,
          });
          src = await applyFinish(src, style.finishKind);
        } catch {
          /* keep original */
        }
        setNote("Ready to file");
      } else {
        src = proceduralSticker(prompt);
        setNote("Studio seal · ready to file");
      }
      setPreview(src);
    } catch {
      setPreview(proceduralSticker(prompt));
      setNote("Studio seal · ready to file");
    } finally {
      setRunning(false);
    }
  }

  function save() {
    if (!preview) return;
    addSticker({
      packId: activePackId,
      glyph: "✨",
      src: preview,
      source: "forge",
      prompt: prompt.trim(),
    });
    toast.success("Filed in pack");
    setTab("packs");
  }

  return (
    <div className="stagger space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Forge</h1>
        <p className="mt-1 text-sm text-muted">
          {style.name}. Describe a subject. We apply the look.
        </p>
      </div>

      <Pipeline running={running} active={preview ? 3 : running ? 2 : 0} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-wide text-subtle">Six forges a sitting</p>
        <div className="flex gap-1" aria-label={`${remaining} remaining`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-4 rounded-full transition-colors duration-[var(--motion-quick)]",
                i < remaining ? "bg-accent" : "bg-border-strong",
              )}
            />
          ))}
        </div>
      </div>

      <label className="block text-sm text-muted">
        Idea
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 240))}
          rows={3}
          className="mt-1 w-full resize-none rounded-md bg-elevated px-3 py-2 text-sm text-fg hairline"
          placeholder="A moth lantern, side view"
        />
      </label>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FORGE_IDEAS.map((idea) => {
          const short = idea.split(",")[0]!;
          const on = prompt === idea;
          return (
            <button
              key={idea}
              type="button"
              onClick={() => setPrompt(idea)}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-xs hairline",
                on ? "bg-accent/10 text-accent shadow-[0_0_0_1px_var(--color-accent)]" : "text-muted",
              )}
            >
              {short}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl hairline">
        <div className="checker relative aspect-square">
          {preview ? (
            <img src={preview} alt="" className="size-full object-contain" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <p className={running ? "shimmer font-display text-lg" : "text-sm text-subtle"}>
                {running ? "Forming" : "Waiting"}
              </p>
            </div>
          )}
        </div>
      </div>

      {note ? (
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {note}
        </p>
      ) : null}

      <label className="block text-sm text-muted">
        Pack
        <select className="field" value={activePackId} onChange={(e) => setActivePack(e.target.value)}>
          {packs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>

      <Button className="w-full" disabled={running || remaining <= 0} onClick={() => void run()}>
        {running ? "Forming" : remaining <= 0 ? "Sitting complete" : "Forge"}
      </Button>
      <Button variant="secondary" className="w-full" disabled={!preview} onClick={save}>
        File in pack
      </Button>
    </div>
  );
}
