// "use client";

// import clsx from "clsx";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useState } from "react";
// import { ArrowRight, Building2, Droplet, Users } from "lucide-react";
// import { AuthShell } from "@/components/AuthShell";
// import { GroupPicker } from "@/components/GroupPicker";
// import { LocationPicker } from "@/components/LocationPicker";
// import { ErrorNote, Field, Spinner } from "@/components/ui";
// import { ApiError, post } from "@/lib/api";
// import { homeFor, useAuth } from "@/lib/auth";
// import type { BloodGroup, LatLng, User } from "@/lib/types";

// type Kind = "donor" | "family" | "hospital";
// const KINDS: { k: Kind; label: string; icon: typeof Droplet; blurb: string }[] = [
//   { k: "donor", label: "Donor", icon: Droplet, blurb: "Get alerts when someone nearby needs your group" },
//   { k: "family", label: "Patient / family", icon: Users, blurb: "Raise and track a request" },
//   { k: "hospital", label: "Hospital", icon: Building2, blurb: "Verify requests & confirm donations" },
// ];

// function RegisterForm() {
//   const params = useSearchParams();
//   const router = useRouter();
//   const { acceptSession } = useAuth();
//   const [kind, setKind] = useState<Kind>((params.get("as") as Kind) || "donor");
//   const [f, setF] = useState<Record<string, string>>({});
//   const [group, setGroup] = useState<BloodGroup | null>(null);
//   const [loc, setLoc] = useState<LatLng | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [errs, setErrs] = useState<Record<string, string>>({});
//   const [err, setErr] = useState("");
//   const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErr(""); setErrs({});
//     if (kind === "donor" && (!group || !loc)) { setErr(!group ? "Pick your blood group." : "Tell us roughly where you are."); return; }
//     if (kind === "hospital" && !loc) { setErr("Set the hospital's location."); return; }
//     setBusy(true);
//     try {
//       let res: { user: User; tokens: { access: string; refresh: string } };
//       if (kind === "hospital") {
//         res = await post("/hospitals/onboard/", {
//           name: f.name, registration_number: f.registration_number, address: f.address, city: f.city, phone: f.phone,
//           has_blood_bank: f.has_blood_bank === "yes", lat: loc!.lat, lng: loc!.lng,
//           staff_name: f.staff_name, staff_email: f.email, staff_password: f.password,
//         });
//       } else {
//         res = await post("/auth/register/", {
//           email: f.email, password: f.password, full_name: f.full_name, phone: f.phone, city: f.city,
//           role: kind === "donor" ? "DONOR" : "REQUESTER",
//           ...(kind === "donor" && {
//             blood_group: group, lat: loc!.lat, lng: loc!.lng,
//             ...(f.weight_kg && { weight_kg: +f.weight_kg }),
//             ...(f.date_of_birth && { date_of_birth: f.date_of_birth }),
//             ...(f.last_donation_date && { last_donation_date: f.last_donation_date }),
//           }),
//         });
//       }
//       acceptSession(res);
//       router.push(kind === "hospital" ? "/hospital" : homeFor(res.user));
//     } catch (e) {
//       if (e instanceof ApiError) { setErrs(e.fields); setErr(e.message); } else setErr("Something went wrong. Please try again.");
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="mx-auto w-full max-w-xl">
//       <div className="grid grid-cols-3 gap-2">
//         {KINDS.map(({ k, label, icon: Icon, blurb }) => (
//           <button
//             key={k}
//             type="button"
//             onClick={() => setKind(k)}
//             className={clsx("rounded-2xl border p-3 text-left transition", kind === k ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink/30")}
//           >
//             <Icon className={clsx("h-4 w-4", kind === k ? "text-pulse" : "text-blood")} />
//             <div className="mt-2 text-sm font-semibold">{label}</div>
//             <div className={clsx("mt-0.5 hidden text-xs sm:block", kind === k ? "text-paper/60" : "text-muted")}>{blurb}</div>
//           </button>
//         ))}
//       </div>

