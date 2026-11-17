import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROTOCOLS } from '@/data/protocols';
import { getCoverage } from '@/data/coverage';
import ProtocolDetail from '@/components/ProtocolDetail';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface ProtocolPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return PROTOCOLS.map((protocol) => ({ slug: protocol.slug }));
}

export async function generateMetadata({ params }: ProtocolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const protocol = PROTOCOLS.find((entry) => entry.slug === slug);
  if (!protocol) return {};

  const title = `${protocol.name} — ${protocol.fullName}`;
  const description = `${protocol.shortSummary} Interactive ${protocol.name} packet flow, ${protocol.osiLayer} layer details, and knowledge check.`;
  const url = `${SITE_URL}/protocols/${protocol.slug}`;

  return {
    title,
    description,
    keywords: [protocol.name, protocol.fullName, protocol.category, protocol.osiLayer, protocol.rfc].filter(
      Boolean,
    ) as string[],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function ProtocolPage({ params }: ProtocolPageProps) {
  const { slug } = await params;
  const index = PROTOCOLS.findIndex((entry) => entry.slug === slug);
  const protocol = PROTOCOLS[index];

  if (!protocol) notFound();

  const previous = index > 0 ? PROTOCOLS[index - 1] : null;
  const next = index < PROTOCOLS.length - 1 ? PROTOCOLS[index + 1] : null;

  const coverage = getCoverage(protocol.slug);
  const prerequisites = (coverage?.prerequisites ?? [])
    .map((slug) => PROTOCOLS.find((entry) => entry.slug === slug))
    .filter((entry): entry is (typeof PROTOCOLS)[number] => Boolean(entry))
    .map((entry) => ({ slug: entry.slug, name: entry.name }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${protocol.name} (${protocol.fullName})`,
    description: protocol.shortSummary,
    url: `${SITE_URL}/protocols/${protocol.slug}`,
    learningResourceType: 'Interactive lesson',
    educationalLevel: 'Intermediate',
    about: protocol.category,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProtocolDetail
        protocol={protocol}
        previousProtocol={previous ? { slug: previous.slug, name: previous.name } : null}
        nextProtocol={next ? { slug: next.slug, name: next.name } : null}
        tier={coverage?.tier ?? null}
        difficulty={coverage?.difficulty ?? null}
        lastReviewed={coverage?.lastReviewed ?? null}
        prerequisites={prerequisites}
      />
    </>
  );
}
