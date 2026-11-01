// // import Link from "next/link";
// // import { ArrowRight, BellOff, EyeOff, Hospital, Radar as RadarIcon, ShieldCheck, Undo2 } from "lucide-react";
// // import { HeroRadar } from "@/components/HeroRadar";
// // import { LiveTicker } from "@/components/LiveTicker";
// // import { CompatibilityExplorer } from "@/components/CompatibilityExplorer";
// // import { GroupAvailability, HeroStats } from "@/components/Availability";

// // const STEPS = [
// //   {
// //     n: "01",
// //     title: "The family raises a request",
// //     body: "2:10 am. Rakesh's father needs 2 units of B+ after an accident. He picks the hospital, group and urgency — 40 seconds, no account hunting.",
// //     icon: Hospital,
// //   },
// //   {
// //     n: "02",
// //     title: "The hospital confirms it's real",
// //     body: "The ward at LLRM gets a ping and taps Verify. Nothing reaches a donor until a verified hospital vouches for the patient. No fake asks, no scams.",
// //     icon: ShieldCheck,
// //   },
// //   {
// //     n: "03",
// //     title: "Donors are alerted in waves",
// //     body: "Exact-match B+ donors within 5 km first, ranked by distance and how reliably they respond. Not enough yeses in 3 minutes? The circle widens to 10, 25, 50 km.",
// //     icon: RadarIcon,
// //   },
// //   {
// //     n: "04",
// //     title: "Covered — everyone else stands down",
// //     body: "The moment 2 donors say yes, other alerts are withdrawn. The blood bank confirms the donation, the donor's 90-day clock starts, and they get a thank-you.",
// //     icon: Undo2,
// //   },
// // ];

// // const DIFFERENCE = [
// //   { icon: ShieldCheck, title: "Hospital-verified", body: "Every request is vouched for by the treating hospital before anyone is alerted." },
// //   { icon: EyeOff, title: "Numbers stay private", body: "Donors see the hospital, not the family's number — until they choose to accept." },
// //   { icon: BellOff, title: "No alert fatigue", body: "Max one non-critical alert per 12 hours, never during your 90-day recovery." },
// //   { icon: Undo2, title: "Closes the loop", body: "When a request is covered, alerts are withdrawn. Nobody travels for nothing." },
// // ];

// // export default function Home() {
// //   return (
// //     <>
// //       {/* HERO */}
// //       <section className="relative overflow-hidden">
// //         <div className="grid-paper pointer-events-none absolute inset-0" />
// //         <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
// //           <div className="animate-rise">
// //             <div className="eyebrow flex items-center gap-2">
// //               <span className="h-px w-8 bg-blood" /> Emergency blood, matched locally
// //             </div>
// //             <h1 className="mt-5 font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em]">
// //               The right donor,
// //               <br />
// //               <em className="text-blood">three streets away,</em>
// //               <br />
// //               in minutes.
// //             </h1>
// //             <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink/75">
// //               BloodLink replaces forwarded WhatsApp messages with something that actually works: hospital-verified requests,
// //               matched to compatible, eligible donors nearby — and widened only when needed.
// //             </p>
// //             <div className="mt-8 flex flex-wrap gap-3">
// //               <Link href="/request/new" className="btn-blood">
// //                 I need blood <ArrowRight className="h-4 w-4" />
// //               </Link>
// //               <Link href="/register" className="btn-ghost">Become a donor</Link>
// //             </div>
// //             <HeroStats />
// //           </div>
// //           <div className="animate-rise [animation-delay:150ms]">
// //             <HeroRadar />
// //           </div>
// //         </div>
// //       </section>

// //       <LiveTicker />

// //       {/* PROBLEM */}
// //       <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
// //         <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
// //           <div>
// //             <div className="eyebrow">The problem</div>
// //             <h2 className="mt-3 font-serif text-5xl leading-[1] tracking-tight">
// //               &ldquo;Urgent: B+ needed, please forward&rdquo;
// //             </h2>
// //           </div>
// //           <div className="space-y-6 text-[17px] leading-relaxed text-ink/80">
// //             <p>
// //               Every family in India has seen this message. It reaches hundreds of people in the wrong city and the wrong blood group.
// //               Nobody can tell if it&rsquo;s genuine. The phone number in it keeps ringing for months after the patient has gone home.
// //             </p>
// //             <p>
// //               Government systems like e-RaktKosh tell you which blood bank has stock. They don&rsquo;t find you the{" "}
// //               <em className="font-serif text-xl text-blood">person</em> who can walk in tonight when the bank is empty — and that gap is
// //               where families lose the most time.
// //             </p>
// //             <p className="text-ink">BloodLink is built for that gap.</p>
// //           </div>
// //         </div>
// //       </section>

