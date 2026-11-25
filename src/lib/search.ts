import { PROTOCOLS, CATEGORIES_META } from '@/data/protocols';
import { REFERENCE_ENTRIES, REFERENCE_FAMILIES, REFERENCE_STATUS_META } from '@/data/reference';
import { GLOSSARY } from '@/data/glossary';
import { ATTACKS } from '@/data/attacks';
import { ATTACK_CATEGORIES } from '@/data/attackCategories';
import { slugify } from '@/lib/slug';

export type SearchKind = 'lesson' | 'reference' | 'glossary' | 'attack' | 'page';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Normalised haystack used for matching. */
  searchText: string;
}

export interface SearchKindMeta {
  label: string;
  description: string;
}

export const SEARCH_KIND_META: Record<SearchKind, SearchKindMeta> = {
  lesson: { label: 'Lesson', description: 'Full protocol lesson' },
  reference: { label: 'Reference', description: 'Compact reference card' },
  glossary: { label: 'Term', description: 'Glossary definition' },
  attack: { label: 'Attack', description: 'Defensive threat model' },
  page: { label: 'Page', description: 'Learning tool' },
};

const CATEGORY_LABELS = new Map(CATEGORIES_META.map((category) => [category.id, category.label]));
const FAMILY_LABELS = new Map(REFERENCE_FAMILIES.map((family) => [family.id, family.label]));
const ATTACK_CATEGORY_LABELS = new Map(ATTACK_CATEGORIES.map((category) => [category.id, category.label]));
const PROTOCOL_NAMES = new Map(PROTOCOLS.map((protocol) => [protocol.slug, protocol.name]));

interface StaticPageEntry {
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

const PAGES: StaticPageEntry[] = [
  {
    title: 'Start Here learning path',
    subtitle: 'The 18-lesson beginner course in prerequisite order',
    href: '/start',
    keywords: 'beginner course curriculum path modules learn start',
  },
  {
    title: 'Learning record',
    subtitle: 'Print, export or import your local progress',
    href: '/record',
    keywords: 'progress record completion backup export import print local',
  },
  {
    title: 'Knowledge checks',
    subtitle: 'Free practice quizzes with an explanation for every answer',
    href: '/quiz',
    keywords: 'quiz test practice questions self assessment knowledge',
  },
  {
    title: 'OSI and TCP/IP layers',
    subtitle: 'Seven-layer model and the encapsulation simulator',
    href: '/layers',
    keywords: 'osi tcp ip layer model encapsulation pdu stack',
  },
  {
    title: 'Protocol comparisons',
    subtitle: 'Any two protocols side by side',
    href: '/compare',
    keywords: 'compare versus difference side by side tcp udp',
  },
  {
    title: 'Attack library',
    subtitle: '80 defensive threat models with detection and mitigations',
    href: '/attacks',
    keywords: 'attack security threat detection defence mitigation',
  },
  {
    title: 'Reference registry',
    subtitle: '80 compact cards for standards without a full lesson',
    href: '/reference',
    keywords: 'reference registry standard rfc specification card',
  },
  {
    title: 'Glossary',
    subtitle: 'Networking terms defined without a jargon loop',
    href: '/glossary',
    keywords: 'glossary terms definitions acronyms dictionary',
  },
  {
    title: 'How to read an RFC',
    subtitle: 'Statuses, normative keywords, anatomy and errata',
    href: '/standards',
    keywords: 'rfc standard ietf must should errata reading',
  },
  {
    title: 'Coverage and scope',
    subtitle: 'What the platform teaches, and what it deliberately does not',
    href: '/coverage',
    keywords: 'coverage scope roadmap tiers gaps honesty',
  },
  {
    title: 'Learning dashboard',
    subtitle: 'Mastery, quiz results, bookmarks and study paths',
    href: '/dashboard',
    keywords: 'dashboard progress mastery bookmarks study paths',
  },
  {
    title: 'All protocol lessons',
    subtitle: 'Browse the complete catalog and filters',
    href: '/#protocols',
    keywords: 'catalog protocols lessons directory all',
  },
];

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenise(value: string): string[] {
  return normalise(value)
    .split(' ')
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean);
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const protocol of PROTOCOLS) {
    const categoryLabel = CATEGORY_LABELS.get(protocol.category) ?? protocol.category;
    entries.push({
      id: `lesson:${protocol.slug}`,
      kind: 'lesson',
      title: protocol.name,
      subtitle: `${protocol.fullName} · ${protocol.osiLayer} layer`,
      href: `/protocols/${protocol.slug}`,
      searchText: normalise(
        [
          protocol.name,
          protocol.fullName,
          protocol.shortSummary,
          protocol.description,
          protocol.category,
          categoryLabel,
          protocol.osiLayer,
          protocol.port ? `port ${protocol.port}` : '',
          protocol.rfc ?? '',
          ...protocol.keyFeatures,
          ...protocol.useCases,
        ].join(' '),
      ),
    });
  }

  for (const entry of REFERENCE_ENTRIES) {
    entries.push({
      id: `reference:${entry.id}`,
      kind: 'reference',
      title: entry.name,
      subtitle: `${entry.fullName} · ${FAMILY_LABELS.get(entry.family) ?? entry.family}`,
      href: `/reference#${entry.id}`,
      searchText: normalise(
        [
          entry.name,
          entry.fullName,
          entry.summary,
          entry.standard,
          entry.port ?? '',
          entry.osiLayer,
          CATEGORY_LABELS.get(entry.category) ?? entry.category,
          FAMILY_LABELS.get(entry.family) ?? entry.family,
          REFERENCE_STATUS_META[entry.status].label,
        ].join(' '),
      ),
    });
  }

  for (const entry of GLOSSARY) {
    entries.push({
      id: `glossary:${entry.term}`,
      kind: 'glossary',
      title: entry.term,
      subtitle: entry.definition,
      href: `/glossary#term-${slugify(entry.term)}`,
      searchText: normalise(`${entry.term} ${entry.definition} ${entry.see?.label ?? ''}`),
    });
  }

  for (const attack of ATTACKS) {
    const protocolName = PROTOCOL_NAMES.get(attack.protocolSlug) ?? attack.protocolSlug;
    entries.push({
      id: `attack:${attack.id}`,
      kind: 'attack',
      title: attack.name,
      subtitle: `${protocolName} · ${ATTACK_CATEGORY_LABELS.get(attack.category) ?? attack.category}`,
      href: `/attacks#${attack.id}`,
      searchText: normalise(
        [
          attack.name,
          attack.summary,
          attack.impact,
          protocolName,
          ATTACK_CATEGORY_LABELS.get(attack.category) ?? attack.category,
          ...attack.mitreIds,
          ...attack.mitigations,
          ...attack.steps.map((step) => `${step.title} ${step.detection}`),
        ].join(' '),
      ),
    });
  }

  for (const page of PAGES) {
    entries.push({
      id: `page:${page.href}`,
      kind: 'page',
      title: page.title,
      subtitle: page.subtitle,
      href: page.href,
      searchText: normalise(`${page.title} ${page.subtitle} ${page.keywords}`),
    });
  }

  return entries;
}

