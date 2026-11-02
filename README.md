# BloodLink

**An Intelligent Location-Aware Blood Donor Matching and Emergency Coordination Platform**

BloodLink is a web platform that helps patients find suitable blood donors quickly during medical emergencies. It matches hospital-verified blood requests with compatible, eligible donors nearby, in widening waves, without spamming anyone or exposing phone numbers.

**Live demo**

| | Link |
|---|---|
| Website | https://bloodlink-frontend-g7b0.onrender.com |
| API | https://bloodlink-f0po.onrender.com |
| API docs (Swagger) | https://bloodlink-f0po.onrender.com/api/docs/ |
| Admin panel | https://bloodlink-f0po.onrender.com/admin/ |

> If the app is hosted on Render's free plan, services go to sleep after 15 minutes without traffic. The first page load after a quiet period can take up to a minute.

**Tech stack**

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, SWR |
| Backend | Django 5.1, Django REST Framework, SimpleJWT |
| Database | PostgreSQL with PostGIS (distance and location queries) |
| Queue and cache | Redis, Celery (worker and beat scheduler) |
| Deployment | Docker, Render |

---

## Features

- **Hospital verification first.** No donor is alerted until staff at the treating hospital verify the request. Requests raised by hospital staff are verified automatically.
- **Wave matching, not blasting.** Exact-group donors within 5 km are alerted first, ranked by distance and reliability. If there are not enough replies, the search radius widens automatically.
- **Universal donors last.** O- donors are scarce, so they are only alerted after exact and same-Rh matches.
- **Privacy by default.** Donors see the hospital and the distance. The patient name and family phone number are shown only after a donor accepts. Families see a donor's first name, and only hospital staff see donor phone numbers.
- **No alert fatigue.** At most one non-critical alert per 12 hours, none during the 90-day post-donation window (NBTC guideline), and donors already on the way to a patient are not alerted again.
- **Closes the loop.** When pledges cover the units needed, the remaining alerts are withdrawn. When the blood bank confirms a donation, the donor's 90-day clock starts and a reminder is sent when they are eligible again.
- **Public share page.** Families can share a request link on WhatsApp. It shows no phone numbers and no patient name.
- **Notifications.** In-app, SMS (console or Twilio) and email.

### Search waves

| Urgency | Search radii (km) | Wait between waves |
|---|---|---|
| Critical | 5, 10, 25, 50 | 3 minutes |
| Urgent | 5, 15, 30, 50 | 10 minutes |
| Planned | 10, 25, 50 | 1 hour |

### How a request flows

1. **Request.** A family raises a request, for example 2 units of B+ at a hospital, marked Critical. Status: `PENDING_VERIFICATION`. Hospital staff are notified.
2. **Verify.** Staff tap Verify. Status: `OPEN`. The Celery task `run_matching_wave` starts.
3. **Wave 1 (5 km).** PostGIS finds available, eligible, compatible donors. They are ranked by `matching.score_candidate`, and the top donors are alerted.
4. **Accept.** A donor taps "I'm coming" with an ETA. The family sees the pledge on the live tracker, and the donor now sees the patient name, contact and directions.
5. **Next wave.** If units are still missing, the next wave goes out automatically with a wider radius.
6. **Covered.** When pledges cover the units, all other pending alerts are withdrawn.
7. **Donation.** The blood bank marks each donation. The request becomes `FULFILLED`, the donor is thanked, and their 90-day clock starts. No-shows trigger a fresh wave.

---

## Run it locally

### Option A: Docker (recommended)

You need Docker Desktop and about 5 GB of free disk space.

```bash
docker compose up --build
docker compose exec backend python manage.py seed_demo           # demo data
docker compose exec backend python manage.py createsuperuser     # admin account
```

- App: http://localhost:3000
- API docs: http://localhost:8000/api/docs/
- Admin (approve hospitals here): http://localhost:8000/admin/

After you change frontend files, rebuild with `docker compose up --build frontend`. The frontend image copies the code at build time, so there is no live reload inside Docker.

### Option B: without Docker

You need PostgreSQL with PostGIS, Redis and GDAL installed.

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && export $(grep -v '^#' .env | xargs)
createdb bloodlink && psql bloodlink -c "create extension postgis"
python manage.py migrate
python manage.py seed_demo
python manage.py runserver                 # http://localhost:8000
celery -A config worker -l info            # new terminal
celery -A config beat -l info              # new terminal

# frontend
cd frontend
npm install
npm run dev                                # http://localhost:3000 (proxies /api to :8000)
```

### Demo logins

After running `seed_demo`, every demo account uses the password `bloodlink123`.

| Role | Email |
|---|---|
| Donor (O+, Meerut) | `donor@demo.bloodlink` |
| Patient or family | `family@demo.bloodlink` |
| Hospital staff (LLRM Meerut) | `staff0@demo.bloodlink` |

The login page has one-click buttons for these accounts. Remove that block from `frontend/src/app/login/page.tsx` before using the app with real users.

### Admin login

The admin panel is Django's built-in admin on the **backend** URL (`/admin/`). Log in with the **email** and password of the superuser you created. In the admin, open **Hospitals**, select the pending ones and run the bulk verify action. Verified hospitals can then verify requests and raise their own.

### Tests

```bash
cd backend && pytest
```

The tests cover blood compatibility, matching, the full request lifecycle, privacy rules and permissions.

---

## Environment variables (backend)

| Variable | Purpose | Example |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | a long random string |
| `DJANGO_DEBUG` | Debug mode, `0` in production | `0` |
| `DJANGO_ALLOWED_HOSTS` | Allowed hostnames, comma separated | `bloodlink-f0po.onrender.com` |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database connection | from your Postgres service |
| `REDIS_URL` | Celery broker, result backend and cache | `redis://...:6379` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `https://bloodlink-frontend-g7b0.onrender.com` |
| `FRONTEND_URL` | Used for links in notifications | `https://bloodlink-frontend-g7b0.onrender.com` |
| `SMS_BACKEND` | `console` or `twilio` | `console` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Twilio credentials | only if `SMS_BACKEND=twilio` |
| `EMAIL_BACKEND` | Django email backend | `django.core.mail.backends.console.EmailBackend` |
| `PORT` | Port gunicorn listens on | `8000` |

