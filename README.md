# Centralized FRC Add-on Repository

This is the clean V1 scaffold for a searchable FRC resource repository focused on practical robot add-ons like 3D prints, sheet metal files, electronics mounting hardware, and later PCB and code-related resources.

## What this scaffold already covers

- Home / explore page
- Search and filter page
- Category page
- Part detail page
- Creator profile page
- Upload page
- Login and registration pages
- Report listing page
- Seed sample catalog data
- Prisma schema for the long-term data model

## V1 scope in this scaffold

- Search by title, summary, team, tags, vendor, product, season, material, and file type
- Categories for FRC add-ons
- Part detail pages with compatibility tags, file listings, print settings, install notes, gallery cards, version history, and a basic built-in 3D viewer shell
- Download support modeled for `STL`, `STEP`, `3MF`, `DXF`, `ZIP`, and source CAD links
- Auto-approved upload flow with report-based moderation
- Team-friendly creator profiles

## GitHub Pages deployment

This repository is meant to be the source repo, not a manual upload folder.

- Push code to `main`
- GitHub Actions builds the static export
- GitHub Pages deploys the generated `out/` directory automatically

The build automatically infers the correct GitHub Pages base path for project repos such as `/Centralized-FRC-Add-on-Repository`.

The deployment workflow lives in `.github/workflows/deploy-pages.yml`.

## Run locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Build locally

```bash
npm install
npx prisma generate
npm run build:pages
```

If you want to test a project-repo path locally, set `BASE_PATH` before the build. Example:

```powershell
$env:BASE_PATH='/Centralized-FRC-Add-on-Repository'
npm run build:pages
```

## Design intent

This project takes product inspiration from repository sites like CreateMod, Printables, and Thingiverse, but the data model and pages are being rebuilt around FRC needs: drivetrain accessories, vision mounts, wire management, electronics packaging, sheet metal patterns, and eventually PCB and code resources that teams can reuse instead of redesigning each season.
