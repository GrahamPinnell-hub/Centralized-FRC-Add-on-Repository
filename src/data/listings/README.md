# Listing Manifests

This folder is now the beta source of truth for repository listings.

Each `.json` file in this folder represents one public listing manifest that the site can build, seed, and browse.

Current beta rules:

- One listing per file
- File name should match the listing `slug`
- `slug` values must stay unique across the folder
- Media, files, tags, category, license, and owner metadata all live in the manifest
- GitHub review can treat these files as the publish lane before a live backend exists

Validator notes:

- `npm run validate:listings` hard-fails real schema and duplicate problems
- Placeholder `#` file links and generic source homepages still pass as warnings for beta
- The validator now prints a `submission readiness` line for each manifest
- `ready` means the manifest has no errors and no beta-placeholder warnings
- `beta-only` means the manifest can still build the site, but it is not clean enough for a stronger repository submission lane yet

Recommended workflow for the beta stage:

1. Create or update a listing through the upload builder
2. Export the JSON manifest
3. Review or merge the manifest into this folder
4. Let the static build regenerate the browse and detail pages from these repo files