**Frontend**

| Variable | Purpose |
|---|---|
| `BACKEND_URL` | Where the Next.js server proxies `/api/*`. It is read at build time, so rebuild after changing it. |
| `PORT` | Port the Next.js server listens on (`3000`). |

---

## Deploying on Render

The project runs as five Render resources, all in the same region:

| Resource | Type | Root directory | Start command |
|---|---|---|---|
| PostgreSQL | Postgres | n/a | n/a (PostGIS is enabled by `migrate`, or run `CREATE EXTENSION postgis;`) |
| Redis | Key Value | n/a | n/a |
| API | Web Service (Docker) | `backend` | `sh -c "python manage.py migrate --noinput && gunicorn config.wsgi:application -b 0.0.0.0:8000 -w 2 --timeout 60"` |
| Worker | Background Worker (Docker) | `backend` | `celery -A config worker -B -l info --concurrency 2` |
| Website | Web Service (Docker) | `frontend` | default (from the Dockerfile) |

1. Create the Postgres database and the Key Value store.
2. Create the API service with the backend environment variables above. Set its health check path to `/healthz`.
3. Create the worker with the same environment variables. It is required: the search waves are scheduled with Celery, so without a worker the radius never widens.
4. Create the website service and set `BACKEND_URL` to the API's public URL **before the first deploy**.
5. To create demo data and an admin account on instances without a shell, temporarily add `python manage.py createsuperuser --noinput || true` and `python manage.py seed_demo` to the API start command (with the `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD` and `DJANGO_SUPERUSER_FULL_NAME` variables), deploy once, then restore the normal command.

---

## Design

The interface is intentionally simple, clean and responsive.

- **Typeface:** Plus Jakarta Sans, loaded with `@fontsource-variable/plus-jakarta-sans`.
- **Colors:** white surfaces and near-black text with a single red accent. Colors are CSS variables in `frontend/src/app/globals.css` and are mapped in `tailwind.config.ts`.
- **Logo:** a heart with a plus sign (`frontend/src/components/Logo.tsx`), usable as a favicon.
- **Layout:** mobile-first, with a navbar that collapses into a menu on small screens.
- **Components:** shared button, card, input and badge styles live in `globals.css` and `components/ui.tsx`.

---

## Project layout

```
backend/
  config/                Django settings (environment driven), Celery app, URLs
  apps/core/             blood.py (compatibility rules), geo helpers, permissions, seed_demo
  apps/accounts/         custom User (email login, role, hospital link)
  apps/hospitals/        Hospital (PostGIS point, verified flag), onboarding
  apps/donors/           DonorProfile (eligibility, reliability), Donation, eligibility reminders
  apps/bloodrequests/    BloodRequest, DonorMatch, RequestEvent
                         matching.py  wave engine and scoring
                         services.py  every state change (verify, accept, confirm, ...)
                         tasks.py     Celery waves and expiry
  apps/notifications/    Notification model, SMS (console or Twilio) and email channels
frontend/
  src/app/               /, /login, /register, /request/new, /requests, /requests/[id],
                         /r/[code] (public share page), /donor, /hospital
  src/components/        Nav, Footer, Logo, AuthShell, CompatibilityExplorer, pickers, UI kit
  src/lib/               API client (JWT and refresh), auth context, blood rules, types
docs/screenshots/        screenshots of the app
docker-compose.yml       db, redis, backend, worker, beat, frontend
```

## API (main endpoints)

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register/`, `/api/auth/token/` | anyone |
| POST | `/api/hospitals/onboard/` | new hospital (unverified until an admin approves) |
| GET | `/api/hospitals/?lat=&lng=&q=` | anyone, nearest verified hospitals |
| POST, GET | `/api/requests/`, `/api/requests/{id}/` | family or staff |
| POST | `/api/requests/{id}/verify/`, `reject/`, `cancel/` | staff (cancel: the creator too) |
| GET | `/api/donors/me/alerts/` | donor |
| POST | `/api/matches/{id}/accept/`, `decline/` | donor |
| POST | `/api/matches/{id}/arrived/`, `confirm/`, `no-show/` | staff |
| GET | `/api/public/feed/`, `stats/`, `requests/{code}/`, `compatibility/` | anyone (anonymised) |

The full interactive reference is at `/api/docs/`.

## Future improvements

- Phone OTP verification at sign-up.
- A real SMS provider for India (MSG91 or Gupshup, with DLT-registered templates).
- Web push or WhatsApp Business notifications for faster alerts.
- A dedicated hospital approval screen instead of the Django admin action.
- Blood-bank stock from e-RaktKosh where an API is available.
- Serving admin static files with WhiteNoise.

> BloodLink supports a hospital's blood bank and never replaces it. In a life-threatening emergency, call 112.
