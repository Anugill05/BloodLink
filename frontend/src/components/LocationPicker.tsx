// "use client";

// import clsx from "clsx";
// import { useState } from "react";
// import { LocateFixed, MapPin } from "lucide-react";
// import type { LatLng } from "@/lib/types";
// import { Spinner } from "./ui";

// export const CITIES: Record<string, LatLng> = {
//   Meerut: { lat: 28.9845, lng: 77.7064 },
//   "New Delhi": { lat: 28.6139, lng: 77.209 },
//   Ghaziabad: { lat: 28.6692, lng: 77.4538 },
//   Noida: { lat: 28.5355, lng: 77.391 },
//   Gurugram: { lat: 28.4595, lng: 77.0266 },
//   Lucknow: { lat: 26.8467, lng: 80.9462 },
//   Jaipur: { lat: 26.9124, lng: 75.7873 },
//   Mumbai: { lat: 19.076, lng: 72.8777 },
//   Pune: { lat: 18.5204, lng: 73.8567 },
//   Bengaluru: { lat: 12.9716, lng: 77.5946 },
//   Hyderabad: { lat: 17.385, lng: 78.4867 },
//   Chennai: { lat: 13.0827, lng: 80.2707 },
//   Kolkata: { lat: 22.5726, lng: 88.3639 },
// };

// export function LocationPicker({ value, onChange, onCity }: { value: LatLng | null; onChange: (v: LatLng) => void; onCity?: (c: string) => void }) {
//   const [busy, setBusy] = useState(false);
//   const [mode, setMode] = useState<"gps" | "city" | null>(null);
//   const [err, setErr] = useState("");

//   const locate = () => {
//     if (!navigator.geolocation) { setErr("Location isn't available in this browser — pick your city instead."); return; }
//     setBusy(true); setErr("");
//     navigator.geolocation.getCurrentPosition(
//       (p) => { onChange({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }); setMode("gps"); setBusy(false); },
//       () => { setErr("We couldn't get your location. Pick your city instead."); setBusy(false); },
//       { enableHighAccuracy: true, timeout: 10000 },
//     );
//   };

//   return (
//     <div className="space-y-2">
//       <div className="flex flex-col gap-2 sm:flex-row">
//         <button type="button" onClick={locate} className={clsx("btn-ghost flex-1 !justify-start !rounded-xl !py-3", mode === "gps" && "!border-ok/50 !text-ok")}>
//           {busy ? <Spinner /> : <LocateFixed className="h-4 w-4" />}
//           {mode === "gps" && value ? `Located · ${value.lat.toFixed(3)}, ${value.lng.toFixed(3)}` : "Use my current location"}
//         </button>
//         <div className="relative flex-1">
//           <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
//           <select
//             className="input !pl-10"
//             defaultValue=""
//             onChange={(e) => { const c = e.target.value; if (CITIES[c]) { onChange(CITIES[c]); onCity?.(c); setMode("city"); } }}
//           >
//             <option value="" disabled>Or choose your city</option>
//             {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
//           </select>
//         </div>
//       </div>
//       {err && <p className="text-xs text-pulse">{err}</p>}
//       <p className="text-xs text-muted">Only used to measure distance to hospitals. Your exact location is never shown to anyone.</p>
//     </div>
//   );
// }
"use client";

import clsx from "clsx";
import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import type { LatLng } from "@/lib/types";
import { Spinner } from "./ui";

export const CITIES: Record<string, LatLng> = {
  Meerut: { lat: 28.9845, lng: 77.7064 },
  "New Delhi": { lat: 28.6139, lng: 77.209 },
  Ghaziabad: { lat: 28.6692, lng: 77.4538 },
  Noida: { lat: 28.5355, lng: 77.391 },
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
};

export function LocationPicker({ value, onChange, onCity }: { value: LatLng | null; onChange: (v: LatLng) => void; onCity?: (c: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"gps" | "city" | null>(null);
  const [err, setErr] = useState("");

  const locate = () => {
    if (!navigator.geolocation) { setErr("Location isn't available in this browser. Pick your city instead."); return; }
    setBusy(true); setErr("");
    navigator.geolocation.getCurrentPosition(
      (p) => { onChange({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }); setMode("gps"); setBusy(false); },
      () => { setErr("We couldn't get your location. Pick your city instead."); setBusy(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={locate}
          className={clsx("btn-ghost flex-1 !justify-start !py-3", mode === "gps" && "!border-ok/50 !text-ok")}
        >
          {busy ? <Spinner /> : <LocateFixed className="h-4 w-4" />}
          {mode === "gps" && value ? `Located: ${value.lat.toFixed(3)}, ${value.lng.toFixed(3)}` : "Use my current location"}
        </button>
        <div className="relative flex-1">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <select
            className="input !pl-10"
            defaultValue=""
            onChange={(e) => { const c = e.target.value; if (CITIES[c]) { onChange(CITIES[c]); onCity?.(c); setMode("city"); } }}
          >
            <option value="" disabled>Or choose your city</option>
            {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {err && <p className="text-xs text-blood">{err}</p>}
      <p className="text-xs text-muted">Only used to measure distance to hospitals. Your exact location is never shown to anyone.</p>
    </div>
  );
}