import { BrandSignature } from "@/components/runes";
import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/stix/store";
import type { Energy, Speed } from "@/lib/stix/styles";
import { cn } from "@/lib/utils";

const ENERGIES: Energy[] = ["clean", "enhanced", "intense"];
const SPEEDS: Speed[] = ["slow", "normal", "fast"];

export function SettingsView() {
  const { settings, setName, setKeepLight, setExtraMagic, setEnergy, setSpeed, resetLab } = useLab();

  return (
    <div className="stagger space-y-6 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">More</h1>
        <p className="mt-1 text-sm text-muted">Optional extras stay quiet until you want them.</p>
      </div>

      <label className="block text-sm text-muted">
        Your name
        <input
          value={settings.displayName}
          onChange={(e) => setName(e.target.value.slice(0, 24))}
          className="field"
        />
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={settings.extraMagic}
          onChange={(e) => setExtraMagic(e.target.checked)}
          className="size-4 accent-accent"
        />
        Show lab extras
      </label>

      {settings.extraMagic ? (
        <fieldset className="space-y-4 rounded-xl bg-surface p-4 hairline">
          <legend className="px-1 text-xs tracking-wide text-subtle">Energy</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Energy">
            {ENERGIES.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={settings.energy === level}
                onClick={() => setEnergy(level)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm capitalize hairline",
                  settings.energy === level
                    ? "bg-accent/10 text-accent shadow-[0_0_0_1px_var(--color-accent)]"
                    : "text-muted",
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs tracking-wide text-subtle">Speed</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Speed">
            {SPEEDS.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={settings.speed === level}
                onClick={() => setSpeed(level)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm capitalize hairline",
                  settings.speed === level
                    ? "bg-accent/10 text-accent shadow-[0_0_0_1px_var(--color-accent)]"
                    : "text-muted",
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={settings.keepLight}
              onChange={(e) => setKeepLight(e.target.checked)}
              className="size-4 accent-accent"
            />
            Treat light ground as empty
          </label>
        </fieldset>
      ) : null}

      <section className="rounded-xl bg-surface p-4 text-sm text-muted hairline">
        <h2 className="font-display text-base font-semibold text-fg">Publish</h2>
        <p className="mt-2 leading-relaxed">
          STIX MΛGIC cuts photos and forges ideas into 512×512 stickers. Download a pack ZIP, then send the
          PNGs to @Stickers on Telegram.
        </p>
      </section>

      <BrandSignature />

      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          if (window.confirm("Reset this studio?")) resetLab();
        }}
      >
        Reset studio
      </Button>
    </div>
  );
}
