# 🚚 HaulSync — Part Truck Load (PTL) Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Part of HaulSync](https://img.shields.io/badge/HaulSync-TOS%20Module-6366F1)](https://github.com/your-org/haulsync)

> **A self-hostable PTL Transport Operating System — built on the HaulSync platform. Automates the complete Part Truck Load lifecycle: booking & manifestation, auto label generation, bulk API booking, forward & reverse logistics, ePOD, and MIS analytics.**

---

## ✨ PTL Module Overview

| Module | Description |
|--------|-------------|
| 📦 **Booking & Manifestation** | Multi-carrier PTL booking with run-sheet manifest creation |
| 🏷️ **Auto Label Generation** | One-click & bulk label print/download with barcode |
| 🔗 **Bulk Booking via API** | High-volume booking ingestion via REST API |
| 🔁 **Forward & Reverse Logistics** | Full RTO lifecycle — initiate, track, complete |
| ✅ **ePOD Management** | Mobile-captured proof of delivery, photo & signature |
| 📊 **Analytics** | Lane OTP, cost/kg trends, carrier scorecards |
| 📑 **Automated MIS Reports** | Scheduled PDF/Excel reports — daily, weekly, monthly |

---

## 🏗️ Architecture

```
haulsync-ptl/
├── backend/
│   └── src/routes/
│       ├── bookings.js     # PTL booking CRUD + bulk API
│       ├── manifests.js    # Run-sheet & dispatch management
│       ├── labels.js       # Label generation & download
│       ├── epod.js         # ePOD capture & verification
│       ├── reverse.js      # RTO & return logistics
│       ├── vendors.js      # Carrier master & scorecard
│       ├── analytics.js    # PTL KPIs & charts
│       ├── mis.js          # Scheduled report engine
│       └── auth.js
├── frontend/src/pages/
│   ├── Dashboard.jsx
│   ├── Bookings/BookingsPage.jsx
│   ├── Manifests/ManifestsPage.jsx
│   ├── Labels/LabelsPage.jsx
│   ├── ePOD/ePODPage.jsx
│   ├── Reverse/ReversePage.jsx
│   ├── Vendors/VendorsPage.jsx
│   ├── Analytics/AnalyticsPage.jsx
│   └── MIS/MISPage.jsx
├── docker-compose.yml
└── .env.example
```

**Tech Stack** — identical to HaulSync FTL & Core:

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 18, Express.js, Prisma ORM, PostgreSQL 15 |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts |
| **Auth** | JWT + bcrypt (shared session with HaulSync core if co-deployed) |
| **Theme** | Indigo accent (`#6366F1`) — distinct from FTL amber |

---

## 🔄 PTL Lifecycle

```
Booking Created (single / bulk API)
        │
        ▼
Label Auto-Generated → Printed / Downloaded
        │
        ▼
Manifest Created (multi-stop run sheet)
        │
        ▼
Dispatch → Real-time Tracking per AWB
        │
        ▼
Delivered → ePOD Captured (photo + signature)
        │                      │
        │              ePOD Verified → Invoice
        │
   Not Delivered → RTO Initiated → Return Trip → RTO Delivered
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-org/haulsync-tos-ptl.git
cd haulsync-tos-ptl
cp .env.example .env
docker compose up -d
```

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:5002

### Default credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@haulsync.local` | `Admin@1234` | SUPER_ADMIN |
| `manager@haulsync.local` | `Mgr@1234` | MANAGER |
| `finance@haulsync.local` | `Finance@1234` | FINANCE |
| `transporter@haulsync.local` | `Trans@1234` | TRANSPORTER |

---

## 📜 License

MIT License — Part of the HaulSync open-source logistics ecosystem.
