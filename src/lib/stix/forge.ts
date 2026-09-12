import { createServerFn } from "@tanstack/react-start";

const FORGE_PROMPT = (idea: string) =>
  `Telegram sticker illustration, single centered character or object, clean graphic shapes, high contrast, dark studio void background, no text, no watermark, no border, sticker-cutout ready. Subject: ${idea.slice(0, 220)}. Style: premium geometric alchemy, cyan and ivory on ink, not cute, not childish.`;

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/png";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export const forgeSticker = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (!prompt) throw new Error("Describe the sticker");
    if (prompt.length > 240) throw new Error("Keep the idea under 240 characters");
    return { prompt };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Forge is offline in this environment", code: "offline" };
    }

    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        prompt: FORGE_PROMPT(data.prompt),
        n: 1,
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Forge failed (${res.status})`, code: "api" };
    }

    const body = (await res.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const b64 = body.data?.[0]?.b64_json;
    const url = body.data?.[0]?.url;
    if (b64) return { ok: true as const, src: `data:image/png;base64,${b64}` };
    if (url) {
      const dataUrl = await toDataUrl(url);
      if (dataUrl) return { ok: true as const, src: dataUrl };
      return { ok: true as const, src: url };
    }
    return { ok: false as const, error: "Forge returned no image", code: "empty" };
  });
