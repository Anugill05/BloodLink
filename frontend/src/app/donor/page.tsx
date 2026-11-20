"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { BellRing, Check, Clock, HeartHandshake, MapPin, Navigation, Phone, Settings2, Timer, X } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { ActionButton, MatchStatusPill } from "@/components/RequestBits";
import { Empty, GroupMark, PageLoader, Pill, Stat } from "@/components/ui";
import { fetcher, patch, post } from "@/lib/api";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { URGENCY } from "@/lib/blood";
import { daysUntil, fmtDate, mapsLink, timeAgo, timeLeft } from "@/lib/format";
import type { DonorAlert, DonorProfile, User } from "@/lib/types";

const isDonor = (u: User) => !!u.donor_profile;

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-ok" : "bg-line")}
    >
      <span className={clsx("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
    </button>
  );
}

function Eligibility({ p }: { p: DonorProfile }) {
  const left = daysUntil(p.next_eligible_date);
  const pct = p.is_eligible ? 100 : Math.max(0, Math.min(100, Math.round((1 - left / 90) * 100)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          {p.is_eligible && <Check className="h-4 w-4 text-ok" />}
          {p.is_eligible ? "Ready to donate" : "Recovering"}
        </div>
        {!p.is_eligible && <span className="text-sm text-muted">{left} days left</span>}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
        <div className={clsx("h-full rounded-full", p.is_eligible ? "bg-ok" : "bg-blood")} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">
        {p.is_eligible
          ? p.last_donation_date ? `Last donated ${fmtDate(p.last_donation_date)}.` : "You'll get alerts for compatible requests near you."
          : `Your body is rebuilding. Eligible again on ${fmtDate(p.next_eligible_date!)}. We'll remind you.`}
      </p>
    </div>
  );
}

const ETA_PRESETS = [10, 20, 30, 45, 60];

/** Quick-pick chips plus a custom "other" minutes box. */
function EtaPicker({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const custom = !ETA_PRESETS.includes(value);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ETA_PRESETS.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={clsx("rounded-md border px-3 py-1 text-xs font-medium", value === m ? "border-ink bg-ink text-white" : "border-line bg-card hover:bg-ink/5")}
        >
          {m} min
        </button>
      ))}
      <label className={clsx("flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs", custom ? "border-ink" : "border-line bg-card")}>
        <span className="text-muted">Other</span>
        <input
          type="number" min={1} max={180} inputMode="numeric" placeholder="min"
          value={custom ? value : ""}
          onChange={(e) => { const n = Math.round(+e.target.value); if (n >= 1 && n <= 180) onChange(n); }}
          className="w-12 bg-transparent py-0.5 text-center outline-none"
        />
      </label>
    </div>
  );
}

/** Minutes left until the donor's promised arrival (counts down live). */
function useEtaLeft(a: DonorAlert) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, []);
  if (!a.eta_minutes || !a.responded_at) return null;
  const arriveAt = new Date(a.responded_at).getTime() + a.eta_minutes * 60000;
  return Math.max(0, Math.ceil((arriveAt - now) / 60000));
}

