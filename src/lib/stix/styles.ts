export type FinishKind = "clean" | "soft" | "glow" | "aura";
export type Energy = "clean" | "enhanced" | "intense";
export type Speed = "slow" | "normal" | "fast";

export type StickerStyle = {
  id: string;
  name: string;
  finish: string;
  finishKind: FinishKind;
  motion: string;
};

export const STICKER_STYLES: StickerStyle[] = [
  {
    id: "clean",
    name: "Clean Cut",
    finish: "Sharp edges",
    finishKind: "clean",
    motion: "Holds still",
  },
  {
    id: "soft",
    name: "Soft Edge",
    finish: "Feathered",
    finishKind: "soft",
    motion: "Eases in",
  },
  {
    id: "glow",
    name: "Glow Edge",
    finish: "Luminous",
    finishKind: "glow",
    motion: "Pulses once",
  },
  {
    id: "aura",
    name: "Aura Edge",
    finish: "Halo",
    finishKind: "aura",
    motion: "Slow orbit",
  },
  {
    id: "dream",
    name: "Dream Glow",
    finish: "Soft halo",
    finishKind: "aura",
    motion: "Drifts",
  },
  {
    id: "night",
    name: "Night Line",
    finish: "Cyan hairline",
    finishKind: "glow",
    motion: "Snaps",
  },
];

export const ENERGY_TOLERANCE: Record<Energy, number> = {
  clean: 36,
  enhanced: 58,
  intense: 92,
};

export const SIGNATURE = "Forged with a frisky paw and a daring heart";

export const FORGE_IDEAS = [
  "A stoic fox in a linen coat, three-quarter portrait",
  "A brass moth lantern, side view",
  "A stone lambda golem bust",
  "An ink kraken sigil, emblem",
  "A night moth with cyan eyes",
  "A crystal star compass, top view",
];

export function styleById(id: string): StickerStyle {
  return STICKER_STYLES.find((s) => s.id === id) ?? STICKER_STYLES[0]!;
}
