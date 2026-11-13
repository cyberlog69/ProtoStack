import type { MetadataRoute } from 'next';
import { PROTOCOLS } from '@/data/protocols';
import { COMPARISON_PRESETS } from '@/data/comparisons';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/layers'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/compare'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/quiz'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const protocolRoutes: MetadataRoute.Sitemap = PROTOCOLS.map((protocol) => ({
    url: absoluteUrl(`/protocols/${protocol.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const comparisonRoutes: MetadataRoute.Sitemap = COMPARISON_PRESETS.map((preset) => ({
    url: absoluteUrl(`/compare/${preset.slugA}/${preset.slugB}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...protocolRoutes, ...comparisonRoutes];
}
