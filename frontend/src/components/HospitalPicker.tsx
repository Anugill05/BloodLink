// "use client";

// import clsx from "clsx";
// import { useEffect, useState } from "react";
// import useSWR from "swr";
// import { Check, LocateFixed, Search } from "lucide-react";
// import { fetcher } from "@/lib/api";
// import type { Hospital, Paginated } from "@/lib/types";
// import { Spinner } from "./ui";

// export function HospitalPicker({ value, onChange }: { value: Hospital | null; onChange: (h: Hospital) => void }) {
//   const [q, setQ] = useState("");
//   const [debounced, setDebounced] = useState("");
//   const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
//   const [locating, setLocating] = useState(false);
//   useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t); }, [q]);

//   const params = new URLSearchParams({ limit: "6" });
//   if (debounced) params.set("q", debounced);
//   if (here) { params.set("lat", String(here.lat)); params.set("lng", String(here.lng)); }
//   const { data, isLoading } = useSWR<Paginated<Hospital>>(`/hospitals/?${params}`, fetcher, { keepPreviousData: true });

//   const locate = () => {
//     setLocating(true);
//     navigator.geolocation?.getCurrentPosition(
//       (p) => { setHere({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
//       () => setLocating(false),
//       { timeout: 8000 },
//     );
//   };

//   return (
//     <div className="card overflow-hidden">
//       <div className="flex items-center gap-2 border-b border-line p-2">
//         <Search className="ml-2 h-4 w-4 shrink-0 text-muted" />
//         <input className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-muted/70" placeholder="Search hospital or city" value={q} onChange={(e) => setQ(e.target.value)} />
//         <button type="button" onClick={locate} className="chip shrink-0 hover:text-ink">
//           {locating ? <Spinner className="h-3 w-3" /> : <LocateFixed className="h-3 w-3" />} Near me
//         </button>
//       </div>
//       <ul className="max-h-72 divide-y divide-line overflow-y-auto">
//         {isLoading && !data && <li className="p-4 text-sm text-muted">Loading hospitals…</li>}
//         {data?.results.length === 0 && <li className="p-4 text-sm text-muted">No verified hospital matches. Ask the ward to onboard on BloodLink.</li>}
//         {data?.results.map((h) => {
//           const on = value?.id === h.id;
//           return (
//             <li key={h.id}>
//               <button type="button" onClick={() => onChange(h)} className={clsx("flex w-full items-center gap-3 px-4 py-3 text-left transition", on ? "bg-blood/5" : "hover:bg-ink/[.03]")}>
//                 <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-full border", on ? "border-blood bg-blood text-white" : "border-line")}>
//                   {on && <Check className="h-3 w-3" />}
//                 </span>
//                 <span className="min-w-0 flex-1">
//                   <span className="block truncate text-sm font-medium">{h.name}</span>
//                   <span className="block truncate text-xs text-muted">{h.address}, {h.city}</span>
//                 </span>
//                 {h.distance_km != null && <span className="font-mono text-xs text-muted">{h.distance_km} km</span>}
//               </button>
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Check, LocateFixed, Search } from "lucide-react";
import { fetcher } from "@/lib/api";
import type { Hospital, Paginated } from "@/lib/types";
import { Spinner } from "./ui";

export function HospitalPicker({ value, onChange }: { value: Hospital | null; onChange: (h: Hospital) => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t); }, [q]);

  const params = new URLSearchParams({ limit: "6" });
  if (debounced) params.set("q", debounced);
  if (here) { params.set("lat", String(here.lat)); params.set("lng", String(here.lng)); }
  const { data, isLoading } = useSWR<Paginated<Hospital>>(`/hospitals/?${params}`, fetcher, { keepPreviousData: true });

  const locate = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (p) => { setHere({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { timeout: 8000 },
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line p-2">
        <Search className="ml-2 h-4 w-4 shrink-0 text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-muted/70"
          placeholder="Search hospital or city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" onClick={locate} className="chip shrink-0 hover:bg-ink/5">
          {locating ? <Spinner className="h-3 w-3" /> : <LocateFixed className="h-3 w-3" />} Near me
        </button>
      </div>
      <ul className="max-h-72 divide-y divide-line overflow-y-auto">
        {isLoading && !data && <li className="p-4 text-sm text-muted">Loading hospitals…</li>}
        {data?.results.length === 0 && <li className="p-4 text-sm text-muted">No verified hospital matches. Ask the ward to onboard on BloodLink.</li>}
        {data?.results.map((h) => {
          const on = value?.id === h.id;
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onChange(h)}
                className={clsx("flex w-full items-center gap-3 px-4 py-3 text-left transition", on ? "bg-blood/5" : "hover:bg-ink/[.03]")}
              >
                <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-full border", on ? "border-blood bg-blood text-white" : "border-line")}>
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{h.name}</span>
                  <span className="block truncate text-xs text-muted">{h.address}, {h.city}</span>
                </span>
                {h.distance_km != null && <span className="text-xs text-muted">{h.distance_km} km</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}