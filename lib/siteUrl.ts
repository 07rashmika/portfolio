type Env = Record<string, string | undefined>;

/**
 * The site's public address, for link previews, the sitemap and canonical URLs.
 * NEXT_PUBLIC_SITE_URL wins (set it for a custom domain); on Vercel the production domain is
 * provided automatically as VERCEL_PROJECT_PRODUCTION_URL; locally it's the dev server.
 */
export function siteUrl(env: Env = process.env): URL {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
