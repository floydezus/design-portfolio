import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each collection holds one YAML file per locale; the entry id is the locale code.
const byLocale = (dir: string) => glob({ pattern: '*.yaml', base: `./src/content/${dir}` });

const ui = defineCollection({
  loader: byLocale('ui'),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string().max(160),
      ogImageAlt: z.string(),
    }),
    a11y: z.object({
      skipLink: z.string(),
      mainNav: z.string(),
    }),
    nav: z.object({
      cv: z.string(),
      email: z.string(),
      telegram: z.string(),
    }),
    works: z.object({
      heading: z.string(),
      indexLabel: z.string(),
    }),
    project: z.object({
      pager: z.string(),
      prev: z.string(),
      next: z.string(),
      gallery: z.string(),
      carousel: z.string(),
    }),
    cv: z.object({
      title: z.string(),
      description: z.string().max(160),
      heading: z.string(),
      download: z.string(),
      education: z.string(),
      skills: z.string(),
      experience: z.string(),
      approach: z.string(),
      present: z.string(),
    }),
    notFound: z.object({
      title: z.string(),
      text: z.string(),
      back: z.string(),
    }),
  }),
});

const titledText = z.object({ title: z.string(), text: z.string() });

const profile = defineCollection({
  loader: byLocale('profile'),
  schema: z.object({
    name: z.string(),
    nameLatin: z.string().optional(),
    role: z.string(),
    intro: z.string(),
    location: z.object({
      city: z.string(),
      country: z.string(),
      countryCode: z.string().length(2),
    }),
    contacts: z.object({
      email: z.email(),
      telegram: z.string().regex(/^[a-zA-Z0-9_]{5,32}$/),
    }),
    cvPdf: z.string().startsWith('/'),
    tools: z.array(z.string()).nonempty(),
    skills: z.array(z.string()).nonempty(),
    approach: z.array(titledText).nonempty(),
    experience: z
      .array(
        z.object({
          company: z.string(),
          url: z.url().optional(),
          role: z.string(),
          start: z.number().int(),
          end: z.number().int().nullable(),
          location: z.string().optional(),
          format: z.string(),
          duties: z.array(z.string()).nonempty(),
        }),
      )
      .nonempty(),
    education: z
      .array(
        z.object({
          institution: z.string(),
          url: z.url().optional(),
          degree: z.string().optional(),
          place: z.string(),
        }),
      )
      .nonempty(),
    languages: z.array(z.object({ name: z.string(), level: z.string() })).nonempty(),
  }),
});

const gridColumn = z.number().int().min(1).max(12);

// Free placement on the 12-column grid (desktop) and as an inset strip (mobile).
const gridLayout = z
  .object({
    row: z.number().int().min(1),
    colStart: gridColumn,
    colSpan: gridColumn,
    offset: z.number().min(0).max(12).default(0),
  })
  .refine((l) => l.colStart + l.colSpan <= 13, 'layout overflows 12 columns');
const mobileLayout = z
  .object({
    inset: z.number().min(0).max(50),
    width: z.number().min(40).max(100),
  })
  .refine((m) => m.inset + m.width <= 100, 'mobile inset + width exceeds 100%');

// One Markdown file per project in a locale folder: projects/<locale>/<slug>.md.
// A project gets its own page when it has a gallery; the body is the page text.
const projects = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        order: z.number().int(),
        title: z.string(),
        category: z.string(),
        // "extra" entries are shown with asterisk markers and in italics, like side sections.
        kind: z.enum(['project', 'extra']).default('project'),
        summary: z.string().optional(),
        cover: image(),
        alt: z.string().min(1),
        layout: gridLayout,
        mobile: mobileLayout,
        facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
        // Laid out in rows by default; when every image has a layout, it is placed freely on the grid instead.
        gallery: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(1),
              layout: gridLayout.optional(),
              mobile: mobileLayout.optional(),
            }),
          )
          .nonempty()
          .optional(),
        // Images per gallery row; each row is laid out at a shared height. Defaults to rows of three.
        galleryRows: z.array(z.number().int().min(1).max(4)).nonempty().optional(),
        // Single works shown after the gallery in a horizontal scroll strip.
        carousel: z.array(z.object({ src: image(), alt: z.string().min(1) })).nonempty().optional(),
      })
      .refine((p) => !p.gallery || p.summary, 'a project with a gallery needs a summary')
      .refine(
        (p) => !p.galleryRows || p.galleryRows.reduce((sum, n) => sum + n, 0) === p.gallery?.length,
        'galleryRows must add up to the number of gallery images',
      )
      .refine(
        (p) => !p.gallery || p.gallery.every((i) => !i.layout === !i.mobile),
        'a gallery image needs both layout and mobile, or neither',
      )
      .refine((p) => {
        const placed = p.gallery?.filter((i) => i.layout).length ?? 0;
        return placed === 0 || (placed === p.gallery?.length && !p.galleryRows);
      }, 'place either every gallery image or none, and drop galleryRows when placing'),
});

export const collections = { ui, profile, projects };
