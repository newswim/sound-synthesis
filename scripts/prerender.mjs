// Post-build prerender: stamp dist/index.html into per-lesson pages with unique
// title/description/canonical/OG + JSON-LD, and emit sitemap.xml. No SSR — the
// app hydrates the same bundle; only the <head> differs per route. Vercel serves
// these static files before the SPA rewrite kicks in.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const distUrl = (p) => new URL(`../dist/${p}`, import.meta.url);
const meta = JSON.parse(
  readFileSync(new URL('../src/lib/lessons/meta.json', import.meta.url), 'utf8'),
);
const template = readFileSync(distUrl('index.html'), 'utf8');
const BASE = meta.baseUrl;
const lessons = meta.sections.flatMap((s) =>
  s.lessons.map((l) => ({ ...l, section: s.title })),
);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function metaContent(html, keyAttr, value, content) {
  const re = new RegExp(`(<meta[^>]*${keyAttr}="${value}"[^>]*content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`meta ${keyAttr}=${value} not found in template`);
  return html.replace(re, `$1${esc(content)}$2`);
}

function stamp({ title, description, url, ogType, jsonld }) {
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = metaContent(html, 'name', 'description', description);
  html = metaContent(html, 'property', 'og:type', ogType);
  html = metaContent(html, 'property', 'og:title', title);
  html = metaContent(html, 'property', 'og:description', description);
  html = metaContent(html, 'property', 'og:url', url);
  html = metaContent(html, 'name', 'twitter:title', title);
  html = metaContent(html, 'name', 'twitter:description', description);
  return html.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(jsonld)}</script></head>`,
  );
}

// `sound` is lesson 1 and canonicalizes to the homepage (same content at "/").
const pageUrl = (l) => (l.slug === 'sound' ? `${BASE}/` : `${BASE}/${l.slug}`);

const course = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: meta.siteName,
  description: meta.siteDescription,
  url: `${BASE}/`,
  provider: { '@type': 'Organization', name: meta.siteName, url: `${BASE}/` },
  isAccessibleForFree: true,
  hasPart: lessons.map((l) => ({
    '@type': 'LearningResource',
    name: l.title,
    url: pageUrl(l),
  })),
};

// Homepage: keep template head, add WebSite + Course JSON-LD.
writeFileSync(
  distUrl('index.html'),
  template.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify([
      { '@context': 'https://schema.org', '@type': 'WebSite', name: meta.siteName, url: `${BASE}/` },
      course,
    ])}</script></head>`,
  ),
);

for (const l of lessons) {
  const html = stamp({
    title: `${l.title} · ${meta.siteName}`,
    description: l.description,
    url: pageUrl(l),
    ogType: 'article',
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: l.title,
      description: l.description,
      url: pageUrl(l),
      learningResourceType: 'Interactive lesson',
      educationalLevel: 'Beginner',
      teaches: l.blurb,
      isAccessibleForFree: true,
      isPartOf: { '@type': 'Course', name: meta.siteName, url: `${BASE}/` },
    },
  });
  mkdirSync(distUrl(l.slug), { recursive: true });
  writeFileSync(distUrl(`${l.slug}/index.html`), html);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [`${BASE}/`, ...lessons.filter((l) => l.slug !== 'sound').map((l) => `${BASE}/${l.slug}`)];
writeFileSync(
  distUrl('sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);

console.log(`prerendered ${lessons.length} lesson pages + sitemap (${urls.length} urls)`);
