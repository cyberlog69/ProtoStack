import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS, CATEGORIES_META } from '../src/data/protocols.ts';

const VALID_CATEGORIES = new Set([
  'network',
  'transport',
  'application',
  'iot',
  'security',
  'wireless',
  'cloud',
]);

const VALID_LAYERS = new Set([
  'Physical',
  'Data Link',
  'Network',
  'Transport',
  'Session',
  'Presentation',
  'Application',
]);

test('protocol catalog is non-empty and searchable', () => {
  assert.ok(PROTOCOLS.length >= 50, `expected at least 50 protocols, found ${PROTOCOLS.length}`);
});

test('protocol ids and slugs are unique', () => {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const protocol of PROTOCOLS) {
    assert.ok(protocol.id.length > 0, 'protocol id must not be empty');
    assert.ok(!ids.has(protocol.id), `duplicate protocol id: ${protocol.id}`);
    ids.add(protocol.id);

    assert.match(protocol.slug, /^[a-z0-9-]+$/, `slug must be url-safe: ${protocol.slug}`);
    assert.ok(!slugs.has(protocol.slug), `duplicate protocol slug: ${protocol.slug}`);
    slugs.add(protocol.slug);
  }
});

test('every protocol has a valid category and OSI layer', () => {
  for (const protocol of PROTOCOLS) {
    assert.ok(
      VALID_CATEGORIES.has(protocol.category),
      `${protocol.slug} has invalid category: ${protocol.category}`,
    );
    assert.ok(
      VALID_LAYERS.has(protocol.osiLayer),
      `${protocol.slug} has invalid OSI layer: ${protocol.osiLayer}`,
    );
  }
});

test('category metadata counts match the catalog', () => {
  assert.equal(CATEGORIES_META[0].id, 'all');
  assert.equal(CATEGORIES_META[0].count, PROTOCOLS.length);

  for (const category of CATEGORIES_META.slice(1)) {
    const actual = PROTOCOLS.filter((protocol) => protocol.category === category.id).length;
    assert.equal(
      category.count,
      actual,
      `${category.label} count is stale: metadata says ${category.count}, catalog has ${actual}`,
    );
  }
});

test('transport-layer protocols use the transport category', () => {
  for (const slug of ['tcp', 'udp', 'quic', 'sctp']) {
    const protocol = PROTOCOLS.find((entry) => entry.slug === slug);
    assert.ok(protocol, `${slug} is missing`);
    assert.equal(protocol.category, 'transport', `${slug} should be in the transport category`);
    assert.equal(protocol.osiLayer, 'Transport', `${slug} should declare the Transport OSI layer`);
  }
});

test('every protocol has at least three interactive steps and two quiz questions', () => {
  for (const protocol of PROTOCOLS) {
    assert.ok(
      protocol.interactiveSteps.length >= 3,
      `${protocol.slug} needs at least three interactive steps`,
    );

    const stepNumbers = protocol.interactiveSteps.map((step) => step.step);
    assert.deepEqual(
      stepNumbers,
      stepNumbers.map((_, index) => index + 1),
      `${protocol.slug} step numbers must be sequential starting at 1`,
    );

    const packetIds = protocol.interactiveSteps
      .map((step) => step.packetInfo?.id)
      .filter((id): id is string => Boolean(id));
    assert.equal(
      packetIds.length,
      new Set(packetIds).size,
      `${protocol.slug} has duplicate packet ids`,
    );

    for (const step of protocol.interactiveSteps) {
      assert.ok(step.title.length > 0, `${protocol.slug} has a step without a title`);
      assert.ok(step.description.length > 0, `${protocol.slug} has a step without a description`);
      assert.ok(
        protocol.actors.some((actor) => actor.id === step.actorSource),
        `${protocol.slug} step ${step.step} references unknown source actor ${step.actorSource}`,
      );
      assert.ok(
        protocol.actors.some((actor) => actor.id === step.actorTarget),
        `${protocol.slug} step ${step.step} references unknown target actor ${step.actorTarget}`,
      );
    }

    assert.ok(protocol.quiz.length >= 2, `${protocol.slug} needs at least two quiz questions`);

    const quizIds = protocol.quiz.map((question) => question.id);
    assert.equal(quizIds.length, new Set(quizIds).size, `${protocol.slug} has duplicate quiz ids`);

    for (const question of protocol.quiz) {
      assert.ok(question.options.length >= 2, `${question.id} needs at least two options`);
      assert.equal(
        new Set(question.options).size,
        question.options.length,
        `${question.id} has duplicate options`,
      );
      assert.ok(
        Number.isInteger(question.correctAnswer) &&
          question.correctAnswer >= 0 &&
          question.correctAnswer < question.options.length,
        `${question.id} has an out-of-range correct answer`,
      );
      assert.ok(question.explanation.length > 0, `${question.id} needs an explanation`);
    }
  }
});

test('protocol content avoids known placeholder values', () => {
  for (const protocol of PROTOCOLS) {
    assert.notEqual(protocol.rfc, 'RFC 913', `${protocol.slug} still uses the incorrect RFC 913 value`);
    assert.ok(!protocol.shortSummary.includes('TBD'), `${protocol.slug} contains TBD placeholder copy`);
    assert.ok(protocol.description.length >= 40, `${protocol.slug} description is too short`);
    assert.ok(protocol.keyFeatures.length > 0, `${protocol.slug} has no key features`);
    assert.ok(protocol.useCases.length > 0, `${protocol.slug} has no use cases`);
    assert.ok(protocol.pros.length > 0, `${protocol.slug} has no pros`);
    assert.ok(protocol.cons.length > 0, `${protocol.slug} has no cons`);
  }
});

test('numeric ports are within the valid TCP/UDP range', () => {
  for (const protocol of PROTOCOLS) {
    if (typeof protocol.port === 'number') {
      assert.ok(
        Number.isInteger(protocol.port) && protocol.port >= 0 && protocol.port <= 65535,
        `${protocol.slug} has an invalid port: ${protocol.port}`,
      );
    }
  }
});
