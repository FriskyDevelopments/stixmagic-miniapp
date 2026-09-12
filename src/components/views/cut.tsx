import { useEffect, useRef, useState } from "react";
import { Eraser, ImagePlus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Pipeline } from "@/components/runes";
import { Button } from "@/components/ui/button";
import { applyFinish, fileToDataUrl, magicCut, makeSampleSubject } from "@/lib/stix/cut";
import { useLab } from "@/lib/stix/store";
import { ENERGY_TOLERANCE, styleById } from "@/lib/stix/styles";
import { cn } from "@/lib/utils";

type Phase = "idle" | "running" | "ready";

export function CutView() {
  const { settings, packs, activePackId, setActivePack, addSticker, setTab } = useLab();
  const style = styleById(settings.styleId);
  const [source, setSource] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("Drop a photo. We delete the background.");
  const [error, setError] = useState<string | null>(null);
  const [erase, setErase] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);

  async function paintResult(src: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not paint cut"));
      img.src = src;
    });
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
  }

  useEffect(() => {
    if (phase !== "ready") return;
    const src = showOriginal ? source : result;
    if (src) void paintResult(src);
  }, [phase, result, source, showOriginal]);

  async function runCut(src: string) {
    setError(null);
    setShowOriginal(false);
    setPhase("running");
    setStatus("Deleting background");
    setSource(src);
    try {
      const cut = await magicCut(src, {
        tolerance: ENERGY_TOLERANCE[settings.energy],
        keepLight: settings.keepLight,
      });
      setStatus("Edge cleaned");
      const finished = await applyFinish(cut, style.finishKind);
      setResult(finished);
      setStatus("Background gone");
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the background");
      setPhase("idle");
      setStatus("Drop a photo. We delete the background.");
    }
  }

  function pointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || phase !== "ready" || showOriginal) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#7adfff";
    ctx.save();
    ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
    ctx.fillStyle = erase ? "#000" : accent;
    ctx.beginPath();
    ctx.arc(x, y, erase ? 18 : 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    await runCut(url);
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const src = canvas.toDataURL("image/png");
    addSticker({ packId: activePackId, glyph: "✨", src, source: "cut" });
    toast.success("Filed in pack");
    setTab("packs");
  }

  return (
    <div className="stagger space-y-5 px-5 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Delete BG</h1>
        <p className="mt-1 text-sm text-muted">Punch the ground. Keep the subject. {style.name}.</p>
      </div>

      <Pipeline running={phase === "running"} active={phase === "ready" ? 3 : phase === "running" ? 1 : 0} />
      <p role="status" aria-live="polite" className={cn("text-center text-sm", phase === "running" ? "shimmer" : "text-muted")}>
        {status}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />

      <div className="overflow-hidden rounded-2xl hairline">
        <div className="checker relative aspect-square">
          <canvas
            ref={canvasRef}
            className={phase === "idle" && !result ? "hidden size-full" : "size-full touch-none"}
            onPointerDown={(e) => {
              drawing.current = true;
              (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
              pointer(e);
            }}
            onPointerMove={(e) => drawing.current && pointer(e)}
            onPointerUp={() => {
              drawing.current = false;
            }}
          />
          {phase === "idle" && !result ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted"
            >
              <ImagePlus className="size-8 text-accent" />
              <span className="text-sm">Upload a photo</span>
            </button>
          ) : null}
          {phase === "running" ? (
            <div className="absolute inset-0 grid place-items-center bg-bg/35">
              <p className="shimmer font-display text-lg">Deleting BG</p>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button className="w-full" disabled={!source || phase === "running"} onClick={() => source && void runCut(source)}>
        <RotateCcw className="size-4" />
        {phase === "running" ? "Deleting" : "Delete BG"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Upload
        </Button>
        <Button variant="secondary" onClick={() => void makeSampleSubject().then((src) => runCut(src))}>
          Use sample
        </Button>
        <Button
          variant={erase ? "primary" : "secondary"}
          disabled={phase !== "ready"}
          onClick={() => setErase((v) => !v)}
        >
          <Eraser className="size-4" />
          {erase ? "Erase" : "Keep"}
        </Button>
        <Button
          variant={showOriginal ? "primary" : "secondary"}
          disabled={phase !== "ready" || !source}
          onClick={() => setShowOriginal((v) => !v)}
        >
          {showOriginal ? "Cut" : "Original"}
        </Button>
      </div>

      <label className="block text-sm text-muted">
        Pack
        <select
          className="field"
          value={activePackId}
          onChange={(e) => setActivePack(e.target.value)}
        >
          {packs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>

      <Button className="w-full" disabled={phase !== "ready" || showOriginal} onClick={save}>
        File in pack
      </Button>
    </div>
  );
}
