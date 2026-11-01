# BloodLink

Hospital-verified emergency blood requests, matched to compatible, eligible donors nearby — in widening waves, without spamming anyone or exposing phone numbers.

**Stack:** Next.js 15 + TypeScript + Tailwind · Django REST Framework · PostgreSQL + PostGIS · Redis · Celery (worker + beat)

---

## Why this exists (what we learned from existing products)

| Existing option | What it does well | Gap BloodLink fills |
|---|---|---|
| **e-RaktKosh** (Govt. of India) | Blood-bank stock, camps, bank directory | Finds *stock*, not a *person* who can come in tonight when the bank is empty |
| **WhatsApp forwards / donor groups** | Reach | Wrong city + wrong group, no verification, numbers spammed for months, nobody knows when it's covered |
| **Donor-directory apps** (Simply Blood, Blood Connect, etc.) | Donor lists | Usually blast everyone or show phone numbers publicly; no hospital in the loop; no closing the loop |

Design choices that come from those gaps:

1. **Hospital verification first.** No donor is alerted until staff at the treating hospital tap *Verify*. Requests raised by hospital staff are verified automatically.
2. **Wave matching, not blasting.** Exact-group donors within 5 km first, ranked by distance and reliability. If not enough people say yes, the radius widens (5 → 10 → 25 → 50 km for critical; slower for planned).
3. **Universal donors last.** O− donors are scarce. They're only alerted after exact and same-Rh matches, so the next emergency isn't left short.
4. **Privacy by default.** Donors see the hospital and the distance. Patient name and family phone are revealed *only after they accept*. Families see a donor's first name; only hospital staff see donor phone numbers.
5. **No alert fatigue.** One non-critical alert per 12 h max, never during the 90-day post-donation window (NBTC guideline), and donors already on the way to someone are never pinged again.
6. **Close the loop.** When pledges cover the units, remaining alerts are withdrawn. When the blood bank confirms a donation, the donor's 90-day clock starts and a reminder fires the day they're eligible again.

---

## Run it

### Option A — Docker (everything)

```bash
docker compose up --build
docker compose exec backend python manage.py seed_demo   # demo data
docker compose exec backend python manage.py createsuperuser
```

- App: http://localhost:3000
- API docs (Swagger): http://localhost:8000/api/docs/
- Admin (verify hospitals here): http://localhost:8000/admin/

### Option B — local dev

Needs PostgreSQL with PostGIS, Redis, GDAL (`brew install postgis gdal redis` on macOS).

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && export $(grep -v '^#' .env | xargs)
createdb bloodlink && psql bloodlink -c "create extension postgis"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver                 # :8000
celery -A config worker -l info            # new terminal
celery -A config beat -l info              # new terminal

# frontend
cd frontend
npm install
npm run dev                                # :3000 (proxies /api → :8000)
```

### Demo logins (after `seed_demo`, password `bloodlink123`)

| Role | Email |
|---|---|
| Donor (O+, Meerut) | `donor@demo.bloodlink` |
| Family (raised 4 requests) | `family@demo.bloodlink` |
| Hospital staff — LLRM Meerut | `staff0@demo.bloodlink` |

The login page has one-click buttons for these.

### Tests

```bash
cd backend && pytest        # 16 tests: compatibility, matching, full lifecycle, privacy, permissions
```

---

## How a request flows (one example)

1. **2:10 am** — Rakesh raises a request: 2 units B+, LLRM Meerut, *Critical*. Status `PENDING_VERIFICATION`. LLRM staff get an in-app + SMS ping.
2. **2:12** — Staff tap *Verify*. Status `OPEN`. Celery task `run_matching_wave` runs.
3. **Wave 1 (5 km)** — PostGIS finds available, eligible, compatible donors; ranks them (`matching.score_candidate`); alerts the top `units × 6`. Each gets SMS/email/in-app.
4. **2:14** — Priya (1.2 km) taps *I'm coming · 20 min*. Rakesh sees "1/2 pledged" on the live tracker. Priya now sees the patient name, contact and directions.
5. **2:15 — Wave 2 (10 km)** — still 1 short, so the next wave goes out automatically.
6. **2:19** — Aman accepts. 2/2 pledged → every other pending alert is withdrawn.
7. **3:05** — Blood bank taps *Donated* for each. Request `FULFILLED`. Donors get a thank-you; their 90-day clock starts. No-shows trigger a fresh wave.

---

## Project layout

```
backend/
  config/                Django settings (env-driven), Celery app, URLs
  apps/core/             blood.py (compatibility rules), geo helpers, permissions, seed_demo
  apps/accounts/         custom User (email login, role, hospital FK)
  apps/hospitals/        Hospital (PostGIS point, verified flag), onboarding
  apps/donors/           DonorProfile (eligibility, reliability), Donation, eligibility reminders
  apps/bloodrequests/    BloodRequest, DonorMatch, RequestEvent
                         matching.py  – wave engine + scoring
                         services.py  – every state change (verify/accept/confirm/…)
                         tasks.py     – Celery waves + expiry
  apps/notifications/    Notification model, SMS (console/Twilio) + email channels
frontend/
  src/app/               /, /login, /register, /request/new, /requests, /requests/[id],
                         /r/[code] (public share page), /donor, /hospital
  src/components/        Radar (wave visualisation), CompatibilityExplorer, pickers, UI kit
  src/lib/               API client (JWT + refresh), auth context, blood rules, types
```

## API (main endpoints)

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register/` · `/api/auth/token/` | anyone |
| POST | `/api/hospitals/onboard/` | new hospital (stays unverified until admin approves) |
| GET | `/api/hospitals/?lat=&lng=&q=` | anyone — nearest verified hospitals |
| POST/GET | `/api/requests/` · `/api/requests/{id}/` | family / staff |
| POST | `/api/requests/{id}/verify/` · `reject/` · `cancel/` | staff (cancel: creator too) |
| GET | `/api/donors/me/alerts/` | donor |
| POST | `/api/matches/{id}/accept/` · `decline/` | donor |
| POST | `/api/matches/{id}/arrived/` · `confirm/` · `no-show/` | staff |
| GET | `/api/public/feed/` · `stats/` · `requests/{code}/` · `compatibility/` | anyone (anonymised) |

## Going to production — checklist

- Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`.
- SMS: set `SMS_BACKEND=twilio` + credentials (or add an MSG91/Gupshup class in `notifications/channels.py` — for India, DLT-registered templates are required).
- Phone OTP verification at sign-up (not built yet — recommended before launch).
- Web push / WhatsApp Business API for faster alerts.
- Hospital admin verification workflow (currently via Django admin action).
- Optional: pull blood-bank stock from e-RaktKosh where APIs are available, to tell families when the bank already has units.

> BloodLink supports — it never replaces — a hospital's blood bank. In a life-threatening emergency call 112.
