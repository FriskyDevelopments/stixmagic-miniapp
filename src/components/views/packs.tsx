import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { StickerSheet } from "@/components/sticker-sheet";
import { Button } from "@/components/ui/button";
import { downloadPackZip } from "@/lib/stix/export";
import { useLab } from "@/lib/stix/store";
import { cn } from "@/lib/utils";

export function PacksView() {
  const { packs, stickers, activePackId, setActivePack, createPack, deletePack, setTab } = useLab();
  const [title, setTitle] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const pack = packs.find((p) => p.id === activePackId) ?? packs[0];
  const items = stickers.filter((s) => s.packId === pack?.id);

  async function exportPack() {
    if (!pack || items.length === 0) return;
    setExporting(true);
    try {
      await downloadPackZip(
        pack.title,
        items.map((s) => s.src),
      );
      toast.success("Pack ZIP saved");
    } catch {
      toast.error("Could not export pack");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="stagger space-y-5 px-5 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Packs</h1>
          <p className="mt-1 text-sm text-muted">512 PNGs, ready for @Stickers.</p>
        </div>
        <span className="text-xs tracking-wide text-subtle tabular-nums">{items.length} / 120</span>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          createPack(title.trim());
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 40))}
          placeholder="New pack name"
          className="field mt-0 min-w-0 flex-1"
        />
        <Button type="submit" size="icon" aria-label="Create pack" disabled={!title.trim()}>
          <Plus className="size-4" />
        </Button>
      </form>

      <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Packs">
        {packs.map((p) => {
          const count = stickers.filter((s) => s.packId === p.id).length;
          const on = p.id === pack?.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setActivePack(p.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-sm hairline",
                  on ? "bg-accent/10 text-accent shadow-[0_0_0_1px_var(--color-accent)]" : "text-muted",
                )}
              >
                {p.title}
                <span className="ml-2 tabular-nums text-subtle">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {pack ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface px-4 py-3 hairline">
          <div className="min-w-0">
            <p className="font-display font-semibold text-fg">{pack.title}</p>
            <p className="text-xs text-subtle">Send the ZIP to @Stickers to publish.</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Download pack"
              disabled={items.length === 0 || exporting}
              onClick={() => void exportPack()}
            >
              <Download className="size-4 text-muted" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete pack"
              onClick={() => {
                if (window.confirm(`Delete ${pack.title}?`)) deletePack(pack.id);
              }}
            >
              <Trash2 className="size-4 text-muted" />
            </Button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-xl bg-surface px-4 py-10 text-center hairline">
          <p className="text-sm text-muted">This pack is empty.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="secondary" onClick={() => setTab("cut")}>
              Delete BG
            </Button>
            <Button variant="ghost" onClick={() => setTab("forge")}>
              Forge from an idea
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2" aria-label="Stickers in pack">
          {items.map((s, i) => (
            <li
              key={s.id}
              className="stagger-item"
              style={{ animationDelay: `${40 + i * 40}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpenId(s.id)}
                className="w-full overflow-hidden rounded-xl text-left hairline hairline-hover"
              >
                <div className="checker aspect-square">
                  <img src={s.src} alt="" className="size-full object-contain" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {openId && pack ? (
        <StickerSheet stickerId={openId} packTitle={pack.shortName} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}
