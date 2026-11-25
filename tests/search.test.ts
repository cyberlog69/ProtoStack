import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import { REFERENCE_ENTRIES } from '../src/data/reference.ts';
import { GLOSSARY } from '../src/data/glossary.ts';
import { ATTACKS } from '../src/data/attacks.ts';
import {
  FEATURED_SEARCH_ENTRIES,
  SEARCH_ENTRIES,
  SEARCH_KIND_META,
  searchContent,
} from '../src/lib/search.ts';

test('the search index covers every content type', () => {
  assert.equal(SEARCH_ENTRIES.filter((entry) => entry.kind === 'lesson').length, PROTOCOLS.length);
  assert.equal(SEARCH_ENTRIES.filter((entry) => entry.kind === 'reference').length, REFERENCE_ENTRIES.length);
  assert.equal(SEARCH_ENTRIES.filter((entry) => entry.kind === 'glossary').length, GLOSSARY.length);
  assert.equal(SEARCH_ENTRIES.filter((entry) => entry.kind === 'attack').length, ATTACKS.length);
  assert.ok(SEARCH_ENTRIES.some((entry) => entry.kind === 'page'));
});

test('search entries have unique ids, known kinds and internal links', () => {
  const ids = new Set<string>();
  for (const entry of SEARCH_ENTRIES) {
    assert.ok(!ids.has(entry.id), `duplicate search id: ${entry.id}`);
    ids.add(entry.id);
    assert.ok(SEARCH_KIND_META[entry.kind]);
    assert.ok(entry.href.startsWith('/'), `external href in search index: ${entry.href}`);
    assert.ok(!entry.href.startsWith('//'), `protocol-relative href: ${entry.href}`);
    assert.ok(entry.title.trim().length > 0);
    assert.ok(entry.searchText.length > 0);
  }
});

test('search finds lessons, references, glossary terms and attacks', () => {
  assert.ok(searchContent('dns').some((entry) => entry.id === 'lesson:dns'));
  assert.ok(searchContent('eigrp').some((entry) => entry.id === 'reference:eigrp'));
  assert.ok(searchContent('anycast').some((entry) => entry.id === 'glossary:Anycast'));
  assert.ok(searchContent('mac flooding').some((entry) => entry.id.startsWith('attack:')));
  assert.ok(searchContent('rfc 7868').some((entry) => entry.id === 'reference:eigrp'));
});

test('exact title matches rank first and search is case-insensitive', () => {
  const lower = searchContent('tcp');
  const upper = searchContent('TCP');
  assert.ok(lower.length > 0);
  assert.equal(lower[0]?.id, upper[0]?.id);
  assert.equal(lower[0]?.id, 'lesson:tcp');
  assert.equal(searchContent('tcp.')[0]?.id, 'lesson:tcp');
});

test('empty queries return curated quick links', () => {
  const results = searchContent('   ');
  assert.deepEqual(
    results.map((entry) => entry.id),
    FEATURED_SEARCH_ENTRIES.map((entry) => entry.id),
  );
  assert.ok(results.some((entry) => entry.href === '/start'));
  assert.ok(results.some((entry) => entry.href === '/record'));
});

test('nonsense queries return no results', () => {
  assert.deepEqual(searchContent('zzzz-not-a-real-topic-9999'), []);
});

test('the result limit is respected', () => {
  const results = searchContent('protocol', 3);
  assert.ok(results.length <= 3);
});
