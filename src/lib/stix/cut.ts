import type { FinishKind } from "./styles";

export type CutOptions = {
  tolerance: number;
  keepLight: boolean;
  size?: number;
};

function dist(r: number, g: number, b: number, sr: number, sg: number, sb: number) {
  const dr = r - sr;
  const dg = g - sg;
  const db = b - sb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[s.length >> 1]!;
}

function sampleBorder(data: Uint8ClampedArray, w: number, h: number) {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const take = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if ((data[i + 3] ?? 0) < 8) return;
    rs.push(data[i]!);
    gs.push(data[i + 1]!);
    bs.push(data[i + 2]!);
  };
  const step = Math.max(1, Math.floor(w / 96));
  for (let x = 0; x < w; x += step) {
    take(x, 0);
    take(x, 1);
    take(x, h - 1);
    take(x, h - 2);
  }
  for (let y = 0; y < h; y += step) {
    take(0, y);
    take(1, y);
    take(w - 1, y);
    take(w - 2, y);
  }
  const r = median(rs);
  const g = median(gs);
  const b = median(bs);
  return { r, g, b, lum: 0.2126 * r + 0.7152 * g + 0.0722 * b };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image"));
    img.src = src;
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

function floodDelete(
  data: Uint8ClampedArray,
  size: number,
  isBg: (i: number) => boolean,
) {
  const vis = new Uint8Array(size * size);
  const qx = new Int32Array(size * size);
  const qy = new Int32Array(size * size);
  let qs = 0;
  let qe = 0;
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const idx = y * size + x;
    if (vis[idx]) return;
    vis[idx] = 1;
    qx[qe] = x;
    qy[qe] = y;
    qe += 1;
  };
  for (let x = 0; x < size; x++) {
    push(x, 0);
    push(x, size - 1);
  }
  for (let y = 0; y < size; y++) {
    push(0, y);
    push(size - 1, y);
  }
  while (qs < qe) {
    const x = qx[qs]!;
    const y = qy[qs]!;
    qs += 1;
    const i = (y * size + x) * 4;
    if (!isBg(i)) continue;
    data[i + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

function featherAndDecontaminate(
  data: Uint8ClampedArray,
  size: number,
  bg: { r: number; g: number; b: number },
) {
  const alpha = new Uint8Array(size * size);
  for (let p = 0; p < size * size; p++) alpha[p] = data[p * 4 + 3]!;
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const p = y * size + x;
      if (!alpha[p]) continue;
      let n0 = 0;
      if (!alpha[p - 1]) n0 += 1;
      if (!alpha[p + 1]) n0 += 1;
      if (!alpha[p - size]) n0 += 1;
      if (!alpha[p + size]) n0 += 1;
      if (!n0) continue;
      const i = p * 4;
      const nextA = Math.max(0, alpha[p]! - 48 * n0);
      data[i + 3] = nextA;
      if (nextA === 0) continue;
      const a = nextA / 255;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      data[i] = Math.max(0, Math.min(255, Math.round((r - bg.r * (1 - a)) / a)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round((g - bg.g * (1 - a)) / a)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round((b - bg.b * (1 - a)) / a)));
    }
  }
}

function autocrop(ctx: CanvasRenderingContext2D, size: number, pad = 0.08) {
  const image = ctx.getImageData(0, 0, size, size);
  const { data } = image;
  let minX = size;
  let minY = size;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3]! < 18) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return;
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const side = Math.max(bw, bh);
  const margin = Math.round(side * pad);
  const cx = minX + bw / 2;
  const cy = minY + bh / 2;
  const half = side / 2 + margin;
  const sx = Math.max(0, Math.floor(cx - half));
  const sy = Math.max(0, Math.floor(cy - half));
  const sw = Math.min(size - sx, Math.ceil(half * 2));
  const sh = Math.min(size - sy, Math.ceil(half * 2));
  const cut = ctx.getImageData(sx, sy, sw, sh);
  ctx.clearRect(0, 0, size, size);
  const scale = Math.min(size / sw, size / sh) * 0.92;
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));
  const tmp = document.createElement("canvas");
  tmp.width = sw;
  tmp.height = sh;
  const tctx = tmp.getContext("2d");
  if (!tctx) return;
  tctx.putImageData(cut, 0, 0);
  ctx.drawImage(tmp, Math.round((size - dw) / 2), Math.round((size - dh) / 2), dw, dh);
}

