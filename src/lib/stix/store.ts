import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_PACK, SEED_STICKERS } from "./seed";
import type { Energy, Speed } from "./styles";
import type { LabState, Pack, Sticker, TabId } from "./types";

const SAVE_VERSION = 3;

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

const defaults: LabState = {
  version: SAVE_VERSION,
  hydrated: false,
  tab: "lab",
  packs: [SEED_PACK],
  stickers: SEED_STICKERS,
  activePackId: SEED_PACK.id,
  settings: {
    keepLight: true,
    displayName: "You",
    extraMagic: false,
    energy: "enhanced",
    speed: "normal",
    styleId: "glow",
  },
  forgeCount: 0,
};

type LabActions = {
  setTab: (tab: TabId) => void;
  setHydrated: () => void;
  setName: (displayName: string) => void;
  setKeepLight: (keepLight: boolean) => void;
  setStyle: (styleId: string) => void;
  setExtraMagic: (extraMagic: boolean) => void;
  setEnergy: (energy: Energy) => void;
  setSpeed: (speed: Speed) => void;
  setActivePack: (id: string) => void;
  createPack: (title: string) => string;
  renamePack: (id: string, title: string) => void;
  deletePack: (id: string) => void;
  addSticker: (partial: Omit<Sticker, "id" | "createdAt">) => string;
  removeSticker: (id: string) => void;
  setGlyph: (id: string, glyph: string) => void;
  bumpForge: () => boolean;
  resetLab: () => void;
};

export const useLab = create<LabState & LabActions>()(
  persist(
    (set, get) => ({
      ...defaults,
      setTab: (tab) => set({ tab }),
      setHydrated: () => set({ hydrated: true }),
      setName: (displayName) => set({ settings: { ...get().settings, displayName } }),
      setKeepLight: (keepLight) => set({ settings: { ...get().settings, keepLight } }),
      setStyle: (styleId) => set({ settings: { ...get().settings, styleId } }),
      setExtraMagic: (extraMagic) => set({ settings: { ...get().settings, extraMagic } }),
      setEnergy: (energy) => set({ settings: { ...get().settings, energy } }),
      setSpeed: (speed) => set({ settings: { ...get().settings, speed } }),
      setActivePack: (id) => set({ activePackId: id }),
      createPack: (title) => {
        const id = uid("pack");
        const shortName =
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "")
            .slice(0, 32) || "pack";
        const pack: Pack = { id, title: title.trim() || "Untitled pack", shortName, createdAt: Date.now() };
        set({ packs: [pack, ...get().packs], activePackId: id });
        return id;
      },
      renamePack: (id, title) =>
        set({
          packs: get().packs.map((p) => (p.id === id ? { ...p, title } : p)),
        }),
      deletePack: (id) => {
        const packs = get().packs.filter((p) => p.id !== id);
        const next = packs[0] ?? SEED_PACK;
        const stickers = get().stickers.filter((s) => s.packId !== id);
        set({
          packs: packs.length ? packs : [SEED_PACK],
          stickers: packs.length ? stickers : SEED_STICKERS,
          activePackId: next.id,
        });
      },
      addSticker: (partial) => {
        const sticker: Sticker = { ...partial, id: uid("st"), createdAt: Date.now() };
        set({ stickers: [sticker, ...get().stickers] });
        return sticker.id;
      },
      removeSticker: (id) => set({ stickers: get().stickers.filter((s) => s.id !== id) }),
      setGlyph: (id, glyph) =>
        set({
          stickers: get().stickers.map((s) => (s.id === id ? { ...s, glyph } : s)),
        }),
      bumpForge: () => {
        if (get().forgeCount >= 6) return false;
        set({ forgeCount: get().forgeCount + 1 });
        return true;
      },
      resetLab: () => set({ ...defaults, hydrated: true }),
    }),
    {
      name: "stix-magic-v3",
      skipHydration: true,
      partialize: (s) => ({
        version: s.version,
        packs: s.packs,
        stickers: s.stickers,
        activePackId: s.activePackId,
        settings: s.settings,
        forgeCount: s.forgeCount,
      }),
    },
  ),
);
