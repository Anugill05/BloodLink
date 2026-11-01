// import clsx from "clsx";
// import { Loader2 } from "lucide-react";
// import type { BloodGroup } from "@/lib/types";

// const TONES = {
//   pulse: "border-pulse/30 bg-pulse/10 text-pulse",
//   warn: "border-warn/30 bg-warn/10 text-warn",
//   ok: "border-ok/30 bg-ok/10 text-ok",
//   muted: "border-line bg-paper text-muted",
//   ink: "border-ink/20 bg-ink/5 text-ink",
// } as const;

// export function Pill({ tone = "muted", live, children, className }: { tone?: keyof typeof TONES; live?: boolean; children: React.ReactNode; className?: string }) {
//   return (
//     <span className={clsx("chip", TONES[tone], className)}>
//       {live && (
//         <span className="relative flex h-1.5 w-1.5">
//           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
//           <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
//         </span>
//       )}
//       {children}
//     </span>
//   );
// }

// /** The blood group, set like a specimen label. */
// export function GroupMark({ group, size = "md", className }: { group: BloodGroup; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
//   const abo = group.slice(0, -1);
//   const rh = group.slice(-1) === "+" ? "+" : "−";
//   const s = { sm: "h-10 w-10 text-lg", md: "h-14 w-14 text-2xl", lg: "h-20 w-20 text-4xl", xl: "h-28 w-28 text-6xl" }[size];
//   return (
//     <div className={clsx("relative grid shrink-0 place-items-center rounded-2xl bg-blood text-white", s, className)}>
//       <span className="flex items-start font-serif leading-none tracking-tight">
//         {abo}
//         <span className="ml-[0.06em] mt-[0.02em] font-sans text-[0.42em] font-semibold leading-none">{rh}</span>
//       </span>
//     </div>
//   );
// }

// export function Spinner({ className }: { className?: string }) {
//   return <Loader2 className={clsx("h-4 w-4 animate-spin", className)} />;
// }

// export function PageLoader() {
//   return (
//     <div className="grid min-h-[60vh] place-items-center">
//       <div className="flex items-center gap-3 text-muted">
//         <span className="h-3 w-3 animate-beat rounded-full bg-blood" />
//         <span className="eyebrow">Loading</span>
//       </div>
//     </div>
//   );
// }

// export function Empty({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
//   return (
//     <div className="card flex flex-col items-center px-6 py-14 text-center">
//       {icon && <div className="mb-4 text-muted">{icon}</div>}
//       <p className="font-serif text-2xl">{title}</p>
//       {children && <div className="mt-2 max-w-sm text-sm text-muted">{children}</div>}
//     </div>
//   );
// }

// export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
//   return (
//     <label className="block">
//       <span className="label">{label}</span>
//       {children}
//       {error ? <span className="mt-1 block text-xs text-pulse">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
//     </label>
//   );
// }

// export function ErrorNote({ children }: { children: React.ReactNode }) {
//   if (!children) return null;
//   return <div className="rounded-xl border border-pulse/30 bg-pulse/5 px-4 py-3 text-sm text-pulse">{children}</div>;
// }

// export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
//   return (
//     <div>
//       <div className="eyebrow">{label}</div>
//       <div className="mt-1 font-serif text-4xl leading-none tracking-tight">{value}</div>
//       {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
//     </div>
//   );
// }

// /** Thin progress rail: fulfilled (solid) + pledged (hatched) out of needed. */
// export function UnitsRail({ needed, pledged, fulfilled }: { needed: number; pledged: number; fulfilled: number }) {
//   return (
//     <div className="flex gap-1">
//       {Array.from({ length: needed }).map((_, i) => (
//         <div
//           key={i}
//           className={clsx(
//             "h-2 flex-1 rounded-full transition-colors",
//             i < fulfilled ? "bg-ok" : i < pledged ? "bg-warn/80" : "bg-line",
//           )}
//         />
//       ))}
//     </div>
//   );
// }
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import type { BloodGroup } from "@/lib/types";

const TONES = {
  pulse: "border-blood/20 bg-blood/10 text-blood",
  warn: "border-warn/30 bg-warn/10 text-warn",
  ok: "border-ok/30 bg-ok/10 text-ok",
  muted: "border-line bg-paper text-muted",
  ink: "border-ink/15 bg-ink/5 text-ink",
} as const;

export function Pill({ tone = "muted", live, children, className }: { tone?: keyof typeof TONES; live?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", TONES[tone], className)}>
      {live && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** The blood group, shown as a simple red badge. */
export function GroupMark({ group, size = "md", className }: { group: BloodGroup; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const abo = group.slice(0, -1);
  const rh = group.slice(-1) === "+" ? "+" : "−";
  const s = { sm: "h-10 w-10 text-base", md: "h-12 w-12 text-xl", lg: "h-16 w-16 text-3xl", xl: "h-24 w-24 text-5xl" }[size];
  return (
    <div className={clsx("grid shrink-0 place-items-center rounded-lg bg-blood font-bold text-white", s, className)}>
      <span className="flex items-start leading-none">
        {abo}
        <span className="ml-0.5 text-[0.55em] font-semibold leading-none">{rh}</span>
      </span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx("h-4 w-4 animate-spin", className)} />;
}

export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Loading…
      </div>
    </div>
  );
}

export function Empty({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-card px-6 py-12 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="text-lg font-semibold">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-blood">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <div className="rounded-md border border-blood/30 bg-blood/5 px-4 py-3 text-sm text-blood">{children}</div>;
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold leading-none tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}

/** Progress bar: fulfilled (green) + pledged (amber) out of needed. */
export function UnitsRail({ needed, pledged, fulfilled }: { needed: number; pledged: number; fulfilled: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: needed }).map((_, i) => (
        <div
          key={i}
          className={clsx("h-2 flex-1 rounded-full", i < fulfilled ? "bg-ok" : i < pledged ? "bg-warn/80" : "bg-line")}
        />
      ))}
    </div>
  );
}