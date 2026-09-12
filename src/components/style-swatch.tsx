import { cn } from "@/lib/utils";
import type { FinishKind } from "@/lib/stix/styles";

export function StyleSwatch({
  kind,
  src = "/stickers/fox.png",
  className,
}: {
  kind: FinishKind;
  src?: string;
  className?: string;
}) {
  return (
    <div className={cn("checker relative overflow-hidden", className)}>
      <img
        src={src}
        alt=""
        className={cn(
          "size-full object-contain transition-[filter] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          `finish-${kind}`,
        )}
      />
    </div>
  );
}
