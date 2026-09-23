# parkerrupe.xyz

My personal site, built with [Astro](https://astro.build) and deployed on Cloudflare Pages.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Edit content

- **Projects:** one Markdown file per project in `src/content/projects/`. The body is the description; the frontmatter holds the name, category, tags, repo, and order. Drop an image in `src/assets/` and reference it with `image:` to show a photo.
- **Everything else** (facts, stats, skills, experience, contact links): `src/data/site.ts`.
- **Styles:** `src/styles/global.css`.

## Deploy

Cloudflare Pages builds every push to `main` with build command `npm run build` and output directory `dist`.

Headings use [Neometric](public/fonts/Neometric-LICENSE.txt) by Andres Sanchez (CC BY-NC-SA 3.0).