//       <form onSubmit={submit} className="mt-8 space-y-5">
//         {kind === "hospital" ? (
//           <>
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Field label="Hospital name" error={errs.name}><input className="input" required onChange={set("name")} /></Field>
//               <Field label="Registration no." error={errs.registration_number} hint="Clinical Establishments Act / state reg."><input className="input" required onChange={set("registration_number")} /></Field>
//             </div>
//             <Field label="Address"><input className="input" required onChange={set("address")} /></Field>
//             <div className="grid gap-4 sm:grid-cols-3">
//               <Field label="City"><input className="input" required value={f.city ?? ""} onChange={set("city")} /></Field>
//               <Field label="Phone"><input className="input" required onChange={set("phone")} /></Field>
//               <Field label="Blood bank on site?">
//                 <select className="input" onChange={set("has_blood_bank")} defaultValue="no"><option value="yes">Yes</option><option value="no">No</option></select>
//               </Field>
//             </div>
//             <Field label="Location"><LocationPicker value={loc} onChange={setLoc} onCity={(c) => setF((p) => ({ ...p, city: p.city || c }))} /></Field>
//             <div className="border-t border-line pt-5">
//               <div className="eyebrow mb-4">Staff admin account</div>
//               <div className="grid gap-4 sm:grid-cols-3">
//                 <Field label="Your name"><input className="input" required onChange={set("staff_name")} /></Field>
//                 <Field label="Work email" error={errs.staff_email}><input className="input" type="email" required onChange={set("email")} /></Field>
//                 <Field label="Password" error={errs.staff_password}><input className="input" type="password" minLength={8} required onChange={set("password")} /></Field>
//               </div>
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="grid gap-4 sm:grid-cols-2">
//               <Field label="Full name" error={errs.full_name}><input className="input" required autoComplete="name" onChange={set("full_name")} /></Field>
//               <Field label="Mobile" error={errs.phone} hint={kind === "donor" ? "For SMS alerts. Never shown publicly." : undefined}>
//                 <input className="input" required type="tel" autoComplete="tel" placeholder="+91" onChange={set("phone")} />
//               </Field>
//               <Field label="Email" error={errs.email}><input className="input" type="email" required autoComplete="email" onChange={set("email")} /></Field>
//               <Field label="Password" error={errs.password}><input className="input" type="password" minLength={8} required autoComplete="new-password" onChange={set("password")} /></Field>
//             </div>
//             {kind === "donor" && (
//               <>
//                 <Field label="Blood group" error={errs.blood_group}><GroupPicker value={group} onChange={setGroup} /></Field>
//                 <Field label="Where are you usually?"><LocationPicker value={loc} onChange={setLoc} onCity={(c) => setF((p) => ({ ...p, city: c }))} /></Field>
//                 <details className="group rounded-2xl border border-line p-4">
//                   <summary className="cursor-pointer list-none text-sm font-medium">
//                     Eligibility details <span className="text-muted">(optional, helps us not alert you when you can't donate)</span>
//                   </summary>
//                   <div className="mt-4 grid gap-4 sm:grid-cols-3">
//                     <Field label="Date of birth"><input className="input" type="date" onChange={set("date_of_birth")} /></Field>
//                     <Field label="Weight (kg)"><input className="input" type="number" min={30} max={250} onChange={set("weight_kg")} /></Field>
//                     <Field label="Last donated"><input className="input" type="date" onChange={set("last_donation_date")} /></Field>
//                   </div>
//                 </details>
//               </>
//             )}
//           </>
//         )}
//         <ErrorNote>{err}</ErrorNote>
//         <button className="btn-blood w-full" disabled={busy}>
//           {busy ? <Spinner /> : <>{kind === "hospital" ? "Submit for verification" : kind === "donor" ? "Join as a donor" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
//         </button>
//         {kind === "hospital" && <p className="text-center text-xs text-muted">A BloodLink admin checks your registration before your hospital can verify requests.</p>}
//         <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="text-blood hover:underline">Sign in</Link></p>
//       </form>
//     </div>
//   );
// }

// export default function RegisterPage() {
//   return (
//     <AuthShell kicker="Join BloodLink" title={<>One alert. One person. <em className="text-pulse">Three lives.</em></>}>
//       <Suspense><RegisterForm /></Suspense>
//     </AuthShell>
//   );
// }
"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Building2, Droplet, Users } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { GroupPicker } from "@/components/GroupPicker";
import { LocationPicker } from "@/components/LocationPicker";
import { ErrorNote, Field, Spinner } from "@/components/ui";
import { ApiError, post } from "@/lib/api";
import { homeFor, useAuth } from "@/lib/auth";
import type { BloodGroup, LatLng, User } from "@/lib/types";

