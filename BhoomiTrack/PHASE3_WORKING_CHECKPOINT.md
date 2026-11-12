# SIH26016 Phase 3 Working Checkpoint

Authoritative base: Phase 2 clean application.

Phase 3 additions:
- Officer -> GIS route
- Leaflet map component
- GIS data access through `get_project_gis_data`
- Phase 3 demo geometry/GeoJSON migrations
- Officer GIS navigation entry
- Supabase generated types updated for the GIS RPC

Do not copy `RECOVERY_CONTEXT/` into this checkpoint. The broken Bolt GIS-only application was not used as the root application.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the SAME Supabase project that contains the Phase 1/2 SIH26016 data.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

## Database

Apply the Phase 3 migrations only after confirming the Phase 2 migrations are already present in the target Supabase project.

Phase 3 does not create a new database or replace the Phase 2 schema.
