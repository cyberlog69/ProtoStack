import type { Metadata } from 'next';
import Link from 'next/link';
import { PROTOCOLS, CATEGORIES_META } from '@/data/protocols';
import {
  PLANNED_FAMILIES,
  TIER_META,
  TIER_ORDER,
  countByTier,
  coverageStatus,
  getCoverage,
} from '@/data/coverage';
import { getCategoryBadge, getDifficultyBadge, getLayerColor, getTierBadge } from '@/lib/utils';
import { REFERENCE_ENTRIES } from '@/data/reference';
import { ATTACKS } from '@/data/attacks';
import { ArrowRight, CheckCircle2, CircleDashed, Compass, Map, ShieldCheck, TriangleAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Coverage & Scope',
  description:
    'What ProtoStack covers, what it does not, and how the catalog is tiered into core study, professional knowledge and a reference registry.',
  alternates: { canonical: '/coverage' },
};

const LAYER_ORDER = [
  'Application',
  'Presentation',
  'Session',
  'Transport',
  'Network',
  'Data Link',
  'Physical',
] as const;

const CATEGORIES = CATEGORIES_META.filter((category) => category.id !== 'all');

function tierCountsFor<T extends { slug: string }>(items: T[]) {
  return TIER_ORDER.map((tier) => items.filter((item) => getCoverage(item.slug)?.tier === tier).length);
}

const status = coverageStatus();
const referenceCount = REFERENCE_ENTRIES.length;
const totalWritten = status.written + referenceCount;
const coreProtocols = PROTOCOLS.filter((protocol) => getCoverage(protocol.slug)?.tier === 'core');
const startHere = coreProtocols.find((protocol) => getCoverage(protocol.slug)?.prerequisites.length === 0);