// //       {/* HOW IT WORKS */}
// //       <section id="how" className="border-y border-line bg-card/50">
// //         <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
// //           <div className="eyebrow">How it works</div>
// //           <h2 className="mt-3 max-w-2xl font-serif text-5xl leading-[1] tracking-tight">One request, followed from first alert to last unit.</h2>
// //           <ol className="mt-14 grid gap-px overflow-hidden rounded-xl2 border border-line bg-line md:grid-cols-4">
// //             {STEPS.map((s) => (
// //               <li key={s.n} className="flex flex-col bg-card p-6">
// //                 <div className="flex items-center justify-between">
// //                   <span className="font-serif text-5xl text-blood/90">{s.n}</span>
// //                   <s.icon className="h-5 w-5 text-muted" />
// //                 </div>
// //                 <h3 className="mt-8 text-lg font-semibold leading-snug">{s.title}</h3>
// //                 <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
// //               </li>
// //             ))}
// //           </ol>
// //         </div>
// //       </section>

// //       {/* DIFFERENCE */}
// //       <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
// //         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
// //           {DIFFERENCE.map((d) => (
// //             <div key={d.title} className="border-t-2 border-ink pt-5">
// //               <d.icon className="h-5 w-5 text-blood" />
// //               <h3 className="mt-4 font-semibold">{d.title}</h3>
// //               <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
// //             </div>
// //           ))}
// //         </div>
// //       </section>

// //       {/* COMPATIBILITY */}
// //       <section id="compatibility" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
// //         <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
// //           <div>
// //             <div className="eyebrow">Compatibility</div>
// //             <h2 className="mt-3 font-serif text-5xl leading-[1] tracking-tight">Who can give to whom?</h2>
// //           </div>
// //           <p className="max-w-sm text-sm text-muted">The same rules the matching engine uses — exact matches are always tried before universal donors.</p>
// //         </div>
// //         <CompatibilityExplorer />
// //       </section>

// //       {/* AVAILABILITY */}
// //       <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
// //         <div className="mb-8">
// //           <div className="eyebrow">Right now on BloodLink</div>
// //           <h2 className="mt-3 font-serif text-5xl leading-[1] tracking-tight">Donors ready, by group.</h2>
// //         </div>
// //         <GroupAvailability />
// //       </section>

// //       {/* ELIGIBILITY + CTA */}
// //       <section id="eligibility" className="mx-auto max-w-6xl px-4 sm:px-6">
// //         <div className="relative grid overflow-hidden rounded-[2rem] bg-ink text-paper md:grid-cols-2">
// //           <div className="p-8 sm:p-12">
// //             <div className="eyebrow !text-paper/60">Can I donate?</div>
// //             <ul className="mt-6 space-y-4 text-[15px]">
// //               {[
// //                 ["18 – 65 years old", "and feeling well today"],
// //                 ["45 kg or more", "body weight"],
// //                 ["90 days", "since your last whole-blood donation"],
// //                 ["Hb ≥ 12.5 g/dL", "checked at the blood bank before you donate"],
// //               ].map(([a, b]) => (
// //                 <li key={a} className="flex items-baseline gap-4 border-b border-paper/10 pb-4">
// //                   <span className="font-serif text-2xl text-white">{a}</span>
// //                   <span className="text-paper/60">{b}</span>
// //                 </li>
// //               ))}
// //             </ul>
// //             <p className="mt-6 text-xs text-paper/50">Based on NBTC India guidelines. The blood bank does a final screening.</p>
// //           </div>
// //           <div className="relative flex flex-col justify-end bg-blood p-8 sm:p-12">
// //             <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/20" />
// //             <div className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full border border-white/20" />
// //             <h2 className="font-serif text-5xl leading-[1] text-white">
// //               Be the person someone is <em>waiting</em> for.
// //             </h2>
// //             <p className="mt-4 max-w-sm text-white/80">Takes 60 seconds. You&rsquo;ll only hear from us when someone near you, with your blood group, actually needs you.</p>
// //             <Link href="/register" className="btn mt-8 w-fit bg-white text-blood hover:bg-paper">
// //               Register as a donor <ArrowRight className="h-4 w-4" />
// //             </Link>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // }
// import Link from "next/link";
// import { Bell, BellOff, Check, EyeOff, Hospital, ShieldCheck, Undo2 } from "lucide-react";
// import { CompatibilityExplorer } from "@/components/CompatibilityExplorer";
// import { GroupAvailability, HeroStats } from "@/components/Availability";
// import { GroupMark, Pill, UnitsRail } from "@/components/ui";