type Kind = "donor" | "family" | "hospital";
const KINDS: { k: Kind; label: string; icon: typeof Droplet; blurb: string }[] = [
  { k: "donor", label: "Donor", icon: Droplet, blurb: "Get alerts when someone nearby needs your group" },
  { k: "family", label: "Patient / family", icon: Users, blurb: "Raise and track a request" },
  { k: "hospital", label: "Hospital", icon: Building2, blurb: "Verify requests and confirm donations" },
];

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { acceptSession } = useAuth();
  const [kind, setKind] = useState<Kind>((params.get("as") as Kind) || "donor");
  const [f, setF] = useState<Record<string, string>>({});
  const [group, setGroup] = useState<BloodGroup | null>(null);
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [busy, setBusy] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setErrs({});
    if (kind === "donor" && (!group || !loc)) { setErr(!group ? "Pick your blood group." : "Tell us roughly where you are."); return; }
    if (kind === "hospital" && !loc) { setErr("Set the hospital's location."); return; }
    setBusy(true);
    try {
      let res: { user: User; tokens: { access: string; refresh: string } };
      if (kind === "hospital") {
        res = await post("/hospitals/onboard/", {
          name: f.name, registration_number: f.registration_number, address: f.address, city: f.city, phone: f.phone,
          has_blood_bank: f.has_blood_bank === "yes", lat: loc!.lat, lng: loc!.lng,
          staff_name: f.staff_name, staff_email: f.email, staff_password: f.password,
        });
      } else {
        res = await post("/auth/register/", {
          email: f.email, password: f.password, full_name: f.full_name, phone: f.phone, city: f.city,
          role: kind === "donor" ? "DONOR" : "REQUESTER",
          ...(kind === "donor" && {
            blood_group: group, lat: loc!.lat, lng: loc!.lng,
            ...(f.weight_kg && { weight_kg: +f.weight_kg }),
            ...(f.date_of_birth && { date_of_birth: f.date_of_birth }),
            ...(f.last_donation_date && { last_donation_date: f.last_donation_date }),
          }),
        });
      }
      acceptSession(res);
      router.push(kind === "hospital" ? "/hospital" : homeFor(res.user));
    } catch (e) {
      if (e instanceof ApiError) { setErrs(e.fields); setErr(e.message); } else setErr("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
      <p className="mt-2 text-muted">Choose how you will use BloodLink.</p>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {KINDS.map(({ k, label, icon: Icon, blurb }) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={clsx("rounded-md border p-3 text-left transition", kind === k ? "border-blood bg-blood/5" : "border-line bg-card hover:bg-ink/5")}
          >
            <Icon className="h-4 w-4 text-blood" />
            <div className="mt-2 text-sm font-semibold">{label}</div>
            <div className="mt-0.5 hidden text-xs text-muted sm:block">{blurb}</div>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        {kind === "hospital" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hospital name" error={errs.name}><input className="input" required onChange={set("name")} /></Field>
              <Field label="Registration no." error={errs.registration_number} hint="Clinical Establishments Act or state registration"><input className="input" required onChange={set("registration_number")} /></Field>
            </div>
            <Field label="Address"><input className="input" required onChange={set("address")} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City"><input className="input" required value={f.city ?? ""} onChange={set("city")} /></Field>
              <Field label="Phone"><input className="input" required onChange={set("phone")} /></Field>
              <Field label="Blood bank on site?">
                <select className="input" onChange={set("has_blood_bank")} defaultValue="no"><option value="yes">Yes</option><option value="no">No</option></select>
              </Field>
            </div>
            <Field label="Location"><LocationPicker value={loc} onChange={setLoc} onCity={(c) => setF((p) => ({ ...p, city: p.city || c }))} /></Field>
            <div className="border-t border-line pt-5">
              <div className="mb-4 text-sm font-semibold">Staff admin account</div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Your name"><input className="input" required onChange={set("staff_name")} /></Field>
                <Field label="Work email" error={errs.staff_email}><input className="input" type="email" required onChange={set("email")} /></Field>
                <Field label="Password" error={errs.staff_password}><input className="input" type="password" minLength={8} required onChange={set("password")} /></Field>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errs.full_name}><input className="input" required autoComplete="name" onChange={set("full_name")} /></Field>
              <Field label="Mobile" error={errs.phone} hint={kind === "donor" ? "For SMS alerts. Never shown publicly." : undefined}>
                <input className="input" required type="tel" autoComplete="tel" placeholder="+91" onChange={set("phone")} />
              </Field>
              <Field label="Email" error={errs.email}><input className="input" type="email" required autoComplete="email" onChange={set("email")} /></Field>
              <Field label="Password" error={errs.password}><input className="input" type="password" minLength={8} required autoComplete="new-password" onChange={set("password")} /></Field>
            </div>
            {kind === "donor" && (
              <>
                <Field label="Blood group" error={errs.blood_group}><GroupPicker value={group} onChange={setGroup} /></Field>
                <Field label="Where are you usually?"><LocationPicker value={loc} onChange={setLoc} onCity={(c) => setF((p) => ({ ...p, city: c }))} /></Field>
                <details className="group rounded-md border border-line bg-card p-4">
                  <summary className="cursor-pointer list-none text-sm font-medium">
                    Eligibility details <span className="font-normal text-muted">(optional, helps us avoid alerting you when you can't donate)</span>
                  </summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field label="Date of birth"><input className="input" type="date" onChange={set("date_of_birth")} /></Field>
                    <Field label="Weight (kg)"><input className="input" type="number" min={30} max={250} onChange={set("weight_kg")} /></Field>
                    <Field label="Last donated"><input className="input" type="date" onChange={set("last_donation_date")} /></Field>
                  </div>
                </details>
              </>
            )}
          </>
        )}
        <ErrorNote>{err}</ErrorNote>
        <button className="btn-blood w-full" disabled={busy}>
          {busy ? <Spinner /> : kind === "hospital" ? "Submit for verification" : kind === "donor" ? "Join as a donor" : "Create account"}
        </button>
        {kind === "hospital" && <p className="text-center text-xs text-muted">A BloodLink admin checks your registration before your hospital can verify requests.</p>}
        <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="font-medium text-blood hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell kicker="Join BloodLink" title={<>One alert, one person, up to <span className="text-blood">three lives</span>.</>}>
      <Suspense><RegisterForm /></Suspense>
    </AuthShell>
  );
}