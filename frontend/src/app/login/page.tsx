// "use client";

// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useState } from "react";
// import { ArrowRight } from "lucide-react";
// import { AuthShell } from "@/components/AuthShell";
// import { ErrorNote, Field, Spinner } from "@/components/ui";
// import { homeFor, useAuth } from "@/lib/auth";

// const DEMO = [
//   { label: "Donor", email: "donor@demo.bloodlink" },
//   { label: "Family", email: "family@demo.bloodlink" },
//   { label: "Hospital", email: "staff0@demo.bloodlink" },
// ];

// function LoginForm() {
//   const { login } = useAuth();
//   const router = useRouter();
//   const next = useSearchParams().get("next");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");

//   const submit = async (e?: React.FormEvent, creds?: { email: string; password: string }) => {
//     e?.preventDefault();
//     setBusy(true); setErr("");
//     try {
//       const u = await login(creds?.email ?? email, creds?.password ?? password);
//       router.push(next || homeFor(u));
//     } catch {
//       setErr("That email and password don't match.");
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="mx-auto w-full max-w-md">
//       <h2 className="font-serif text-5xl">Welcome back.</h2>
//       <p className="mt-2 text-muted">Sign in to respond to alerts or track a request.</p>
//       <form onSubmit={submit} className="mt-8 space-y-4">
//         <Field label="Email"><input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
//         <Field label="Password"><input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
//         <ErrorNote>{err}</ErrorNote>
//         <button className="btn-ink w-full" disabled={busy}>{busy ? <Spinner /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}</button>
//       </form>
//       <p className="mt-6 text-sm text-muted">
//         New here? <Link href="/register" className="text-blood underline-offset-4 hover:underline">Become a donor</Link> or{" "}
//         <Link href="/request/new" className="text-blood underline-offset-4 hover:underline">request blood</Link>.
//       </p>
//       <div className="mt-10 rounded-2xl border border-dashed border-line p-4">
//         <div className="eyebrow">Demo accounts · after <code className="font-mono">seed_demo</code></div>
//         <div className="mt-3 flex flex-wrap gap-2">
//           {DEMO.map((d) => (
//             <button key={d.email} type="button" onClick={() => submit(undefined, { email: d.email, password: "bloodlink123" })} className="chip hover:border-ink/40 hover:text-ink">
//               {d.label}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function LoginPage() {
//   return (
//     <AuthShell kicker="BloodLink" title={<>Every alert is a <em className="text-pulse">real</em> patient, verified by a real hospital.</>}>
//       <Suspense><LoginForm /></Suspense>
//     </AuthShell>
//   );
// }
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { ErrorNote, Field, Spinner } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";

const DEMO = [
  { label: "Donor", email: "donor@demo.bloodlink" },
  { label: "Family", email: "family@demo.bloodlink" },
  { label: "Hospital", email: "staff0@demo.bloodlink" },
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e?: React.FormEvent, creds?: { email: string; password: string }) => {
    e?.preventDefault();
    setBusy(true); setErr("");
    try {
      const u = await login(creds?.email ?? email, creds?.password ?? password);
      router.push(next || homeFor(u));
    } catch {
      setErr("That email and password don't match.");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
      <p className="mt-2 text-muted">Sign in to respond to alerts or track a request.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email">
          <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <ErrorNote>{err}</ErrorNote>
        <button className="btn-blood w-full" disabled={busy}>{busy ? <Spinner /> : "Sign in"}</button>
      </form>
      <p className="mt-6 text-sm text-muted">
        New here? <Link href="/register" className="font-medium text-blood hover:underline">Become a donor</Link> or{" "}
        <Link href="/request/new" className="font-medium text-blood hover:underline">request blood</Link>.
      </p>
      <div className="mt-10 rounded-lg border border-line bg-paper p-4">
        <div className="text-sm font-medium">Demo accounts</div>
        <p className="mt-0.5 text-xs text-muted">Available after running <code>seed_demo</code></p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => submit(undefined, { email: d.email, password: "bloodlink123" })}
              className="chip bg-card hover:bg-ink/5"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell kicker="BloodLink" title={<>Every alert is a <em className="not-italic text-blood">real</em> patient, verified by a real hospital.</>}>
      <Suspense><LoginForm /></Suspense>
    </AuthShell>
  );
}