// const STEPS = [
//   {
//     n: "1",
//     title: "The family raises a request",
//     body: "At 2:10 am, Rakesh's father needs 2 units of B+ after an accident. He picks the hospital, blood group and urgency in under a minute.",
//     icon: Hospital,
//   },
//   {
//     n: "2",
//     title: "The hospital confirms it's real",
//     body: "The ward gets a notification and taps Verify. Nothing reaches a donor until a verified hospital vouches for the patient, so fake requests stay out.",
//     icon: ShieldCheck,
//   },
//   {
//     n: "3",
//     title: "Donors are alerted in waves",
//     body: "Exact-match donors within 5 km are alerted first, ranked by distance and reliability. If there aren't enough replies in 3 minutes, the search widens to 10, 25 and then 50 km.",
//     icon: Bell,
//   },
//   {
//     n: "4",
//     title: "Covered, and everyone else stands down",
//     body: "As soon as enough donors say yes, the other alerts are withdrawn. The blood bank confirms the donation and the donor's 90-day recovery period starts.",
//     icon: Undo2,
//   },
// ];

// const DIFFERENCE = [
//   { icon: ShieldCheck, title: "Hospital-verified", body: "Every request is vouched for by the treating hospital before anyone is alerted." },
//   { icon: EyeOff, title: "Numbers stay private", body: "Donors see the hospital, not the family's number, until they choose to accept." },
//   { icon: BellOff, title: "No alert fatigue", body: "At most one non-critical alert per 12 hours, and none during your 90-day recovery." },
//   { icon: Undo2, title: "Closes the loop", body: "When a request is covered, alerts are withdrawn. Nobody travels for nothing." },
// ];

// const ELIGIBILITY = [
//   ["18 to 65 years old", "and feeling well on the day"],
//   ["45 kg or more", "body weight"],
//   ["90 days", "since your last whole-blood donation"],
//   ["Hb 12.5 g/dL or higher", "checked at the blood bank before you donate"],
// ];

// export default function Home() {
//   return (
//     <>
//       {/* HERO */}
//       <section className="border-b border-line bg-card">
//         <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
//           <div>
//             <p className="text-sm font-semibold text-blood">Emergency blood, matched locally</p>
//             <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
//               Find the right blood donor nearby, in minutes.
//             </h1>
//             <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
//               BloodLink replaces forwarded WhatsApp messages with hospital-verified requests, matched to compatible, eligible donors close to the patient.
//             </p>
//             <div className="mt-8 flex flex-wrap gap-3">
//               <Link href="/request/new" className="btn-blood">I need blood</Link>
//               <Link href="/register" className="btn-ghost">Become a donor</Link>
//             </div>
//             <HeroStats />
//           </div>

//           {/* Static sample request: illustrates the product, no animation */}
//           <div className="card p-6 shadow-sm">
//             <div className="flex items-start gap-4">
//               <GroupMark group="B+" size="md" />
//               <div className="min-w-0">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <Pill tone="pulse">Critical</Pill>
//                   <span className="text-xs text-muted">Example request</span>
//                 </div>
//                 <p className="mt-1.5 font-semibold">2 units · whole blood</p>
//                 <p className="text-sm text-muted">LLRM Medical College, Meerut</p>
//               </div>
//             </div>
//             <div className="mt-5">
//               <UnitsRail needed={2} pledged={1} fulfilled={0} />
//               <p className="mt-2 text-xs text-muted">1 of 2 donors on the way</p>
//             </div>
//             <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
//               {["Verified by the hospital", "12 compatible donors alerted within 5 km", "1 donor confirmed, arriving in 20 min"].map((t) => (
//                 <li key={t} className="flex items-center gap-2.5">
//                   <Check className="h-4 w-4 shrink-0 text-ok" />
//                   {t}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </section>

