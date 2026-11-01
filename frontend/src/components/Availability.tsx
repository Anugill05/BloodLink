// "use client";

// import useSWR from "swr";
// import { fetcher } from "@/lib/api";
// import { GROUPS } from "@/lib/blood";
// import type { Stats } from "@/lib/types";

// export function useStats() {
//   return useSWR<Stats>("/public/stats/", fetcher, { refreshInterval: 60000 });
// }

// export function HeroStats() {
//   const { data } = useStats();
//   const items = [
//     { k: "Ready donors", v: data?.available_donors },
//     { k: "Verified hospitals", v: data?.verified_hospitals },
//     { k: "Open right now", v: data?.open_requests },
//   ];
//   return (
//     <dl className="mt-10 grid max-w-md grid-cols-3 divide-x divide-line border-y border-line">
//       {items.map((i) => (
//         <div key={i.k} className="px-3 py-3 first:pl-0">
//           <dt className="eyebrow !text-[10px]">{i.k}</dt>
//           <dd className="mt-1 font-serif text-3xl tabular-nums">{i.v ?? "—"}</dd>
//         </div>
//       ))}
//     </dl>
//   );
// }

// export function GroupAvailability() {
//   const { data } = useStats();
//   const by = data?.available_by_group;
//   const max = by ? Math.max(1, ...Object.values(by)) : 1;
//   return (
//     <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
//       {GROUPS.map((g) => {
//         const n = by?.[g] ?? 0;
//         const h = by ? Math.max(6, (n / max) * 100) : 6;
//         const scarce = by && n < 10;
//         return (
//           <div key={g} className="flex flex-col items-center">
//             <div className="relative flex h-40 w-full items-end overflow-hidden rounded-2xl border border-line bg-card">
//               <div
//                 className="w-full rounded-t-xl bg-gradient-to-t from-blood to-pulse/80 transition-[height] duration-1000"
//                 style={{ height: `${h}%` }}
//               />
//               <span className="absolute inset-x-0 top-2 text-center font-mono text-xs tabular-nums text-ink/80">{by ? n : "·"}</span>
//             </div>
//             <div className="mt-2 font-serif text-2xl">{g.replace("-", "−")}</div>
//             <div className={`font-mono text-[10px] uppercase tracking-wider ${scarce ? "text-pulse" : "text-transparent"}`}>scarce</div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { GROUPS } from "@/lib/blood";
import type { Stats } from "@/lib/types";

export function useStats() {
  return useSWR<Stats>("/public/stats/", fetcher, { refreshInterval: 60000 });
}

export function HeroStats() {
  const { data } = useStats();
  const items = [
    { k: "Ready donors", v: data?.available_donors },
    { k: "Verified hospitals", v: data?.verified_hospitals },
    { k: "Open requests", v: data?.open_requests },
  ];
  return (
    <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
      {items.map((i) => (
        <div key={i.k}>
          <dd className="text-2xl font-bold tabular-nums sm:text-3xl">{i.v ?? "–"}</dd>
          <dt className="mt-1 text-xs text-muted sm:text-sm">{i.k}</dt>
        </div>
      ))}
    </dl>
  );
}

export function GroupAvailability() {
  const { data } = useStats();
  const by = data?.available_by_group;
  const max = by ? Math.max(1, ...Object.values(by)) : 1;
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {GROUPS.map((g) => {
        const n = by?.[g] ?? 0;
        const h = by ? Math.max(6, (n / max) * 100) : 6;
        const scarce = by && n < 10;
        return (
          <div key={g} className="flex flex-col items-center">
            <div className="relative flex h-36 w-full items-end overflow-hidden rounded-md border border-line bg-card">
              <div className="w-full bg-blood/80 transition-[height] duration-500" style={{ height: `${h}%` }} />
              <span className="absolute inset-x-0 top-2 text-center text-xs font-semibold tabular-nums text-ink">{by ? n : ""}</span>
            </div>
            <div className="mt-2 text-lg font-bold">{g.replace("-", "−")}</div>
            <div className={`text-xs font-medium ${scarce ? "text-blood" : "text-transparent"}`}>Low</div>
          </div>
        );
      })}
    </div>
  );
}