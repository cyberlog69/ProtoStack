import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createProgressSnapshot,
  parseProgressSnapshot,
  parseScoreMap,
  serializeProgressSnapshot,
} from '../src/lib/progress-transfer.ts';

const score = (value: number, total: number) => ({
  score: value,
  total,
  updatedAt: '2026-01-02T03:04:05.000Z',
});

test('a progress snapshot round-trips through JSON', () => {
  const snapshot = createProgressSnapshot({
    learnedProtocols: ['tcp', 'dns'],
    bookmarkedProtocols: ['tls'],
    quizScores: { tcp: score(2, 2) },
    attackScores: { 'dns-cache-poisoning': score(2, 2) },
    exportedAt: '2026-05-06T07:08:09.000Z',
  });

  const parsed = parseProgressSnapshot(serializeProgressSnapshot(snapshot));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  assert.deepEqual(parsed.snapshot, snapshot);
});

test('minimal snapshots are accepted and missing collections default to empty', () => {
  const parsed = parseProgressSnapshot('{"learnedProtocols":["tcp"]}');
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  assert.deepEqual(parsed.snapshot.learnedProtocols, ['tcp']);
  assert.deepEqual(parsed.snapshot.bookmarkedProtocols, []);
  assert.deepEqual(parsed.snapshot.quizScores, {});
  assert.deepEqual(parsed.snapshot.attackScores, {});
});

test('invalid JSON, files from other apps and empty records are rejected', () => {
  assert.equal(parseProgressSnapshot('not json').ok, false);
  assert.equal(parseProgressSnapshot('[]').ok, false);
  assert.equal(parseProgressSnapshot('{"app":"other","learnedProtocols":["tcp"]}').ok, false);
  assert.equal(parseProgressSnapshot('{}').ok, false);
  assert.equal(parseProgressSnapshot('{"learnedProtocols":"tcp"}').ok, false);
  assert.equal(parseProgressSnapshot('{"quizScores":[]}').ok, false);
});

test('oversized imports are rejected before parsing', () => {
  const huge = `{"learnedProtocols":["${'a'.repeat(1_000_001)}"]}`;
  const result = parseProgressSnapshot(huge);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /1 MB/);
});

test('duplicate and non-string ids are ignored', () => {
  const result = parseProgressSnapshot(
    '{"learnedProtocols":["tcp","tcp",5,null,"dns",""],"bookmarkedProtocols":["tls"]}',
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.snapshot.learnedProtocols, ['tcp', 'dns']);
  assert.deepEqual(result.snapshot.bookmarkedProtocols, ['tls']);
});

test('score maps clamp values and skip malformed rows', () => {
  const scores = parseScoreMap({
    good: { score: 2, total: 2, updatedAt: '2026-01-01T00:00:00.000Z' },
    tooHigh: { score: 99, total: 2, updatedAt: '2026-01-01T00:00:00.000Z' },
    negative: { score: -3, total: 4, updatedAt: '2026-01-01T00:00:00.000Z' },
    zeroTotal: { score: 0, total: 0 },
    notANumber: { score: '2', total: 2 },
    notAnObject: 42,
  });

  assert.equal(scores.good?.score, 2);
  assert.equal(scores.tooHigh?.score, 2);
  assert.equal(scores.negative?.score, 0);
  assert.equal(scores.zeroTotal, undefined);
  assert.equal(scores.notANumber, undefined);
  assert.equal(scores.notAnObject, undefined);
});

test('invalid timestamps fall back to a valid ISO date', () => {
  const result = parseProgressSnapshot(
    '{"quizScores":{"tcp":{"score":1,"total":2,"updatedAt":"not-a-date"}}}',
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const updatedAt = result.snapshot.quizScores.tcp?.updatedAt ?? '';
  assert.ok(!Number.isNaN(Date.parse(updatedAt)));
});
