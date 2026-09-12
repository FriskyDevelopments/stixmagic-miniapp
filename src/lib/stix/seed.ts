import type { Pack, Sticker } from "./types";

export const SEED_PACK: Pack = {
  id: "pack-lab-marks",
  title: "Lab Marks",
  shortName: "lab_marks",
  createdAt: 0,
};

export const SEED_STICKERS: Sticker[] = [
  {
    id: "st-fox",
    packId: SEED_PACK.id,
    glyph: "🦊",
    src: "/stickers/fox.png",
    createdAt: 6,
    source: "seed",
    prompt: "Stoic fox in a linen coat",
  },
  {
    id: "st-lantern",
    packId: SEED_PACK.id,
    glyph: "🏮",
    src: "/stickers/lantern.png",
    createdAt: 5,
    source: "seed",
    prompt: "Brass moth lantern",
  },
  {
    id: "st-golem",
    packId: SEED_PACK.id,
    glyph: "🗿",
    src: "/stickers/golem.png",
    createdAt: 4,
    source: "seed",
    prompt: "Stone lambda golem",
  },
  {
    id: "st-kraken",
    packId: SEED_PACK.id,
    glyph: "🐙",
    src: "/stickers/kraken.png",
    createdAt: 3,
    source: "seed",
    prompt: "Ink kraken sigil",
  },
  {
    id: "st-moth",
    packId: SEED_PACK.id,
    glyph: "🦋",
    src: "/stickers/moth.png",
    createdAt: 2,
    source: "seed",
    prompt: "Night moth with cyan eyes",
  },
  {
    id: "st-compass",
    packId: SEED_PACK.id,
    glyph: "⭐",
    src: "/stickers/compass.png",
    createdAt: 1,
    source: "seed",
    prompt: "Crystal star compass",
  },
];
