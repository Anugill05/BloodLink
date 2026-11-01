// "use client";

// import clsx from "clsx";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { ArrowRight, Minus, Plus, ShieldCheck } from "lucide-react";
// import { GroupPicker } from "@/components/GroupPicker";
// import { HospitalPicker } from "@/components/HospitalPicker";
// import { ErrorNote, Field, PageLoader, Spinner } from "@/components/ui";
// import { ApiError, post } from "@/lib/api";
// import { useAuth } from "@/lib/auth";
// import { COMPONENTS, URGENCY, receiveFrom } from "@/lib/blood";
// import type { BloodGroup, BloodRequest, Component, Hospital, Urgency, User } from "@/lib/types";

// const HOURS: Record<Urgency, number> = { CRITICAL: 4, URGENT: 24, PLANNED: 72 };
// const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// function QuickAccount() {
//   const { acceptSession } = useAuth();
//   const [f, setF] = useState({ full_name: "", phone: "", email: "", password: "" });
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");
//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setBusy(true); setErr("");
//     try {
//       acceptSession(await post<{ user: User; tokens: { access: string; refresh: string } }>("/auth/register/", { ...f, role: "REQUESTER" }));
//     } catch (e) { setErr(e instanceof ApiError ? e.message : "Something went wrong."); setBusy(false); }
//   };
//   return (
//     <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
//       <div>
//         <div className="eyebrow">Step 0 · 20 seconds</div>
//         <h2 className="mt-2 font-serif text-3xl">Who should the hospital call back?</h2>
//         <p className="mt-1 text-sm text-muted">We need a verified contact so the hospital can confirm the patient. Already have an account? <Link href="/login?next=/request/new" className="text-blood hover:underline">Sign in</Link>.</p>
//       </div>
//       <div className="grid gap-4 sm:grid-cols-2">
//         {([["full_name", "Your name", "text"], ["phone", "Mobile", "tel"], ["email", "Email", "email"], ["password", "Choose a password", "password"]] as const).map(([k, l, t]) => (
//           <Field key={k} label={l}><input className="input" type={t} required minLength={k === "password" ? 8 : undefined} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>
//         ))}
//       </div>
//       <ErrorNote>{err}</ErrorNote>
//       <button className="btn-ink w-full" disabled={busy}>{busy ? <Spinner /> : <>Continue <ArrowRight className="h-4 w-4" /></>}</button>
//     </form>
//   );
// }

// export default function NewRequest() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const [hospital, setHospital] = useState<Hospital | null>(null);
//   const [group, setGroup] = useState<BloodGroup | null>(null);
//   const [component, setComponent] = useState<Component>("WHOLE_BLOOD");
//   const [units, setUnits] = useState(1);
//   const [urgency, setUrgency] = useState<Urgency>("URGENT");
//   const [neededBy, setNeededBy] = useState("");
//   const [f, setF] = useState({ patient_name: "", patient_age: "", reason: "", contact_name: "", contact_phone: "", notes: "" });
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");

//   useEffect(() => { setNeededBy(localInput(new Date(Date.now() + HOURS[urgency] * 3600e3))); }, [urgency]);
//   useEffect(() => {
//     if (user) {
//       setF((p) => ({ ...p, contact_name: p.contact_name || user.full_name, contact_phone: p.contact_phone || user.phone }));
//       if (user.hospital && !hospital) setHospital({ ...user.hospital, address: "", phone: "", coordinates: null } as Hospital);
//     }
//   }, [user, hospital]);

//   if (loading) return <PageLoader />;

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!hospital) return setErr("Choose the hospital where the patient is admitted.");
//     if (!group) return setErr("Choose the patient's blood group.");
//     setBusy(true); setErr("");
//     try {
//       const r = await post<BloodRequest>("/requests/", {
//         hospital: hospital.id, blood_group: group, component, units_needed: units, urgency,
//         needed_by: new Date(neededBy).toISOString(), ...f, patient_age: f.patient_age ? +f.patient_age : null,
//       });
//       router.push(`/requests/${r.id}`);
//     } catch (e) { setErr(e instanceof ApiError ? e.message : "Couldn't submit. Please try again."); setBusy(false); }
//   };
//   const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

