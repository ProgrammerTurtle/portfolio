import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects.
// The file body is the project's description; everything else is frontmatter.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      order: z.number(), // position in the list, lowest first
      cat: z.enum(['printer', 'rocketry', 'composites']),
      kicker: z.string(),
      summary: z.string().optional(), // one line shown in the list; the body shows under "More"
      featured: z.boolean().default(false),
      flag: z.string().optional(),
      detail: z.string().optional(),
      note: z.string().optional(),
      chips: z.array(z.string()),
      repo: z.string().optional(), // repo name under github.com/ProgrammerTurtle
      image: image().optional(),
      imageAlt: z.string().optional(),
      tile: z.object({ value: z.string(), label: z.string() }).optional(), // shown when there's no image
    }),
});

export const collections = { projects };