export async function magicCut(src: string, options: CutOptions): Promise<string> {
  const img = await loadImage(src);
  const size = options.size ?? 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");

  const scale = Math.min(size / img.width, size / img.height) * 0.94;
  const dw = Math.round(img.width * scale);
  const dh = Math.round(img.height * scale);
  const dx = Math.round((size - dw) / 2);
  const dy = Math.round((size - dh) / 2);
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, dw, dh);

  const image = ctx.getImageData(0, 0, size, size);
  const { data } = image;
  const bg = sampleBorder(data, size, size);
  const tol = options.tolerance;
  const feather = Math.max(14, Math.round(tol * 0.45));

  const isBg = (i: number) => {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;
    if (a < 10) return true;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const mx = Math.max(r, g, b);
    const sat = mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx;
    if (options.keepLight && lum > 232 && sat < 0.16) return true;
    if (!options.keepLight && bg.lum < 48 && lum < 22) return true;
    return dist(r, g, b, bg.r, bg.g, bg.b) <= tol;
  };

  floodDelete(data, size, isBg);

  const softBg = (i: number) => {
    if (data[i + 3]! === 0) return true;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    return dist(r, g, b, bg.r, bg.g, bg.b) <= tol + feather;
  };
  floodDelete(data, size, (i) => {
    if (!softBg(i)) return false;
    const x = (i / 4) % size;
    const y = Math.floor(i / 4 / size);
    const nearGone =
      (x > 0 && data[i - 4 + 3] === 0) ||
      (x < size - 1 && data[i + 4 + 3] === 0) ||
      (y > 0 && data[i - size * 4 + 3] === 0) ||
      (y < size - 1 && data[i + size * 4 + 3] === 0);
    return nearGone;
  });

  featherAndDecontaminate(data, size, bg);
  ctx.putImageData(image, 0, 0);
  autocrop(ctx, size);
  return canvas.toDataURL("image/png");
}

export async function applyFinish(src: string, kind: FinishKind): Promise<string> {
  if (kind === "clean") return src;
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.clearRect(0, 0, 512, 512);
  if (kind === "soft") {
    ctx.filter = "blur(1.4px)";
    ctx.drawImage(img, 0, 0, 512, 512);
    ctx.filter = "none";
    return canvas.toDataURL("image/png");
  }
  if (kind === "aura") {
    ctx.shadowColor = "rgba(122, 223, 255, 0.55)";
    ctx.shadowBlur = 36;
    ctx.drawImage(img, 0, 0, 512, 512);
    ctx.shadowBlur = 0;
    ctx.drawImage(img, 0, 0, 512, 512);
    return canvas.toDataURL("image/png");
  }
  ctx.shadowColor = "rgba(122, 223, 255, 0.9)";
  ctx.shadowBlur = 18;
  ctx.drawImage(img, 0, 0, 512, 512);
  ctx.shadowBlur = 0;
  ctx.drawImage(img, 0, 0, 512, 512);
  return canvas.toDataURL("image/png");
}

export async function makeSampleSubject(): Promise<string> {
  return "/samples/figurine.jpg";
}

export function proceduralSticker(prompt: string): string {
  const seed = hashPrompt(prompt || "lambda");
  let n = seed % 97;
  const rand = () => {
    n += 1;
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.clearRect(0, 0, 512, 512);
  const rings = 3 + Math.floor(rand() * 3);
  ctx.strokeStyle = "#7adfff";
  ctx.lineWidth = 5;
  for (let i = 0; i < rings; i++) {
    ctx.beginPath();
    ctx.arc(256, 256, 70 + i * 42, 0, Math.PI * 2);
    ctx.globalAlpha = 0.35 + i * 0.12;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#e8eef4";
  const sides = 3 + Math.floor(rand() * 4);
  const r = 88 + rand() * 36;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = 256 + Math.cos(a) * r;
    const y = 256 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#07090d";
  ctx.font = "600 120px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const marks = ["Λ", "⟪", "⟐", "◫", "→"];
  const mark = marks[Math.floor(rand() * marks.length)] ?? "Λ";
  ctx.fillText(mark, 256, 268);
  return canvas.toDataURL("image/png");
}

export function hashPrompt(prompt: string): number {
  let h = 2166136261;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