//   return (
//     <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
//       <div className="eyebrow">New request</div>
//       <h1 className="mt-3 font-serif text-[clamp(2.5rem,6vw,4rem)] leading-[1]">Let&rsquo;s find a donor.</h1>
//       <p className="mt-3 max-w-xl text-muted">
//         The hospital confirms the patient first, then we alert compatible donors nearest to them — usually within minutes.
//       </p>

//       <div className="mt-10">
//         {!user ? <QuickAccount /> : (
//           <form onSubmit={submit} className="space-y-10">
//             <Section n="1" title="Where is the patient admitted?">
//               {user.hospital ? (
//                 <div className="card flex items-center gap-3 p-4"><ShieldCheck className="h-5 w-5 text-ok" /><span className="font-medium">{user.hospital.name}</span><span className="text-sm text-muted">· auto-verified</span></div>
//               ) : <HospitalPicker value={hospital} onChange={setHospital} />}
//             </Section>

//             <Section n="2" title="What's needed?">
//               <div className="space-y-5">
//                 <GroupPicker value={group} onChange={setGroup} />
//                 {group && (
//                   <p className="animate-rise text-sm text-muted">
//                     We&rsquo;ll look for <span className="font-mono text-ink">{receiveFrom(group, component).map((g) => g.replace("-", "−")).join(" · ")}</span>, exact match first.
//                   </p>
//                 )}
//                 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//                   {COMPONENTS.map((c) => (
//                     <button type="button" key={c.value} onClick={() => setComponent(c.value)}
//                       className={clsx("rounded-xl border p-3 text-left transition", component === c.value ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink/30")}>
//                       <div className="text-sm font-semibold">{c.label}</div>
//                       <div className={clsx("text-xs", component === c.value ? "text-paper/60" : "text-muted")}>{c.hint}</div>
//                     </button>
//                   ))}
//                 </div>
//                 <div className="flex items-center justify-between rounded-xl border border-line bg-card p-3">
//                   <span className="pl-1 text-sm font-medium">Units</span>
//                   <div className="flex items-center gap-4">
//                     <button type="button" aria-label="Fewer units" onClick={() => setUnits(Math.max(1, units - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink/40"><Minus className="h-4 w-4" /></button>
//                     <span className="w-6 text-center font-serif text-3xl tabular-nums">{units}</span>
//                     <button type="button" aria-label="More units" onClick={() => setUnits(Math.min(10, units + 1))} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink/40"><Plus className="h-4 w-4" /></button>
//                   </div>
//                 </div>
//               </div>
//             </Section>

//             <Section n="3" title="How soon?">
//               <div className="grid gap-2 sm:grid-cols-3">
//                 {(Object.keys(URGENCY) as Urgency[]).map((u) => (
//                   <button type="button" key={u} onClick={() => setUrgency(u)}
//                     className={clsx("rounded-xl border p-4 text-left transition", urgency === u ? "border-blood bg-blood/5 ring-4 ring-blood/10" : "border-line bg-card hover:border-ink/30")}>
//                     <div className={clsx("font-serif text-2xl", URGENCY[u].tone)}>{URGENCY[u].label}</div>
//                     <div className="text-xs text-muted">{URGENCY[u].hint}</div>
//                   </button>
//                 ))}
//               </div>
//               <div className="mt-4 max-w-xs"><Field label="Needed by"><input className="input" type="datetime-local" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} required /></Field></div>
//             </Section>

//             <Section n="4" title="Patient & contact">
//               <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
//                 <Field label="Patient name" hint="Seen only by the hospital and donors who accept."><input className="input" required value={f.patient_name} onChange={set("patient_name")} /></Field>
//                 <Field label="Age"><input className="input" type="number" min={0} max={120} value={f.patient_age} onChange={set("patient_age")} /></Field>
//               </div>
//               <div className="mt-4"><Field label="Reason (shown to donors)" hint="e.g. accident, surgery, dengue, thalassemia"><input className="input" maxLength={200} value={f.reason} onChange={set("reason")} /></Field></div>
//               <div className="mt-4 grid gap-4 sm:grid-cols-2">
//                 <Field label="Contact name"><input className="input" required value={f.contact_name} onChange={set("contact_name")} /></Field>
//                 <Field label="Contact phone" hint="Revealed only to donors who accept."><input className="input" type="tel" required value={f.contact_phone} onChange={set("contact_phone")} /></Field>
//               </div>
//               <div className="mt-4"><Field label="Notes for the blood bank (optional)"><textarea className="input min-h-24" value={f.notes} onChange={set("notes")} /></Field></div>
//             </Section>

