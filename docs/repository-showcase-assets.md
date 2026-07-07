# Repository Showcase Assets

This document defines the source routes, file conventions, and refresh workflow
for the public GitHub showcase assets used by this repository.

## Scope

These assets are part of the public repository presentation, not the runtime
application bundle:

- `docs/assets/screenshots/home.png`
- `docs/assets/screenshots/writing-studio.png`
- `docs/assets/screenshots/document-studio.png`
- `docs/assets/screenshots/resume-builder.png`
- `docs/assets/screenshots/pricing.png`
- `docs/assets/screenshots/blog.png`
- `docs/assets/screenshots/social-preview.png`

## Current Asset Map

| File                  | Live route                               | Purpose                                | Current size |
| --------------------- | ---------------------------------------- | -------------------------------------- | ------------ |
| `home.png`            | `/`                                      | README gallery: homepage               | `1366x768`   |
| `writing-studio.png`  | `/writing-tools/persian-writing-studio`  | README gallery: flagship writing tool  | `1366x768`   |
| `document-studio.png` | `/business-tools/document-studio`        | README gallery: flagship business tool | `1366x768`   |
| `resume-builder.png`  | `/career-tools/resume-builder`           | README gallery: flagship career tool   | `1366x768`   |
| `pricing.png`         | `/pricing`                               | README gallery: pricing proof          | `1366x768`   |
| `blog.png`            | `/blog`                                  | README gallery: editorial surface      | `1366x768`   |
| `social-preview.png`  | `persiantoolbox.ir` live product preview | top-of-README hero preview             | `2560x1280`  |

## Refresh Rules

- Capture from the live production site at `https://persiantoolbox.ir`, not a
  local dev build.
- Refresh assets after major public releases, homepage redesigns, flagship tool
  UI changes, or pricing/blog visual changes.
- Keep README gallery screenshots stable and representative. Do not swap them
  for temporary experiments, staging content, or broken/loading states.
- If a route has cold-start behavior, wait for the fully rendered UI before
  capturing.
- Review the final PNGs locally before commit so the public repository does not
  showcase transient UI glitches.

## Manual Capture Workflow

1. Open the target live route in a desktop browser at roughly `1366x768`.
2. Wait for the full UI, fonts, and key widgets to render.
3. Capture a clean viewport screenshot without browser chrome where practical.
4. Export as PNG and replace the existing file in `docs/assets/screenshots/`.
5. For `social-preview.png`, export a wider hero-style preview that still reads
   well at GitHub repository card sizes.
6. Verify the updated images in `README.md` before commit.

## Validation

After refreshing assets:

```bash
pnpm exec prettier --check README.md docs/README.md docs/repository-showcase-assets.md
```

Then verify:

- `README.md` still references the same file names
- images render correctly on the GitHub repository page
- the screenshots still reflect the current live product

## Notes

- `scripts/capture-blog-screenshots.js` is for blog/tool image generation under
  `public/images/blog/`; it does not currently manage the repository README
  showcase assets.
- If the team later automates README screenshot capture, update this document
  and keep the asset map as the source of truth.
