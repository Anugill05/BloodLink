// import { Radar } from "./Radar";

// const DOTS = Array.from({ length: 26 }, (_, i) => ({
//   id: `a${i}`,
//   distance_km: [2, 4, 7, 9, 12, 15, 18, 22, 26, 31, 35, 40, 44, 3, 6, 11, 14, 21, 28, 33, 38, 47, 5, 8, 16, 24][i],
//   status: (i % 7 === 0 ? "ACCEPTED" : i % 3 === 0 ? "NOTIFIED" : "IDLE") as "ACCEPTED" | "NOTIFIED" | "IDLE",
// }));

// export function AuthShell({ title, kicker, children }: { title: React.ReactNode; kicker: string; children: React.ReactNode }) {
//   return (
//     <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-16">
//       <aside className="relative hidden overflow-hidden rounded-[2rem] bg-ink p-10 text-paper lg:flex lg:flex-col">
//         <div className="eyebrow !text-paper/50">{kicker}</div>
//         <h1 className="mt-4 font-serif text-5xl leading-[1]">{title}</h1>
//         <div className="mt-auto opacity-90 [--ink:242_234_225] [--line:70_56_56] [--muted:160_146_140] [--paper:17_12_12]">
//           <Radar dots={DOTS} activeKm={25} className="mx-auto max-w-sm" />
//         </div>
//       </aside>
//       <div className="flex flex-col justify-center">{children}</div>
//     </div>
//   );
// }
import { Check } from "lucide-react";
import { LogoMark } from "./Logo";

const POINTS = [
  "Every request is verified by the treating hospital",
  "Nearest compatible donors are alerted first",
  "Phone numbers are shared only after a donor accepts",
];

export function AuthShell({ title, kicker, children }: { title: React.ReactNode; kicker: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-16">
      <aside className="hidden rounded-lg border border-line bg-card p-10 lg:flex lg:flex-col">
        <div className="flex items-center gap-2">
          <LogoMark className="h-6 w-6" />
          <span className="text-sm font-semibold text-muted">{kicker}</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight">{title}</h1>
        <ul className="mt-auto space-y-3 pt-10">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-blood" />
              {p}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex flex-col justify-center">{children}</div>
    </div>
  );
}