//             <div className="sticky bottom-4 z-10 space-y-3">
//               <ErrorNote>{err}</ErrorNote>
//               <button className="btn-blood w-full !py-4 text-base" disabled={busy}>
//                 {busy ? <Spinner /> : <>Send to {hospital?.name ?? "hospital"} for verification <ArrowRight className="h-4 w-4" /></>}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
//   return (
//     <section className="grid gap-4 sm:grid-cols-[3rem_1fr]">
//       <div className="font-serif text-4xl leading-none text-blood/80">{n}</div>
//       <div>
//         <h2 className="mb-4 text-lg font-semibold">{title}</h2>
//         {children}
//       </div>
//     </section>
//   );
// }
"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { GroupPicker } from "@/components/GroupPicker";
import { HospitalPicker } from "@/components/HospitalPicker";
import { ErrorNote, Field, PageLoader, Spinner } from "@/components/ui";
import { ApiError, post } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { COMPONENTS, URGENCY, receiveFrom } from "@/lib/blood";
import type { BloodGroup, BloodRequest, Component, Hospital, Urgency, User } from "@/lib/types";

const HOURS: Record<Urgency, number> = { CRITICAL: 4, URGENT: 24, PLANNED: 72 };
const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function QuickAccount() {
  const { acceptSession } = useAuth();
  const [f, setF] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      acceptSession(await post<{ user: User; tokens: { access: string; refresh: string } }>("/auth/register/", { ...f, role: "REQUESTER" }));
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Something went wrong."); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold">Who should the hospital call back?</h2>
        <p className="mt-1 text-sm text-muted">
          We need a verified contact so the hospital can confirm the patient. Already have an account?{" "}
          <Link href="/login?next=/request/new" className="font-medium text-blood hover:underline">Sign in</Link>.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {([["full_name", "Your name", "text"], ["phone", "Mobile", "tel"], ["email", "Email", "email"], ["password", "Choose a password", "password"]] as const).map(([k, l, t]) => (
          <Field key={k} label={l}>
            <input className="input" type={t} required minLength={k === "password" ? 8 : undefined} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          </Field>
        ))}
      </div>
      <ErrorNote>{err}</ErrorNote>
      <button className="btn-blood w-full" disabled={busy}>{busy ? <Spinner /> : "Continue"}</button>
    </form>
  );
}

