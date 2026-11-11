export function Logo({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex shrink-0 items-center justify-center rounded-lg font-bold"
        style={{
          height: size,
          width: size,
          fontSize: size * 0.45,
          background: light ? "#ffffff" : "#111113",
          color: light ? "#111113" : "#ffffff",
        }}
      >
        S
      </span>
      <span className={light ? "text-base font-bold text-white" : "text-base font-bold text-primary"}>Sparkr</span>
    </div>
  );
}
