import { Download, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadPng } from "@/lib/stix/export";
import { useLab } from "@/lib/stix/store";
import { cn } from "@/lib/utils";

const EMOJIS = ["✨", "🦊", "🔥", "❤️", "😂", "🧿", "⚡", "🌙", "⭐", "💀"];

export function StickerSheet({
  stickerId,
  packTitle,
  onClose,
}: {
  stickerId: string;
  packTitle: string;
  onClose: () => void;
}) {
  const sticker = useLab((s) => s.stickers.find((x) => x.id === stickerId));
  const setGlyph = useLab((s) => s.setGlyph);
  const removeSticker = useLab((s) => s.removeSticker);

  if (!sticker) return null;
  const current = sticker;

  async function download() {
    try {
      await downloadPng(`${packTitle}-${current.glyph || "sticker"}.png`, current.src);
      toast.success("Saved 512 PNG");
    } catch {
      toast.error("Could not download");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center" role="dialog" aria-modal="true" aria-label="Sticker">
      <div className="flex h-full w-full max-w-[430px] items-end bg-bg/70 lg:my-6 lg:h-[calc(100dvh-3rem)] lg:rounded-2xl" onClick={onClose}>
        <div
          className="sheet-in w-full rounded-t-2xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] hairline"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" />
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base font-semibold text-fg">Sticker</p>
            <button
              type="button"
              className="grid size-11 place-items-center text-muted"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="overflow-hidden rounded-lg hairline">
            <div className="checker aspect-square max-h-64">
              <img src={sticker.src} alt="" className="size-full object-contain" />
            </div>
          </div>
          <p className="mt-3 text-xs tracking-wide text-subtle">
            {sticker.source}
            {sticker.prompt ? ` · ${sticker.prompt}` : ""}
          </p>
          <p className="mt-4 text-xs tracking-wide text-subtle">Telegram emoji</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Telegram emoji">
            {EMOJIS.map((mark) => (
              <button
                key={mark}
                type="button"
                role="radio"
                aria-checked={sticker.glyph === mark}
                onClick={() => setGlyph(sticker.id, mark)}
                className={cn(
                  "grid size-11 place-items-center rounded-md text-lg hairline",
                  sticker.glyph === mark ? "bg-accent/10 shadow-[0_0_0_1px_var(--color-accent)]" : "bg-elevated",
                )}
              >
                {mark}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void download()}>
              <Download className="size-4" />
              PNG
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeSticker(sticker.id);
                onClose();
              }}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
