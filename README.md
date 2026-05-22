# 🚐 Fleet Vehicle Management System (FVMS)

A full-featured web application for managing a fleet of vehicles, drivers, maintenance records, and trip operations. Built with **Next.js 16** + **TypeScript** and styled with **Tailwind CSS v4**.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roles & Permissions](#roles--permissions)
- [Screenshots / Pages Overview](#screenshots--pages-overview)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.7 + React 19 |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **Charts** | Recharts 2 |
| **Form Handling** | React Hook Form + Zod |
| **State Management** | React Context (localStorage persistence) |
| **UI Components** | Radix UI (shadcn/ui primitives) + shadcn/ui |
| **Icons** | Lucide React |
| **Date Utils** | date-fns |
| **Auth** | JWT decoder (client-side guard) |
| **Database** | LocalStorage (demo / local-edge) |
| **Deployment target** |Vercel-ready |

---

## Features

### 🗂️ Vehicle Management
- Full **CRUD** for vehicles (plate number, make, model, year, status, fuel consumption)
- Statuses: **Active · Maintenance · Inactive**
- Inline action badges per card; sortable table view

### 👤 Driver Management
- Register, edit, and remove drivers
- Tracks licence number, contact, assigned vehicle, and on-leave status
- `vehicle` / `driver` detail pages via ID-based routing

### 🔧 Maintenance Logging
- Add and delete maintenance records per vehicle (type, cost, notes)
- Total cost aggregation across fleet
- Most-recent-first sorting on the admin dashboard

### 📋 Incident Reporting & Review
- Drivers can report incidents (type, severity, description)
- Managers / admins:
  - **Triage queue** with severity-priority ranking
  - **Inline review** with a modal dialog that captures resolution notes
  - **Approve & Close** — moves record to `reviewed`
  - **Reopen** — sends it back to `reported`
  - **Delete** — permanently removes with a confirming `AlertDialog`
- Dark-themed severity badges (High / Medium / Low)

### 🛣️ Trip Operations
- **Start / complete** a trip per driver & vehicle
- Records start/end fuel, distance, and elapsed time
- Active trip counter on the admin dashboard

### 🧾 Inspection Reports
- Pre / post trip inspections for drivers
- Statuses: `good` · `minor_issue` · `major_issue`
- Reviewed on the admin / manager review page

### 🔐 Role-Based Access Control
| Role | Capabilities |
|---|---|
| **Admin / Fleet Manager** | Full access — vehicles, drivers, maintenance, incidents, reports, monitoring |
| **Driver** | Read-only vehicle view + start/end trips + submit incidents + inspections |
| **Unauthenticated** | Redirected to login |

---

## Project Structure

```
app/
  layout.tsx             → Root layout + favicon + theme
  page.tsx               → Route redirect (auth → dashboard or → login)
  globals.css            → Tailwind globals
  login/page.tsx         → Auth login
  (dashboard)/
    layout.tsx           → Dashboard shell + sidebar
    dashboard/page.tsx   → Admin dashboard (KPIs, charts, alerts, quick actions)
    vehicles/page.tsx    → Vehicle list
    drivers/page.tsx     → Driver list
    maintenance/page.tsx → Maintenance records
    driver/
      trips/page.tsx     → Driver trip view
      incidents/page.tsx → Driver incident report
      inspections/page.tsx → Driver inspections
    manager/
      incidents-review/page.tsx → Manager/FM review queue
      monitoring/page.tsx       → Live monitoring
    admin/
      users/page.tsx         → Admin user list
      inspections/page.tsx   → Admin inspections overview
    reports/page.tsx          → Fleet reports

components/
  ui/                    → shadcn/ui primitives (Button, Card, Table, Dialog…)
  dashboard/             → Screen-specific widgets
  drivers/               → Driver form + table
  vehicles/              → Vehicle form + table
  maintenance/           → Maintenance form + table
  layout/                → Sidebar, ProtectedRoute, RoleProtectedRoute

contexts/
  data-context.tsx       → Fleet data (all CRUD, localStorage sync)
  auth-context.tsx       → Auth state (login / role / user)

lib/
  auth.ts                → LocalStorage-backed auth helpers
  utils.ts               → `cn()` classname merge utility
  role-permissions.ts    → Role → allowed-route lookup
  export.ts              → Fleet data export

public/                   → Static assets (icons, placeholders)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm / yarn

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3000

### Production Build

```bash
pnpm build
pnpm start
```

### Environment

All data is stored in `localStorage` — no backend or database is required for development and demonstration.

---

## Roles & Permissions

| Route | Admin / FM | Driver |
|---|---|---|
| `/dashboard` | ✅ Full | ✅ (limited) |
| `/vehicles` | ✅ | ❌ |
| `/drivers` | ✅ | ❌ |
| `/maintenance` | ✅ | ❌ |
| `/manager/incidents-review` | ✅ | ❌ |
| `/driver/trips` | ✅ | ✅ |
| `/driver/incidents` | ✅ | ✅ |
| `/login` | ✅ | ✅ |

---

## Screenshots / Pages Overview

### Admin Dashboard (`/dashboard`)
- **5-column** KPI grid (vehicles, active %, maintenance, drivers, ongoing trips)
- **3-column** secondary KPIs (incidents, inspections, on-leave drivers)
- Proactive **alert banners** (unresolved incidents, maintenance, leave)
- **Quick Actions** card with deep-links to all fleet routes
- **Key Metrics** card (cost, inspection/inspection status, fleet distribution)
- **Unresolved Incidents** table
- **Recent Maintenance** table
- **Activity Feed** (auto-refreshing)

### Incident Review (`/manager/incidents-review`)
- 6-KPI header strip (pending · reviewed · inspections · high / medium / low)
- **Tabbed queue**: Pending · Reviewed · All
- **Live text filter** (vehicle plate · driver name · incident type·description)
- **Modal review dialog** — resolution notes + Approve or Reopen actions
- **Bulk summary table** with ticket numbering, severity/status badges, and action buttons per row

---

## Data Model

```ts
Vehicle    { id, vehicleId, plateNumber, model, brand, year, status, fuelConsumption, createdAt, updatedAt }
Driver     { id, userId, name, licenseNumber, contactNumber, assignedVehicleId, status, createdAt, updatedAt }
Maintenance { id, vehicleId, type, date, cost, notes, createdAt }
Trip       { id, driverId, vehicleId, startTime, endTime, status, fuelStart, fuelEnd, distanceTraveled, createdAt }
Incident   { id, driverId, vehicleId, type, severity, description, status, approvedBy, submittedAt }
Inspection { id, tripId, driverId, vehicleId, type, status, notes, submittedAt }
```

---

*Built with ❤️ by Group 4 — Frontend Presentation*
