# RAILFLOW
## "Predict the seat before it becomes empty."

> **Prototype only — Railway/IRCTC/PRS/CRIS/HHT integrations are simulated. No real railway connection.**

---

## Problem

A passenger may want to travel from Station A to Station B, but no confirmed berth is available for A → B.

A confirmed berth **may be available** if the passenger books to a **later station** on the same train.

**Example:**
- Requested journey: Bengaluru → Mumbai Central
- No confirmed berth available
- But: Bengaluru → Surat → **CONFIRMED**
- Mumbai Central is an intermediate station
- Passenger can book to Surat and declare: "I'll actually get off at Mumbai"

---

## Product Insight (Personal Origin)

The concept originates from a repeated real experience: booking train tickets for family members where the actual destination had no confirmed berth, but a confirmed berth was available to a later station — and the actual destination was already known before booking.

This qualitative observation is **not a national statistic**. It is the seed idea for this prototype.

---

## RailFlow Solution

RailFlow captures passenger intent at booking time, creating a predictive signal for railway operations:

```
Passenger declares intent
→ Expected vacancy created (before payment)
→ TTE confirms and locks intent
→ Train approaches declared deboarding station
→ TTE receives alert
→ TTE checks passenger
→ TTE confirms actual deboarding
→ Berth becomes verified vacancy
→ RAC/WL candidates identified
→ Allocation recommendation generated
```

---

## What RailFlow Is NOT

- Not a ticket resale or exchange system
- Not a seat marketplace
- Not a passenger-to-passenger transfer
- Not a replacement for TTE, PRS, CRIS, IRCTC, or Railway rules
- Not an IRCTC clone
- Not connected to any live railway infrastructure

---

## Key Feature: Smart Alternate

When a requested destination has no confirmed berth:
1. Find all trains on that route
2. Check confirmed availability to **later stations** on the same train
3. Show confirmed alternates
4. Rank by: confirmed → fewest stops after requested destination → fare
5. Allow passenger to book the alternate and declare early deboarding intent

**Generic algorithm — works for any train/route combination. No hard-coded city names.**

---

## Passenger Flow

1. **Search** — Enter origin, destination, date, class
2. **Results** — See all trains, availability status, Smart Alternates
3. **Train Details** — Full route visualization with station roles
4. **Passenger Details** — Name, age, gender, mobile (validated)
5. **Early Deboarding** — Declare actual deboarding station (optional)
6. **Review** — See intent preview before payment
7. **Demo Payment** — UPI/Card/Net Banking/Wallet (simulated)
8. **Confirmation** — Digital ticket with PNR, coach, berth (after payment)
9. **My Trips** — Track booking and intent status

---

## TTE Flow

1. TTE device at `/tte`
2. See passengers with deboarding intents on monitored train
3. **CONFIRM EARLY DEBOARDING** — Locks intent. Passenger cannot modify.
4. Train simulator — advance through stations
5. At deboarding station — receive alert
6. **PASSENGER DEBOARDED / STILL ON TRAIN** — Creates or rejects vacancy
7. See allocation recommendations

---

## Vacancy Lifecycle

```
EXPECTED
  ↓ TTE confirms intent
CONFIRMED_INTENT
  ↓ Train reaches deboarding station
DEBOARDING_DUE
  ↓ TTE verifies passenger deboarded
VERIFIED_VACANCY
  ↓ RAC/WL match found
ALLOCATION_RECOMMENDED

Alternative paths:
EXPECTED → CANCELLED (passenger cancels intent)
DEBOARDING_DUE → REJECTED (passenger continues on train)
```

---

## Intent State Machine

```
DECLARED
  ↓ TTE confirms
LOCKED (passenger cannot modify after this)
  ↓ Train reaches station
DEBOARDING_DUE
  ↓ TTE verifies
VERIFIED / PASSENGER_CONTINUED
```

**Backend enforces lock — any API attempt to modify a locked intent returns HTTP 423.**

---

## Confidence Score

| State | Score |
|-------|-------|
| DECLARED | 75% |
| LOCKED (TTE confirmed) | 95% |
| VERIFIED VACANCY | 100% |

*Prototype confidence score — not a production ML prediction.*

---

## RAC/WL Recommendation

After a vacancy is verified:
1. Find matching RAC candidates (same train, segment, class)
2. Find matching WL candidates
3. RAC takes priority over WL
4. Show recommendation with full reasoning

**Recommendation only — final allocation follows Railway rules and authorized PRS/HHT workflow.**

---

## Architecture (Prototype)

```
Passenger App (Next.js Web)
        ↓
RailFlow API (Next.js API Routes)
        ↓
Intent Service (/api/deboarding-intents)
        ↓
Vacancy Prediction (/api/vacancies)
        ↓
Mock TTE Interface (/tte)
        ↓
Simulated RAC/WL Matching (/api/allocations)
```

---

## Production Architecture (Requires Authorization)

```
Passenger App / Authorized booking ecosystem
        ↓
RailFlow Intent Service
        ↓
Authorized Railway Integration Gateway
        ↓
CRIS / PRS / Railway operational systems
        ↓
TTE/HHT
        ↓
Verification → Existing Railway vacancy/allocation workflow
```

