import { Button } from "@/components/ui/button";
import { BrandSignature } from "@/components/runes";
import { StyleSwatch } from "@/components/style-swatch";
import { useLab } from "@/lib/stix/store";
import { STICKER_STYLES, styleById } from "@/lib/stix/styles";
import { cn } from "@/lib/utils";

export function LabView() {
  const { settings, setStyle, setTab } = useLab();
  const selected = styleById(settings.styleId);

  return (
    <div className="stagger space-y-6 px-5 py-6">
      <section>
        <p className="text-xs tracking-widest text-accent">Sticker alchemy</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-fg">Cut. Forge. Pack.</h1>
        <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted">
          Pick a finish, delete the background or forge from an idea, then file a Telegram-ready pack.
        </p>
      </section>

      <div className="hero-float mx-auto w-52">
        <StyleSwatch
          kind={selected.finishKind}
          className="aspect-square rounded-2xl"
        />
      </div>

      <p className="text-center text-sm text-muted">
        <span className="text-fg">{selected.name}</span>
        <span className="text-subtle"> · {selected.finish}</span>
      </p>

      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Styles">
        {STICKER_STYLES.map((style) => {
          const on = style.id === selected.id;
          return (
            <li key={style.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setStyle(style.id)}
                className={cn(
                  "w-16 text-left",
                  on ? "text-fg" : "text-subtle",
                )}
                aria-pressed={on}
              >
                <StyleSwatch
                  kind={style.finishKind}
                  className={cn(
                    "aspect-square rounded-lg transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                    on ? "shadow-[0_0_0_1px_var(--color-accent)]" : "hairline",
                  )}
                />
                <span className="mt-1.5 block truncate text-center text-xs">{style.name.split(" ")[0]}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2">
        <Button className="w-full" onClick={() => setTab("cut")}>
          Delete BG
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setTab("forge")}>
          Forge from an idea
        </Button>
      </div>
      <BrandSignature />
    </div>
  );
}