//       {/* PROBLEM */}
//       <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
//         <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">&ldquo;Urgent: B+ needed, please forward&rdquo;</h2>
//           </div>
//           <div className="space-y-4 leading-relaxed text-muted">
//             <p>
//               Every family in India has seen this message. It reaches hundreds of people in the wrong city and the wrong blood group.
//               Nobody can tell if it&rsquo;s genuine, and the phone number keeps ringing for months after the patient has gone home.
//             </p>
//             <p>
//               Government systems like e-RaktKosh tell you which blood bank has stock. They don&rsquo;t find the <strong className="font-semibold text-ink">person</strong> who can
//               walk in tonight when the bank is empty. That gap is where families lose the most time.
//             </p>
//             <p className="font-medium text-ink">BloodLink is built for that gap.</p>
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="how" className="border-y border-line bg-card">
//         <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
//           <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
//           <p className="mt-2 max-w-2xl text-muted">One request, followed from the first alert to the last unit.</p>
//           <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//             {STEPS.map((s) => (
//               <li key={s.n} className="flex flex-col">
//                 <span className="grid h-10 w-10 place-items-center rounded-md bg-blood/10 text-blood">
//                   <s.icon className="h-5 w-5" />
//                 </span>
//                 <h3 className="mt-4 font-semibold leading-snug">
//                   {s.n}. {s.title}
//                 </h3>
//                 <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
//               </li>
//             ))}
//           </ol>
//         </div>
//       </section>

//       {/* DIFFERENCE */}
//       <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
//         <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why BloodLink</h2>
//         <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
//           {DIFFERENCE.map((d) => (
//             <div key={d.title}>
//               <d.icon className="h-5 w-5 text-blood" />
//               <h3 className="mt-3 font-semibold">{d.title}</h3>
//               <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* COMPATIBILITY */}
//       <section id="compatibility" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
//         <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
//           <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who can give to whom?</h2>
//           <p className="max-w-sm text-sm text-muted">The same rules the matching engine uses. Exact matches are always tried before universal donors.</p>
//         </div>
//         <CompatibilityExplorer />
//       </section>

//       {/* AVAILABILITY */}
//       <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
//         <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Donors ready, by blood group</h2>
//         <GroupAvailability />
//       </section>

//       {/* ELIGIBILITY + CTA */}
//       <section id="eligibility" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
//         <div className="grid overflow-hidden rounded-lg border border-line md:grid-cols-2">
//           <div className="bg-card p-8 sm:p-10">
//             <h2 className="text-xl font-bold">Can I donate?</h2>
//             <ul className="mt-5 space-y-4">
//               {ELIGIBILITY.map(([a, b]) => (
//                 <li key={a} className="border-b border-line pb-4 last:border-0 last:pb-0">
//                   <span className="block font-semibold">{a}</span>
//                   <span className="text-sm text-muted">{b}</span>
//                 </li>
//               ))}
//             </ul>
//             <p className="mt-6 text-xs text-muted">Based on NBTC India guidelines. The blood bank does a final screening.</p>
//           </div>
//           <div className="flex flex-col justify-center bg-blood p-8 text-white sm:p-10">
//             <h2 className="text-3xl font-bold leading-tight">Be the person someone is waiting for.</h2>
//             <p className="mt-3 max-w-sm text-white/85">
//               Registering takes about a minute. You&rsquo;ll only hear from us when someone near you, with your blood group, needs you.
//             </p>
//             <Link href="/register" className="btn mt-6 w-fit bg-white text-blood hover:bg-white/90">
//               Register as a donor
//             </Link>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }
import Link from "next/link";
import { Bell, BellOff, Check, EyeOff, Hospital, ShieldCheck, Undo2 } from "lucide-react";
import { CompatibilityExplorer } from "@/components/CompatibilityExplorer";
import { GroupAvailability, HeroStats } from "@/components/Availability";
import { GroupMark, Pill, UnitsRail } from "@/components/ui";

const STEPS = [
  {
    n: "1",
    title: "The family raises a request",
    body: "At 2:10 am, Rakesh's father needs 2 units of B+ after an accident. He picks the hospital, blood group and urgency in under a minute.",
    icon: Hospital,
  },
  {
    n: "2",
    title: "The hospital confirms it's real",
    body: "The ward gets a notification and taps Verify. Nothing reaches a donor until a verified hospital vouches for the patient, so fake requests stay out.",
    icon: ShieldCheck,
  },
  {
    n: "3",
    title: "Donors are alerted in waves",
    body: "Exact-match donors within 5 km are alerted first, ranked by distance and reliability. If there aren't enough replies in 3 minutes, the search widens to 10, 25 and then 50 km.",
    icon: Bell,
  },
  {
    n: "4",
    title: "Covered, and everyone else stands down",
    body: "As soon as enough donors say yes, the other alerts are withdrawn. The blood bank confirms the donation and the donor's 90-day recovery period starts.",
    icon: Undo2,
  },
];