export default function NewRequest() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [group, setGroup] = useState<BloodGroup | null>(null);
  const [component, setComponent] = useState<Component>("WHOLE_BLOOD");
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>("URGENT");
  const [neededBy, setNeededBy] = useState("");
  const [f, setF] = useState({ patient_name: "", patient_age: "", reason: "", contact_name: "", contact_phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setNeededBy(localInput(new Date(Date.now() + HOURS[urgency] * 3600e3))); }, [urgency]);
  useEffect(() => {
    if (user) {
      setF((p) => ({ ...p, contact_name: p.contact_name || user.full_name, contact_phone: p.contact_phone || user.phone }));
      if (user.hospital && !hospital) setHospital({ ...user.hospital, address: "", phone: "", coordinates: null } as Hospital);
    }
  }, [user, hospital]);

  if (loading) return <PageLoader />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return setErr("Choose the hospital where the patient is admitted.");
    if (!group) return setErr("Choose the patient's blood group.");
    setBusy(true); setErr("");
    try {
      const r = await post<BloodRequest>("/requests/", {
        hospital: hospital.id, blood_group: group, component, units_needed: units, urgency,
        needed_by: new Date(neededBy).toISOString(), ...f, patient_age: f.patient_age ? +f.patient_age : null,
      });
      router.push(`/requests/${r.id}`);
    } catch (e) { setErr(e instanceof ApiError ? e.message : "Couldn't submit. Please try again."); setBusy(false); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Request blood</h1>
      <p className="mt-2 max-w-xl text-muted">
        The hospital confirms the patient first, then we alert compatible donors nearest to them, usually within minutes.
      </p>

      <div className="mt-8">
        {!user ? <QuickAccount /> : (
          <form onSubmit={submit} className="space-y-8">
            <Section n="1" title="Where is the patient admitted?">
              {user.hospital ? (
                <div className="card flex items-center gap-3 p-4">
                  <ShieldCheck className="h-5 w-5 text-ok" />
                  <span className="font-medium">{user.hospital.name}</span>
                  <span className="text-sm text-muted">· auto-verified</span>
                </div>
              ) : <HospitalPicker value={hospital} onChange={setHospital} />}
            </Section>

            <Section n="2" title="What's needed?">
              <div className="space-y-5">
                <GroupPicker value={group} onChange={setGroup} />
                {group && (
                  <p className="animate-rise text-sm text-muted">
                    We&rsquo;ll look for <span className="font-semibold text-ink">{receiveFrom(group, component).map((g) => g.replace("-", "−")).join(", ")}</span>, exact match first.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {COMPONENTS.map((c) => (
                    <button
                      type="button" key={c.value} onClick={() => setComponent(c.value)}
                      className={clsx("rounded-md border p-3 text-left transition", component === c.value ? "border-blood bg-blood/5" : "border-line bg-card hover:bg-ink/5")}
                    >
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-xs text-muted">{c.hint}</div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-md border border-line bg-card p-3">
                  <span className="pl-1 text-sm font-medium">Units</span>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label="Fewer units" onClick={() => setUnits(Math.max(1, units - 1))} className="grid h-9 w-9 place-items-center rounded-md border border-line hover:bg-ink/5"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-lg font-semibold tabular-nums">{units}</span>
                    <button type="button" aria-label="More units" onClick={() => setUnits(Math.min(10, units + 1))} className="grid h-9 w-9 place-items-center rounded-md border border-line hover:bg-ink/5"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </Section>

            <Section n="3" title="How soon?">
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(URGENCY) as Urgency[]).map((u) => (
                  <button
                    type="button" key={u} onClick={() => setUrgency(u)}
                    className={clsx("rounded-md border p-4 text-left transition", urgency === u ? "border-blood bg-blood/5" : "border-line bg-card hover:bg-ink/5")}
                  >
                    <div className={clsx("text-base font-semibold", URGENCY[u].tone)}>{URGENCY[u].label}</div>
                    <div className="text-xs text-muted">{URGENCY[u].hint}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 max-w-xs">
                <Field label="Needed by"><input className="input" type="datetime-local" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} required /></Field>
              </div>
            </Section>

            <Section n="4" title="Patient & contact">
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <Field label="Patient name" hint="Seen only by the hospital and donors who accept."><input className="input" required value={f.patient_name} onChange={set("patient_name")} /></Field>
                <Field label="Age"><input className="input" type="number" min={0} max={120} value={f.patient_age} onChange={set("patient_age")} /></Field>
              </div>
              <div className="mt-4">
                <Field label="Reason (shown to donors)" hint="e.g. accident, surgery, dengue, thalassemia"><input className="input" maxLength={200} value={f.reason} onChange={set("reason")} /></Field>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Contact name"><input className="input" required value={f.contact_name} onChange={set("contact_name")} /></Field>
                <Field label="Contact phone" hint="Revealed only to donors who accept."><input className="input" type="tel" required value={f.contact_phone} onChange={set("contact_phone")} /></Field>
              </div>
              <div className="mt-4">
                <Field label="Notes for the blood bank (optional)"><textarea className="input min-h-24" value={f.notes} onChange={set("notes")} /></Field>
              </div>
            </Section>

            <div className="sticky bottom-0 z-10 -mx-4 space-y-3 border-t border-line bg-card px-4 py-3 sm:mx-0 sm:rounded-lg sm:border">
              <ErrorNote>{err}</ErrorNote>
              <button className="btn-blood w-full" disabled={busy}>
                {busy ? <Spinner /> : <>Send to {hospital?.name ?? "hospital"} for verification</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-blood/10 text-sm font-semibold text-blood">{n}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}