export default function CoveragePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      <header className="space-y-4 border-b border-slate-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Map className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Coverage map &amp; scope statement</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          What this site covers —{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            and what it does not
          </span>
        </h1>

        <p className="text-base text-slate-300 max-w-3xl leading-relaxed">
          &quot;All protocols&quot; is not a finite list: the IANA service registry alone holds around 14,000 entries, and
          most are vendor services rather than distinct protocols. ProtoStack therefore aims at{' '}
          <strong className="text-white">defined, tiered coverage</strong> — deep study for the protocols a beginner
          needs, working knowledge for the professional set, and a reference registry for everything else.
        </p>

        <p className="text-sm text-slate-400 max-w-3xl">
          {totalWritten} entries are published today — {status.written} full lessons and {referenceCount} reference
          cards — against a target of {status.planned}. Every family target is met; the remaining work is depth
          (promoting cards to full lessons), not breadth.
        </p>
      </header>

      <section aria-labelledby="at-a-glance" className="space-y-4">
        <h2 id="at-a-glance" className="text-xl font-bold text-white">
          At a glance
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Entries published" value={String(totalWritten)} detail={`${status.written} lessons + ${referenceCount} cards`} />
          <StatCard
            label="Core study"
            value={`${countByTier('core')} / ${TIER_META[0].target}`}
            detail="beginner on-ramp"
            accent="text-indigo-300"
          />
          <StatCard
            label="Professional"
            value={`${countByTier('professional')} / ${TIER_META[1].target}`}
            detail="working knowledge"
            accent="text-cyan-300"
          />
          <StatCard
            label="Reference"
            value={`${referenceCount} / ${TIER_META[2].target}`}
            detail="registry cards"
            accent="text-slate-300"
          />
        </div>

        {startHere && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-white">Suggested entry point: {startHere.name}</p>
                <p className="text-xs text-slate-300">
                  It has no prerequisites, which makes it the first step in the core reading order.
                </p>
              </div>
            </div>
            <Link
              href={`/protocols/${startHere.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
            >
              Start here
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="tiers" className="space-y-4">
        <h2 id="tiers" className="text-xl font-bold text-white">
          The three tiers
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl">
          A tier describes how much depth an entry has and who it is for. It is not a difficulty rating — those are
          shown separately on every entry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIER_META.map((tier) => {
            const written = tier.id === 'reference' ? referenceCount : countByTier(tier.id);
            const badge = getTierBadge(tier.id);
            const percent = Math.min(100, Math.round((written / tier.target) * 100));

            return (
              <div key={tier.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border leading-tight ${badge.color}`}>
                    {tier.label}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {written} / {tier.target}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{tier.description}</p>

                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="matrix" className="space-y-6">
        <div className="space-y-2">
          <h2 id="matrix" className="text-xl font-bold text-white">
            Coverage matrix
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Where the current {PROTOCOLS.length} entries sit. Empty cells are honest gaps, not oversights: they are
            tracked in the roadmap further down.
          </p>
        </div>

        <MatrixTable
          caption="Protocols by category and tier"
          rowHeader="Category"
          rows={CATEGORIES.map((category) => {
            const items = PROTOCOLS.filter((protocol) => protocol.category === category.id);
            return {
              key: category.id,
              label: category.label,
              cells: tierCountsFor(items),
              total: items.length,
            };
          })}
        />

        <MatrixTable
          caption="Protocols by OSI layer and tier"
          rowHeader="OSI layer"
          rows={LAYER_ORDER.map((layer) => {
            const items = PROTOCOLS.filter((protocol) => protocol.osiLayer === layer);
            return {
              key: layer,
              label: layer,
              cells: tierCountsFor(items),
              total: items.length,
            };
          })}
        />
      </section>

      <section aria-labelledby="catalog" className="space-y-8">
        <div className="space-y-2">
          <h2 id="catalog" className="text-xl font-bold text-white">
            The catalog by tier
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Prerequisites describe a reading order, not a hard dependency. Every link goes to the full lesson.
          </p>
        </div>

        {TIER_ORDER.map((tier) => {
          const entries = PROTOCOLS.filter((protocol) => getCoverage(protocol.slug)?.tier === tier);
          return (
            <div key={tier} className="space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-300">
                {TIER_META[TIER_ORDER.indexOf(tier)].label}{' '}
                <span className="text-slate-500">({entries.length})</span>
              </h3>

              {tier === 'reference' ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {referenceCount} reference cards are published
                    </p>
                    <p className="text-xs text-slate-400">
                      Compact entries for routing, telecom, storage, industrial, management and legacy protocols. They
                      are deliberately excluded from the lesson counts above.
                    </p>
                  </div>
                  <Link
                    href="/reference"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
                  >
                    Open the registry
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ) : entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400 flex items-start gap-3">
                  <CircleDashed className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    No entries in this tier yet. The roadmap below lists the standards queued for it.
                  </span>
                </div>
              ) : (
                <ul className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800 overflow-hidden">
                  {entries.map((protocol) => {
                    const meta = getCoverage(protocol.slug);
                    const category = getCategoryBadge(protocol.category);
                    const difficulty = getDifficultyBadge(meta?.difficulty ?? 'beginner');

                    return (
                      <li key={protocol.slug}>
                        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-900/70 transition-colors">
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/protocols/${protocol.slug}`}
                                className="text-sm font-bold text-white hover:text-indigo-300 transition-colors"
                              >
                                {protocol.name}
                              </Link>
                              <span className="text-xs text-slate-400 font-mono truncate">{protocol.fullName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${category.color}`}>
                                {category.label}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getLayerColor(protocol.osiLayer)}`}>
                                {protocol.osiLayer}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${difficulty.color}`}>
                                {difficulty.label}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400">
                              {meta && meta.prerequisites.length > 0 ? (
                                <>
                                  Read first:{' '}
                                  {meta.prerequisites.map((slug, index) => {
                                    const prerequisite = PROTOCOLS.find((entry) => entry.slug === slug);
                                    if (!prerequisite) return null;
                                    return (
                                      <span key={slug}>
                                        {index > 0 && ', '}
                                        <Link
                                          href={`/protocols/${slug}`}
                                          className="text-cyan-300 hover:underline"
                                        >
                                          {prerequisite.name}
                                        </Link>
                                      </span>
                                    );
                                  })}
                                </>
                              ) : (
                                'No prerequisites — a valid entry point.'
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/protocols/${protocol.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 shrink-0"
                          >
                            Open lesson
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      <section aria-labelledby="roadmap" className="space-y-4">
        <div className="space-y-2">
          <h2 id="roadmap" className="text-xl font-bold text-white flex items-center gap-2">
            <TriangleAlert className="w-5 h-5 text-amber-400" aria-hidden="true" />
            Family coverage
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl">
            Reference cards published against each family target. All family targets are met. The remaining gap is
            depth: promoting more cards to full lessons with an animated flow, sandbox and quiz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANNED_FAMILIES.map((family) => {
            const published = REFERENCE_ENTRIES.filter((entry) => entry.family === family.id).length;
            const percent = Math.min(100, Math.round((published / family.approximateEntries) * 100));

            return (
              <div key={family.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-white">{family.label}</h3>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded whitespace-nowrap">
                    {published} / {family.approximateEntries} cards
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{family.description}</p>

                <div className="h-1 rounded-full bg-slate-800 overflow-hidden" aria-hidden="true">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {family.examples.map((example) => (
                    <span
                      key={example}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="library" className="space-y-4">
        <h2 id="library" className="text-xl font-bold text-white">
          Learning library
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl">
          Coverage is not the same as a course. These pages turn the catalog into something you can work through.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              href: '/start',
              label: 'Start Here path',
              detail: 'Five prerequisite-ordered modules, from Ethernet frames to BGP.',
            },
            {
              href: '/reference',
              label: 'Reference registry',
              detail: `${referenceCount} compact cards for standards without a full lesson.`,
            },
            {
              href: '/attacks',
              label: 'Attack library',
              detail: `${ATTACKS.length} simulated attack scenarios with detection and defences.`,
            },
            {
              href: '/glossary',
              label: 'Glossary',
              detail: 'Every acronym used by the lessons, defined in plain language.',
            },
            {
              href: '/standards',
              label: 'How to read an RFC',
              detail: 'Statuses, normative keywords, document anatomy and errata.',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-1 hover:border-indigo-500/40 transition-colors"
            >
              <span className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
                {item.label}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <span className="block text-xs text-slate-400 leading-relaxed">{item.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="method" className="space-y-4">
        <h2 id="method" className="text-xl font-bold text-white">
          How coverage is verified
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Checked automatically
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {[
                'Every entry has a tier, difficulty and review date.',
                'Prerequisites point at real entries and never form a cycle.',
                'Tier totals always match the catalog, so counts cannot drift.',
                'Every protocol has at least three steps and two quiz questions.',
                'Sandboxes declare whether they are live or simulated.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <TriangleAlert className="w-4 h-4" aria-hidden="true" />
              Not yet verified
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>Content has not been signed off by a named subject-matter expert.</li>
              <li>Automated tests check structure and identifiers, not factual accuracy.</li>
              <li>Protocol behaviour is simplified for teaching; read the cited RFC for normative detail.</li>
              <li>Last catalog review: {status.lastReviewed}. Protocol pages show their own review date.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-200">Scope rule:</strong> an entry is published only if it is a publicly
            documented standard or a widely deployed protocol with an authoritative specification. Vendor-internal,
            undocumented and purely historical protocols stay in the roadmap until they can be sourced properly.
          </p>
          <p>
            Deprecated protocols are kept when reading old packet captures would otherwise be confusing, and are marked
            as legacy in their lesson text.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent = 'text-white',
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</span>
      <div className={`text-2xl font-black font-mono mt-1 ${accent}`}>{value}</div>
      <span className="text-[11px] text-slate-400">{detail}</span>
    </div>
  );
}

function MatrixTable({
  caption,
  rowHeader,
  rows,
}: {
  caption: string;
  rowHeader: string;
  rows: { key: string; label: string; cells: number[]; total: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 font-mono">
            <th scope="col" className="px-4 py-3 font-semibold">
              {rowHeader}
            </th>
            {TIER_META.map((tier) => (
              <th key={tier.id} scope="col" className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                {tier.shortLabel}
              </th>
            ))}
            <th scope="col" className="px-4 py-3 font-semibold text-center">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-slate-900/60">
              <th scope="row" className="px-4 py-2.5 font-medium text-slate-200 text-left">
                {row.label}
              </th>
              {row.cells.map((count, index) => (
                <td
                  key={`${row.key}-${TIER_ORDER[index]}`}
                  className={`px-4 py-2.5 text-center font-mono ${count === 0 ? 'text-slate-600' : 'text-slate-200'}`}
                >
                  {count}
                </td>
              ))}
              <td className="px-4 py-2.5 text-center font-mono font-bold text-white">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
