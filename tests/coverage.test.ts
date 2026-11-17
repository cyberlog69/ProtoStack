import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import { REFERENCE_ENTRIES } from '../src/data/reference.ts';
import {
  PLANNED_FAMILIES,
  PROTOCOL_COVERAGE,
  TIER_META,
  TIER_ORDER,
  countByTier,
} from '../src/data/coverage.ts';

const slugs = new Set(PROTOCOLS.map((protocol) => protocol.slug));

test('every protocol has coverage metadata and no orphan entries', () => {
  for (const protocol of PROTOCOLS) {
    assert.ok(PROTOCOL_COVERAGE[protocol.slug], `${protocol.slug} has no coverage metadata`);
  }

  for (const slug of Object.keys(PROTOCOL_COVERAGE)) {
    assert.ok(slugs.has(slug), `coverage metadata references unknown protocol: ${slug}`);
  }
});

test('tiers and difficulties are valid', () => {
  const validDifficulties = new Set(['beginner', 'intermediate', 'advanced']);

  for (const [slug, meta] of Object.entries(PROTOCOL_COVERAGE)) {
    assert.ok(TIER_ORDER.includes(meta.tier), `${slug} has an invalid tier: ${meta.tier}`);
    assert.ok(validDifficulties.has(meta.difficulty), `${slug} has an invalid difficulty: ${meta.difficulty}`);
    assert.match(meta.lastReviewed, /^\d{4}-\d{2}-\d{2}$/, `${slug} has an invalid review date`);
  }
});

test('prerequisites exist, never self-reference, and form a DAG', () => {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (slug: string, path: string[]) => {
    if (visited.has(slug)) return;
    assert.ok(!visiting.has(slug), `prerequisite cycle detected: ${[...path, slug].join(' -> ')}`);

    visiting.add(slug);
    for (const prerequisite of PROTOCOL_COVERAGE[slug].prerequisites) {
      assert.notEqual(prerequisite, slug, `${slug} lists itself as a prerequisite`);
      assert.ok(slugs.has(prerequisite), `${slug} lists unknown prerequisite: ${prerequisite}`);
      visit(prerequisite, [...path, slug]);
    }
    visiting.delete(slug);
    visited.add(slug);
  };

  for (const slug of Object.keys(PROTOCOL_COVERAGE)) visit(slug, []);
});

test('core entries form a beginner-friendly on-ramp', () => {
  const core = PROTOCOLS.filter((protocol) => PROTOCOL_COVERAGE[protocol.slug].tier === 'core');
  assert.ok(core.length >= 8, `expected at least 8 core protocols, found ${core.length}`);
  assert.ok(
    core.some((protocol) => PROTOCOL_COVERAGE[protocol.slug].prerequisites.length === 0),
    'the core tier needs at least one entry point with no prerequisites',
  );
  assert.ok(
    core.some((protocol) => PROTOCOL_COVERAGE[protocol.slug].difficulty === 'beginner'),
    'the core tier needs at least one beginner entry',
  );
});

test('tier metadata is coherent and not behind the catalog', () => {
  assert.deepEqual(
    TIER_META.map((tier) => tier.id),
    TIER_ORDER,
    'tier metadata must follow TIER_ORDER',
  );

  for (const tier of TIER_META) {
    assert.ok(tier.target > 0, `${tier.id} needs a positive target`);
    assert.ok(
      tier.target >= countByTier(tier.id),
      `${tier.id} target ${tier.target} is below the current count ${countByTier(tier.id)}`,
    );
  }

  const total = PROTOCOLS.length;
  assert.equal(
    TIER_ORDER.reduce((sum, tier) => sum + countByTier(tier), 0),
    total,
    'every protocol must belong to exactly one tier',
  );

  const referenceTier = TIER_META.find((tier) => tier.id === 'reference');
  assert.ok(referenceTier);
  assert.ok(
    referenceTier.target >= REFERENCE_ENTRIES.length,
    `reference target ${referenceTier.target} is below the published card count ${REFERENCE_ENTRIES.length}`,
  );

  assert.equal(
    TIER_META.reduce((sum, tier) => sum + tier.target, 0),
    PROTOCOLS.length + REFERENCE_ENTRIES.length,
    'tier targets must add up to the published lesson and card count',
  );
});

test('the roadmap lists real, named targets', () => {
  assert.ok(PLANNED_FAMILIES.length >= 8, 'the roadmap should cover the major families');

  const ids = new Set<string>();
  for (const family of PLANNED_FAMILIES) {
    assert.ok(!ids.has(family.id), `duplicate planned family id: ${family.id}`);
    ids.add(family.id);
    assert.ok(family.examples.length >= 3, `${family.id} needs concrete example entries`);
    assert.ok(family.approximateEntries > 0, `${family.id} needs a positive entry estimate`);
  }
});