function AlertCard({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
  const [eta, setEta] = useState(20);
  const r = a.request;
  const edge = r.urgency === "CRITICAL" ? "border-l-blood" : r.urgency === "URGENT" ? "border-l-warn" : "border-l-ok";
  return (
    <div className={clsx("card animate-rise border-l-4", edge)}>
      <div className="flex flex-wrap items-start gap-4 p-5">
        <GroupMark group={r.blood_group} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={r.urgency === "CRITICAL" ? "pulse" : "warn"}>{URGENCY[r.urgency].label}</Pill>
            <span className="text-xs text-muted">{r.code} · {timeAgo(a.notified_at)}</span>
          </div>
          <div className="mt-2 text-lg font-semibold">{r.units_needed} units {r.component_label.toLowerCase()} · {r.hospital.name}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.distance_km.toFixed(1)} km away</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeLeft(r.needed_by)}</span>
            <span>{r.units_pledged}/{r.units_needed} pledged</span>
          </div>
          {r.reason && <p className="mt-2 text-sm">&ldquo;{r.reason}&rdquo;</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-paper px-5 py-4">
        <span className="text-sm text-muted">I can be there in</span>
        <EtaPicker value={eta} onChange={setEta} />
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          <ActionButton onRun={() => post(`/matches/${a.id}/decline/`)} done={refresh}><X className="h-3.5 w-3.5" /> Can&rsquo;t</ActionButton>
          <ActionButton variant="blood" onRun={() => post(`/matches/${a.id}/accept/`, { eta_minutes: eta })} done={refresh}>
            <HeartHandshake className="h-4 w-4" /> I&rsquo;m coming in {eta} min
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function OnTheWay({ a, refresh }: { a: DonorAlert; refresh: () => void }) {
  const r = a.request;
  const h = r.hospital;
  const left = useEtaLeft(a);
  const [editing, setEditing] = useState(false);
  const [newEta, setNewEta] = useState(a.eta_minutes ?? 20);
  return (
    <div className="rounded-lg border border-blood/30 bg-blood/5 p-6">
      <p className="text-sm font-semibold text-blood">You&rsquo;re on the way · {r.code}</p>
      {a.status === "ACCEPTED" && a.eta_minutes != null && (
        <div className="mt-3 rounded-md border border-blood/20 bg-card p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-blood" />
            <span className="font-medium">
              {left === 0 ? "You should be arriving now" : `Arriving in about ${left} min`}
            </span>
            <span className="text-muted">(you said {a.eta_minutes} min)</span>
            <button className="ml-auto text-xs font-medium text-blood underline" onClick={() => setEditing((v) => !v)}>
              {editing ? "Close" : "Running late? Update time"}
            </button>
          </div>
          {editing && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <EtaPicker value={newEta} onChange={setNewEta} />
              <ActionButton variant="blood" onRun={() => post(`/matches/${a.id}/eta/`, { eta_minutes: newEta })} done={() => { setEditing(false); refresh(); }}>
                Update to {newEta} min
              </ActionButton>
            </div>
          )}
        </div>
      )}
      <h2 className="mt-2 text-2xl font-bold">{h.name}</h2>
      <p className="text-muted">{h.address}, {h.city} · {a.distance_km.toFixed(1)} km</p>
      <dl className="mt-5 grid gap-4 border-y border-blood/15 py-5 sm:grid-cols-3">
        <div><dt className="text-sm text-muted">Patient</dt><dd className="mt-0.5 font-medium">{r.patient_name}</dd></div>
        <div><dt className="text-sm text-muted">Ask for</dt><dd className="mt-0.5 font-medium">{r.contact_name}</dd></div>
        <div><dt className="text-sm text-muted">Give</dt><dd className="mt-0.5 font-medium">{r.component_label} · {r.blood_group}</dd></div>
      </dl>
      {r.notes && <p className="mt-4 text-sm text-muted">Note: {r.notes}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={mapsLink(h.coordinates?.lat, h.coordinates?.lng)} target="_blank" rel="noreferrer" className="btn-blood">
          <Navigation className="h-4 w-4" /> Directions
        </a>
        <a href={`tel:${r.contact_phone}`} className="btn-ghost">
          <Phone className="h-4 w-4" /> {r.contact_phone}
        </a>
        <span className="ml-auto">
          <ActionButton onRun={() => post(`/matches/${a.id}/decline/`, { reason: "Can no longer make it" })} done={refresh}>
            I can&rsquo;t make it anymore
          </ActionButton>
        </span>
      </div>
      <p className="mt-5 text-xs text-muted">Eat something light and drink water before you go. Carry a photo ID. The blood bank will do a quick health check.</p>
    </div>
  );
}

function Preferences({ p, refresh }: { p: DonorProfile; refresh: () => void }) {
  const save = async (body: Partial<DonorProfile> | { lat: number; lng: number }) => { await patch("/donors/me/", body); refresh(); };
  return (
    <details className="card group">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4">
        <Settings2 className="h-4 w-4 text-muted" /> <span className="font-medium">Alert preferences</span>
        <span className="ml-auto text-xs text-muted group-open:hidden">Travel up to {p.max_travel_km} km</span>
      </summary>
      <div className="space-y-6 border-t border-line p-5">
        <div>
          <div className="flex justify-between text-sm"><span>How far will you travel?</span><span className="font-medium">{p.max_travel_km} km</span></div>
          <input
            type="range" min={3} max={50} defaultValue={p.max_travel_km}
            className="mt-3 w-full accent-[rgb(var(--blood))]"
            onMouseUp={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })}
            onTouchEnd={(e) => save({ max_travel_km: +(e.target as HTMLInputElement).value })}
          />
          <p className="mt-1 text-xs text-muted">For critical cases we may still ask if you&rsquo;re a bit further away.</p>
        </div>
        {(["notify_sms", "notify_email"] as const).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-sm">{k === "notify_sms" ? "SMS alerts" : "Email alerts"}</span>
            <Switch on={p[k]} label={k} onChange={(v) => save({ [k]: v })} />
          </div>
        ))}
        <div>
          <div className="mb-2 text-sm">Update my location</div>
          <LocationPicker value={p.coordinates} onChange={(c) => save({ lat: c.lat, lng: c.lng })} />
        </div>
      </div>
    </details>
  );
}

