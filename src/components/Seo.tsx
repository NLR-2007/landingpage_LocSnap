import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../data/locsnap';

type SeoProps = {
  /** Full <title> for the page. Falls back to the site title. */
  title?: string;
  /** Meta description for the page. Falls back to the site description. */
  description?: string;
  /** Set true on pages that should not be indexed (for example the 404). */
  noindex?: boolean;
};

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Keeps the document head in step with the active route. The site is a single
 * page application, so without this every route would inherit the title and
 * description baked into index.html.
 */
export default function Seo({ title, description, noindex = false }: SeoProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = title ?? SITE_TITLE;
    const pageDescription = description ?? SITE_DESCRIPTION;
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const canonical = `${origin}${pathname}`;

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', pageDescription);
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex ? 'noindex, follow' : 'index, follow'
    );

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', pageDescription);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');

    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', pageDescription);

    upsertLink('canonical', canonical);
  }, [title, description, noindex, pathname]);

  return null;
}
