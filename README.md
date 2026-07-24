# GeoSME Batangas

**A research data platform and interactive GIS mapping dashboard for the CABE Research Department, Batangas.**

GeoSME Batangas gives researchers a structured place to record and maintain
Small and Medium Enterprise (SME) profiles — business details, asset size,
years of operation, and financial technology usage — gathered through
DTI-based fieldwork. The interactive map and analytics dashboards are a
live reflection of that stored data: as researchers add or update SME
records, the map, density visualizations, and charts update automatically.
There's no separate manual step to keep the map "in sync" — the map _is_
the data.

🔗 **Live site:** [geosme-batangas.com](https://geosme-batangas.com)

---

## What it does

- **SME data management** — structured records for each business: name,
  asset size, years of operation, type/form of business organization,
  number of employees, average monthly income, municipality, and which
  financial technologies it uses.
- **Interactive GIS map** (Leaflet) — every studied SME plotted as a marker,
  sized and styled by asset size, with zoom-responsive icon sizing and
  click-to-fly navigation.
- **Live search** — type-ahead search across SME name, business type, and
  address; selecting a result flies the map to it and opens its details.
- **Municipality boundaries** — toggle municipality outlines on the map,
  with fly-to-zoom when one is selected from the sidebar filter.
- **Density heatmaps** — choropleth visualization of SME concentration
  (per km²) and financial technology adoption rate per municipality, using
  the CABE-configured 4-tier color scale (Low / Medium / High / Very High)
  for fintech density.
- **Filters** — narrow the map by asset size, type of business
  organization, form of business organization, and municipality.
- **Analytics dashboard** — SME distribution by municipality, business
  profile breakdowns (years of operation, business type/form, asset size),
  business scale breakdowns (employee count, income bracket), and financial
  technology usage — each with raw counts and percentage-of-total.

---

## Tech stack

| Layer         | Tools                                                                            |
| ------------- | -------------------------------------------------------------------------------- |
| Framework     | [Next.js](https://nextjs.org) (App Router, Server Actions)                       |
| Language      | TypeScript                                                                       |
| Database      | PostgreSQL (via [Supabase](https://supabase.com))                                |
| ORM           | [Prisma](https://www.prisma.io) with the `pg` driver adapter                     |
| Mapping       | [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) |
| Charts        | [Recharts](https://recharts.org)                                                 |
| UI components | Tailwind CSS v4, shadcn-style components on [Base UI](https://base-ui.com)       |
| Icons         | [Lucide](https://lucide.dev)                                                     |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/jerwinIT/geosme-batangas.git
cd geosme-batangas
npm install
```

### 2. Environment variables

Create a `.env` file with:

```bash
DATABASE_URL="postgresql://..."   # Supabase pooled connection string
DIRECT_URL="postgresql://..."     # Supabase direct connection (used for migrations)
```

### 3. Generate the Prisma client

The schema uses Prisma's driver-adapter mode, which requires both preview
features enabled:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../app/generated/prisma"
  previewFeatures = ["queryCompiler", "driverAdapters"]
}
```

```bash
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Data model (high level)

- **SME** — the core business record: asset size, business classification
  fields, location (municipality + lat/lng), and relations to reviews,
  bookmarks, and financial technology usage.
- **Municipality** — name, area (km², used for density calculations),
  center coordinates, and boundary geometry (GeoJSON) for map rendering.
- **FinancialTechnology** — admin-managed list of technologies (e.g.
  digital wallets, e-banking), each with a JSON-encoded 4-tier density
  color scale used for the heatmap.
- **SMEFinancialTechnology** — join table linking SMEs to the financial
  technologies they use.

---

## Project structure

```
app/
  actions/        Server actions (data fetching — SMEs, municipalities,
                   density, insights, search)
  layout.tsx       Root layout + metadata
  page.tsx         Entry point, renders the map view
components/
  BatangasMapView.tsx     Map orchestration (sidebars, search, layers)
  LeftSidebar.tsx          Map controls, layer toggles, filters
  RightSidebar.tsx         Analytics dashboard panel
  DashboardPanel.tsx       SME Insights / Fintech Insights charts
  SMEMarkers.tsx           SME markers + popups
  DensityHeatmap.tsx       Choropleth density layer
  MunicipalityBoundaries.tsx
  MapSearchBar.tsx
lib/
  prisma.ts        Prisma client (driver adapter setup)
  sme-format.ts     Enum → readable label formatting
  density-color.ts  Density tier color logic
types/
  sme.ts, density.ts, municipality.ts, insights.ts
```

---

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this repo's default
branch. Pushing to that branch triggers an automatic build and deploy.

---

## Acknowledgments

Built for the **CABE Research Department**, using SME data collected
through DTI-based fieldwork across Batangas municipalities.
