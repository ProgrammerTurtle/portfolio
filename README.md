# parkerrupe.xyz

My personal site, built with [Astro](https://astro.build) and deployed on Cloudflare Pages.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Edit content

- **Projects:** one Markdown file per project in `src/content/projects/`. The body is the description; the frontmatter holds the name, category, tags, repo, and order. Drop an image in `src/assets/` and reference it with `image:` to show a photo; without one, add a `tile:` with a headline `value` and `label` (see `quantumania.md`).
- **Everything else** (facts, skills, experience, contact links): `src/data/site.ts`.
- **Styles:** `src/styles/global.css`.

## Scripts

- `node scripts/neometric-extras.mjs` rebuilds `public/fonts/Neometric-Extras.otf`, the characters Neometric doesn't ship (é, @, hyphens, quotes, slash…), drawn to match. Re-run it if you add a character the page needs; it prints the `unicode-range` to paste into `global.css`.
- `node scripts/og-image.mjs` rebuilds the social preview image, `public/og.png`.

## Deploy

Cloudflare Pages builds every push to `main` with build command `npm run build` and output directory `dist`.

Headings use [Neometric](public/fonts/Neometric-LICENSE.txt) by Andres Sanchez (CC BY-NC-SA 3.0). `Neometric-Extras.otf` is a derivative that adds missing characters, under the same license.
