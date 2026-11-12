import Image from "next/image";

// Trimmed to their content bounding box so there's no dead transparent
// padding baked into the rendered size. Reused from the SparkrMedia
// template website's brand assets.
const MARK_SRC = "/images/logoSparkr-mark.png";
const MARK_ASPECT = 416 / 436;

const FULL_SRC = "/images/logoSparkr-trimmed.png";
const FULL_ASPECT = 1066 / 446;

// `light` renders just the icon mark (good contrast on the dark sidebar);
// the default renders the full icon+wordmark lockup, which needs a light
// background since the wordmark text is a fixed navy/blue, not themeable.
export function Logo({ size = 32, light = false }: { size?: number; light?: boolean }) {
  const src = light ? MARK_SRC : FULL_SRC;
  const aspect = light ? MARK_ASPECT : FULL_ASPECT;

  return (
    <Image
      src={src}
      alt="Sparkr"
      width={Math.round(size * aspect)}
      height={size}
      priority
    />
  );
}
