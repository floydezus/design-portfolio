import { getCollection, getEntry } from 'astro:content';

// Mirrors i18n.defaultLocale in astro.config.mjs.
export const DEFAULT_LOCALE = 'ru';

async function getProjects(locale: string) {
  const entries = await getCollection('projects', ({ id }) => id.startsWith(`${locale}/`));
  entries.sort((a, b) => a.data.order - b.data.order);

  let projectNumber = 0;
  let extraNumber = 0;
  return entries.map((entry) => {
    const slug = entry.id.slice(locale.length + 1);
    const marker = entry.data.kind === 'extra' ? '*'.repeat(++extraNumber) : String(++projectNumber);
    return {
      ...entry.data,
      slug,
      marker,
      href: entry.data.gallery ? `/projects/${slug}/` : undefined,
      entry,
    };
  });
}

export async function getLocaleContent(locale: string) {
  const [ui, profile, projects] = await Promise.all([
    getEntry('ui', locale),
    getEntry('profile', locale),
    getProjects(locale),
  ]);
  if (!ui || !profile || projects.length === 0) {
    throw new Error(`Content for locale "${locale}" is incomplete`);
  }
  return { ui: ui.data, profile: profile.data, projects };
}

export type LocaleContent = Awaited<ReturnType<typeof getLocaleContent>>;
export type Project = LocaleContent['projects'][number];