export const SEARCH_ENTRIES: SearchEntry[] = buildIndex();

const FEATURED_HREFS = [
  '/start',
  '/quiz',
  '/record',
  '/layers',
  '/attacks',
  '/reference',
  '/glossary',
  '/compare',
];

export const FEATURED_SEARCH_ENTRIES: SearchEntry[] = FEATURED_HREFS.map((href) =>
  SEARCH_ENTRIES.find((entry) => entry.href === href),
).filter((entry): entry is SearchEntry => Boolean(entry));

const KIND_PRIORITY: Record<SearchKind, number> = {
  page: 0,
  lesson: 1,
  reference: 2,
  glossary: 3,
  attack: 4,
};

/**
 * Ranked search across every content type. All query tokens must appear
 * somewhere in the entry; title matches rank above body matches.
 */
export function searchContent(query: string, limit = 30): SearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return FEATURED_SEARCH_ENTRIES.slice(0, limit);

  const tokens = tokenise(trimmed);
  if (tokens.length === 0) return FEATURED_SEARCH_ENTRIES.slice(0, limit);

  const scored: { entry: SearchEntry; score: number }[] = [];

  for (const entry of SEARCH_ENTRIES) {
    const title = entry.title.toLowerCase();
    const subtitle = entry.subtitle.toLowerCase();
    const haystack = entry.searchText;

    let rejected = false;
    let score = 0;

    for (const token of tokens) {
      if (!haystack.includes(token)) {
        rejected = true;
        break;
      }
      if (title === token) score += 120;
      else if (title.startsWith(token)) score += 70;
      else if (title.includes(token)) score += 50;
      else if (subtitle.includes(token)) score += 15;
      else score += 5;
    }

    if (rejected) continue;

    const joined = tokens.join(' ');
    if (title === joined) score += 160;
    else if (title.startsWith(joined)) score += 90;
    else if (title.includes(joined)) score += 60;

    scored.push({ entry, score });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      KIND_PRIORITY[a.entry.kind] - KIND_PRIORITY[b.entry.kind] ||
      a.entry.title.localeCompare(b.entry.title),
  );

  return scored.slice(0, limit).map((item) => item.entry);
}