export default function DonorHome() {
  const { user } = useRequireAuth(isDonor, "/requests");
  const { reload } = useAuth();
  const { data: profile, mutate: mp } = useSWR<DonorProfile>(user ? "/donors/me/" : null, fetcher);
  const { data: alerts, mutate: ma } = useSWR<DonorAlert[]>(user ? "/donors/me/alerts/" : null, fetcher, { refreshInterval: 10000 });
  const { data: donations } = useSWR<{ id: number; donated_on: string; hospital_name: string; units: number }[]>(user ? "/donors/me/donations/" : null, fetcher);
  if (!user || !profile || !alerts) return <PageLoader />;

  const refresh = () => { ma(); mp(); reload(); };
  const pending = alerts.filter((a) => a.status === "NOTIFIED" && a.request.status === "OPEN");
  const active = alerts.filter((a) => a.status === "ACCEPTED" || a.status === "ARRIVED");
  const history = alerts.filter((a) => !pending.includes(a) && !active.includes(a));
  const rate = profile.alerts_received ? Math.round((profile.alerts_accepted / profile.alerts_received) * 100) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-center gap-4">
        <GroupMark group={profile.blood_group} size="lg" />
        <div className="flex-1">
          <p className="text-sm text-muted">Donor · {user.city || "BloodLink"}</p>
          <h1 className="mt-0.5 text-3xl font-bold tracking-tight sm:text-4xl">Hi, {user.full_name.split(" ")[0]}</h1>
        </div>
        <div className="card flex items-center gap-4 px-5 py-4">
          <div>
            <div className="text-sm font-semibold">{profile.is_available ? "Available for alerts" : "Paused"}</div>
            <div className="text-xs text-muted">{profile.is_available ? "We'll alert you if someone nearby needs you" : "You won't get any alerts"}</div>
          </div>
          <Switch on={profile.is_available} label="Availability" onChange={async (v) => { await patch("/donors/me/", { is_available: v }); mp(); }} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {active.map((a) => <OnTheWay key={a.id} a={a} refresh={refresh} />)}

          <div>
            <div className="mb-3 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-blood" />
              <h2 className="font-semibold">Needs your response</h2>
              {pending.length > 0 && <span className="rounded-full bg-blood px-2 text-xs font-semibold text-white">{pending.length}</span>}
            </div>
            <div className="space-y-3">
              {pending.length === 0 ? (
                <Empty title="All quiet near you">
                  {profile.is_available ? "When a verified hospital nearby needs your blood group, the alert shows up here and on your phone." : "Turn on availability to receive alerts."}
                </Empty>
              ) : pending.map((a) => <AlertCard key={a.id} a={a} refresh={refresh} />)}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">Past alerts</h2>
              <div className="card divide-y divide-line">
                {history.slice(0, 12).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="w-10 text-base font-bold text-blood">{a.request.blood_group.replace("-", "−")}</span>
                    <span className="min-w-0 flex-1 truncate">{a.request.hospital.name}</span>
                    <span className="hidden text-xs text-muted sm:inline">{timeAgo(a.notified_at)}</span>
                    <MatchStatusPill status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6"><Eligibility p={profile} /></div>
          <div className="card grid grid-cols-3 gap-4 p-6">
            <Stat label="Donations" value={profile.donations_count} />
            <Stat label="Lives" value={profile.lives_impacted} sub="up to 3 per unit" />
            <Stat label="Response" value={rate != null ? `${rate}%` : "—"} />
          </div>
          {donations && donations.length > 0 && (
            <div className="card p-5">
              <div className="mb-3 text-sm font-semibold">Donation record</div>
              <ul className="space-y-2 text-sm">
                {donations.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3">
                    <span className="truncate">{d.hospital_name ?? "Blood bank"}</span>
                    <span className="text-xs text-muted">{fmtDate(d.donated_on)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Preferences p={profile} refresh={() => mp()} />
        </aside>
      </div>
    </div>
  );
}