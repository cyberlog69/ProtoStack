import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import { START_HERE_PATH, curriculumSlugs } from '../src/data/curriculum.ts';
import { PROTOCOL_COVERAGE } from '../src/data/coverage.ts';
import { GLOSSARY } from '../src/data/glossary.ts';
import {
  REFERENCE_ENTRIES,
  REFERENCE_FAMILIES,
  REFERENCE_STATUS_META,
} from '../src/data/reference.ts';

const slugs = new Set(PROTOCOLS.map((protocol) => protocol.slug));
const VALID_LAYERS = new Set([
  'Physical',
  'Data Link',
  'Network',
  'Transport',
  'Session',
  'Presentation',
  'Application',
]);
const VALID_CATEGORIES = new Set([
  'network',
  'transport',
  'application',
  'iot',
  'security',
  'wireless',
  'cloud',
]);

test('curriculum lessons are real protocols, listed once each', () => {
  const seen = new Set<string>();

  for (const curriculumModule of START_HERE_PATH) {
    assert.ok(curriculumModule.id.length > 0, 'module id must not be empty');
    assert.ok(curriculumModule.title.length > 0, `${curriculumModule.id} needs a title`);
    assert.ok(curriculumModule.lessons.length > 0, `${curriculumModule.id} has no lessons`);

    for (const lesson of curriculumModule.lessons) {
      assert.ok(slugs.has(lesson.slug), `${curriculumModule.id} references unknown protocol: ${lesson.slug}`);
      assert.ok(!seen.has(lesson.slug), `${lesson.slug} appears more than once in the path`);
      assert.ok(lesson.why.length >= 20, `${lesson.slug} needs a real reason for its position`);
      seen.add(lesson.slug);
    }
  }

  assert.ok(seen.size >= 12, `the path should cover at least 12 lessons, found ${seen.size}`);
});

test('curriculum respects the prerequisite graph', () => {
  const order = curriculumSlugs();

  for (const slug of order) {
    const protocol = PROTOCOLS.find((entry) => entry.slug === slug);
    assert.ok(protocol, `${slug} is missing`);
  }

  for (let index = 0; index < order.length; index += 1) {
    const slug = order[index];
    for (const prerequisite of PROTOCOL_COVERAGE[slug].prerequisites) {
      const prerequisiteIndex = order.indexOf(prerequisite);
      if (prerequisiteIndex === -1) continue;
      assert.ok(
        prerequisiteIndex < index,
        `${slug} is taught before its prerequisite ${prerequisite}`,
      );
    }
  }
});

test('glossary terms are unique and well formed', () => {
  const terms = new Set<string>();

  for (const entry of GLOSSARY) {
    const key = entry.term.toLowerCase();
    assert.ok(!terms.has(key), `duplicate glossary term: ${entry.term}`);
    terms.add(key);
    assert.ok(entry.term.length > 0, 'glossary term must not be empty');
    assert.ok(entry.definition.length >= 20, `${entry.term} needs a real definition`);
    if (entry.see) {
      assert.ok(entry.see.href.startsWith('/'), `${entry.term} links outside the site: ${entry.see.href}`);
      assert.ok(entry.see.label.length > 0, `${entry.term} needs a link label`);
    }
  }

  assert.ok(GLOSSARY.length >= 80, `expected at least 80 terms, found ${GLOSSARY.length}`);
});

test('reference entries are unique and structurally valid', () => {
  const ids = new Set<string>();
  const families = new Set(REFERENCE_FAMILIES.map((family) => family.id));
  const allowedSpecHosts = [
    'rfc-editor.org',
    'w3.org',
    'jsonrpc.org',
    'spec.graphql.org',
    'openid.net',
    'rsync.samba.org',
  ];

  for (const entry of REFERENCE_ENTRIES) {
    assert.ok(!ids.has(entry.id), `duplicate reference id: ${entry.id}`);
    ids.add(entry.id);

    assert.ok(!slugs.has(entry.id), `reference id collides with a lesson slug: ${entry.id}`);
    assert.ok(entry.name.length > 0, `${entry.id} needs a name`);
    assert.ok(entry.fullName.length > 0, `${entry.id} needs a full name`);
    assert.ok(families.has(entry.family), `${entry.id} has an unknown family: ${entry.family}`);
    assert.ok(VALID_LAYERS.has(entry.osiLayer), `${entry.id} has an invalid layer`);
    assert.ok(VALID_CATEGORIES.has(entry.category), `${entry.id} has an invalid category`);
    assert.ok(entry.status in REFERENCE_STATUS_META, `${entry.id} has an invalid status`);
    assert.ok(entry.standard.length > 0, `${entry.id} needs a standard`);
    assert.ok(entry.summary.length >= 40, `${entry.id} summary is too short to be useful`);

    if (entry.specUrl) {
      const url = new URL(entry.specUrl);
      assert.equal(url.protocol, 'https:', `${entry.id} spec link must use HTTPS`);
      assert.ok(
        allowedSpecHosts.some(
          (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
        ),
        `${entry.id} links to an unexpected host: ${url.hostname}`,
      );
    }
  }

  assert.ok(REFERENCE_ENTRIES.length >= 60, `expected at least 60 reference entries, found ${REFERENCE_ENTRIES.length}`);
});

test('health endpoint reports ok without leaking host details', async () => {
  const { GET } = await import('../src/app/api/health/route.ts');
  const response = await GET();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');

  const body = (await response.json()) as Record<string, unknown>;
  assert.equal(body.status, 'ok');
  assert.equal(typeof body.uptimeSeconds, 'number');
  assert.equal(typeof body.timestamp, 'string');
  assert.deepEqual(Object.keys(body).sort(), ['status', 'timestamp', 'uptimeSeconds']);
});

test('every reference family has at least one entry', () => {
  for (const family of REFERENCE_FAMILIES) {
    const count = REFERENCE_ENTRIES.filter((entry) => entry.family === family.id).length;
    assert.ok(count > 0, `family ${family.id} has no entries`);
  }
});