> **Actual CRIS/PRS/HHT integration would require:**
> - Authorization from Indian Railways / Ministry of Railways
> - Approved interfaces and APIs
> - Security audit and review
> - Railway operational approval
> - Full compliance with Railway rules and regulations

---

## Tech Stack

- **Frontend**: Next.js 16 App Router · JavaScript/JSX · Tailwind CSS
- **Backend**: Next.js API Routes (server-side) · JavaScript
- **Data**: In-memory store (module singleton) · Mock railway data
- **No database required** — all state in server memory
- **No TypeScript** — pure JavaScript/JSX
- **No React Native** — responsive Next.js web app

---

## Mock Data

- **28 stations** across India (Karnataka, Maharashtra, Gujarat, Tamil Nadu, Kerala, Telangana, Delhi, Rajasthan)
- **8 trains** on 6 different routes
- **50+ availability matrix entries**
- **100+ mock berths** per coach
- **Seeded RAC/WL candidates** for main demo scenario
- **Deterministic demo** — main flow works immediately after reset

---

## What Is Simulated

- ✅ Train search and availability
- ✅ Booking creation and PNR generation  
- ✅ Seat/coach allocation
- ✅ Payment processing (UPI/Card/Net Banking/Wallet)
- ✅ Deboarding intent workflow
- ✅ TTE device and verification
- ✅ Train station advancement
- ✅ Vacancy creation and lifecycle
- ✅ RAC/WL matching and recommendation

## What Would Be Real In Production

- 🔴 IRCTC booking integration
- 🔴 PRS/CRIS real-time availability
- 🔴 HHT (Handheld Terminal) integration
- 🔴 Actual payment processing
- 🔴 Real PNR numbers from Railway system
- 🔴 Real TTE authentication and authorization
- 🔴 ML-based confidence scoring
- 🔴 Live train position data

---

## How To Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**App runs on: http://localhost:3000**

---

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stations` | GET | All stations |
| `/api/trains` | GET | All trains |
| `/api/trains/search` | POST | Search trains |
| `/api/trains/:id` | GET | Train details |
| `/api/trains/:id/route-detail` | GET | Route with context |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/:id` | GET | Get booking |
| `/api/payments/demo` | POST | Demo payment |
| `/api/deboarding-intents` | POST/GET | Create/list intents |
| `/api/deboarding-intents/:id` | GET/PATCH | Intent operations |
| `/api/deboarding-intents/:id/tte-confirm` | POST | TTE locks intent |
| `/api/vacancies` | GET | All vacancies |
| `/api/vacancies/:id/verify-deboarding` | POST | Verify deboarding |
| `/api/notifications` | GET | TTE notifications |
| `/api/notifications/:id/read` | POST | Mark read |
| `/api/train-progress` | GET | Train position |
| `/api/train-progress/advance` | POST | Move to next station |
| `/api/operations/dashboard` | GET | Operations overview |
| `/api/rac-candidates` | GET | RAC/WL candidates |
| `/api/allocations` | GET | Recommendations |
| `/api/demo/reset` | POST | Reset all demo data |
| `/api/tte/passengers` | GET | TTE passenger list |

---

## Main Demo Flow (2-minute walkthrough)

1. **Open app** → Splash shows only "RAILFLOW" → auto-redirects to Search
2. **Search** Bengaluru → Mumbai Central · 3A · (any future date)
3. **See**: 3 trains — all WL/RAC. No confirmed berth.
4. **Smart Alternate appears**: Bengaluru → Surat CONFIRMED (Mumbai is intermediate)
5. **Click**: "Book This Alternate"
6. **Passenger details**: Enter name, age, gender, mobile
7. **Early Deboarding**: Select "Yes" → Select "Mumbai Central"
8. **See**: Intent preview — Expected vacancy: Mumbai → Surat
9. **Review**: See booking summary with intent note
10. **Payment**: UPI `demo@upi` → Pay → Success
11. **Confirmation**: Ticket with PNR, Coach B1, Berth 1, intent registered
12. **TTE (/tte)**: See passenger with intent — CONFIRM EARLY DEBOARDING
13. **Intent**: LOCKED. Backend rejects any modification attempt.
14. **Train Simulator**: Advance → KJM → TK → UBL → BGM → PUNE → LNL → TNA → DR → MMCT
15. **At MMCT**: TTE notification appears — DEBOARDING CHECK
16. **TTE**: Click "PASSENGER DEBOARDED"
17. **Vacancy**: VERIFIED_VACANCY → ALLOCATION_RECOMMENDED
18. **Priya Sharma (RAC)** recommended for Mumbai → Surat segment
19. **Operations** (/operations): Full dashboard shows all metrics
20. **Reset**: Demo data cleared, seeded state restored

---

## Disclaimer

> This is a prototype for hackathon purposes only.
> RailFlow does not connect to IRCTC, PRS, CRIS, HHT, or any live Railway system.
> All railway data, ticket issuance, payments, TTE verification, and allocation are simulated.
> Demo payment — no real money is charged.
> Recommendation only — final allocation follows Railway rules.
