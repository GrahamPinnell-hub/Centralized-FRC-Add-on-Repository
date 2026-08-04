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

## Upload-friendly structure

This folder is intentionally kept small so you can use GitHub's web uploader if you need to.

Recommended upload order:

1. Root files
2. `app/`
3. `src/`
4. `prisma/`

Every file in this scaffold is far below the 25 MB per-file limit, and the total file count is kept low enough to avoid the previous CreateMod import problem.

## Run locally

```bash
npm install
npx prisma db push
npm run dev
```

## Design intent

This project takes product inspiration from repository sites like CreateMod, Printables, and Thingiverse, but the data model and pages are being rebuilt around FRC needs: drivetrain accessories, vision mounts, wire management, electronics packaging, sheet metal patterns, and eventually PCB and code resources that teams can reuse instead of redesigning each season.
