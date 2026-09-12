import type { Energy, Speed } from "./styles";

export type TabId = "lab" | "cut" | "forge" | "packs" | "settings";

export type StickerSource = "cut" | "forge" | "seed";

export type Sticker = {
  id: string;
  packId: string;
  glyph: string;
  src: string;
  createdAt: number;
  source: StickerSource;
  prompt?: string;
};

export type Pack = {
  id: string;
  title: string;
  shortName: string;
  createdAt: number;
};

export type LabSettings = {
  keepLight: boolean;
  displayName: string;
  extraMagic: boolean;
  energy: Energy;
  speed: Speed;
  styleId: string;
};

export type LabState = {
  version: number;
  hydrated: boolean;
  tab: TabId;
  packs: Pack[];
  stickers: Sticker[];
  activePackId: string;
  settings: LabSettings;
  forgeCount: number;
};