const DIFFERENCE = [
  { icon: ShieldCheck, title: "Hospital-verified", body: "Every request is vouched for by the treating hospital before anyone is alerted." },
  { icon: EyeOff, title: "Numbers stay private", body: "Donors see the hospital, not the family's number, until they choose to accept." },
  { icon: BellOff, title: "No alert fatigue", body: "At most one non-critical alert per 12 hours, and none during your 90-day recovery." },
  { icon: Undo2, title: "Closes the loop", body: "When a request is covered, alerts are withdrawn. Nobody travels for nothing." },
];

const ELIGIBILITY = [
  ["18 to 65 years old", "and feeling well on the day"],
  ["45 kg or more", "body weight"],
  ["90 days", "since your last whole-blood donation"],
  ["Hb 12.5 g/dL or higher", "checked at the blood bank before you donate"],
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <p className="text-sm font-semibold text-blood">Emergency blood, matched locally</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Find the right blood donor nearby, in minutes.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              BloodLink replaces forwarded WhatsApp messages with hospital-verified requests, matched to compatible, eligible donors close to the patient.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/request/new" className="btn-blood">I need blood</Link>
              <Link href="/register" className="btn-ghost">Become a donor</Link>
            </div>
            <HeroStats />
          </div>

          {/* Static sample request: illustrates the product, no animation */}
          <div className="card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <GroupMark group="B+" size="md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="pulse">Critical</Pill>
                  <span className="text-xs text-muted">Example request</span>
                </div>
                <p className="mt-1.5 font-semibold">2 units · whole blood</p>
                <p className="text-sm text-muted">LLRM Medical College, Meerut</p>
              </div>
            </div>
            <div className="mt-5">
              <UnitsRail needed={2} pledged={1} fulfilled={0} />
              <p className="mt-2 text-xs text-muted">1 of 2 donors on the way</p>
            </div>
            <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              {["Verified by the hospital", "12 compatible donors alerted within 5 km", "1 donor confirmed, arriving in 20 min"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 shrink-0 text-ok" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">&ldquo;Urgent: B+ needed, please forward&rdquo;</h2>
          </div>
          <div className="space-y-4 leading-relaxed text-muted">
            <p>
              Every family in India has seen this message. It reaches hundreds of people in the wrong city and the wrong blood group.
              Nobody can tell if it&rsquo;s genuine, and the phone number keeps ringing for months after the patient has gone home.
            </p>
            <p>
              Government systems like e-RaktKosh tell you which blood bank has stock. They don&rsquo;t find the <strong className="font-semibold text-ink">person</strong> who can
              walk in tonight when the bank is empty. That gap is where families lose the most time.
            </p>
            <p className="font-medium text-ink">BloodLink is built for that gap.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-2 max-w-2xl text-muted">One request, followed from the first alert to the last unit.</p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-blood/10 text-blood">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold leading-snug">
                  {s.n}. {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DIFFERENCE */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why BloodLink</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENCE.map((d) => (
            <div key={d.title}>
              <d.icon className="h-5 w-5 text-blood" />
              <h3 className="mt-3 font-semibold">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section id="compatibility" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who can give to whom?</h2>
          <p className="max-w-sm text-sm text-muted">The same rules the matching engine uses. Exact matches are always tried before universal donors.</p>
        </div>
        <CompatibilityExplorer />
      </section>

      {/* AVAILABILITY */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Donors ready, by blood group</h2>
        <GroupAvailability />
      </section>

      {/* ELIGIBILITY + CTA */}
      <section id="eligibility" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid overflow-hidden rounded-lg border border-line md:grid-cols-2">
          <div className="bg-card p-8 sm:p-10">
            <h2 className="text-xl font-bold">Can I donate?</h2>
            <ul className="mt-5 space-y-4">
              {ELIGIBILITY.map(([a, b]) => (
                <li key={a} className="border-b border-line pb-4 last:border-0 last:pb-0">
                  <span className="block font-semibold">{a}</span>
                  <span className="text-sm text-muted">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted">Based on NBTC India guidelines. The blood bank does a final screening.</p>
          </div>
          <div className="flex flex-col justify-center bg-blood p-8 text-white sm:p-10">
            <h2 className="text-3xl font-bold leading-tight">Be the person someone is waiting for.</h2>
            <p className="mt-3 max-w-sm text-white/85">
              Registering takes about a minute. You&rsquo;ll only hear from us when someone near you, with your blood group, needs you.
            </p>
            <Link href="/register" className="btn mt-6 w-fit bg-white text-blood hover:bg-white/90">
              Register as a donor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}