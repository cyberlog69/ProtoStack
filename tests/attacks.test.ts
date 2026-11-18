import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import { ATTACKS, getAttacks } from '../src/data/attacks.ts';
import { ATTACK_CATEGORIES } from '../src/data/attackCategories.ts';

const slugs = new Set(PROTOCOLS.map((protocol) => protocol.slug));
const categories = new Set(ATTACK_CATEGORIES.map((category) => category.id));

test('every protocol has at least one attack scenario', () => {
  for (const protocol of PROTOCOLS) {
    assert.ok(
      getAttacks(protocol.slug).length >= 1,
      `${protocol.slug} has no attack scenario`,
    );
  }
});

test('attack scenarios are unique and reference real protocols', () => {
  const ids = new Set<string>();

  for (const attack of ATTACKS) {
    assert.ok(!ids.has(attack.id), `duplicate attack id: ${attack.id}`);
    ids.add(attack.id);
    assert.ok(slugs.has(attack.protocolSlug), `${attack.id} references unknown protocol`);
    assert.ok(categories.has(attack.category), `${attack.id} has an invalid category`);
    assert.ok(attack.name.length > 0, `${attack.id} needs a name`);
    assert.ok(attack.summary.length >= 40, `${attack.id} summary is too short`);
    assert.ok(attack.impact.length >= 20, `${attack.id} needs an impact statement`);
  }
});

test('every scenario has a usable step sequence and defences', () => {
  for (const attack of ATTACKS) {
    assert.ok(attack.steps.length >= 3, `${attack.id} needs at least three steps`);

    for (const step of attack.steps) {
      assert.ok(step.title.length > 0, `${attack.id} has a step without a title`);
      assert.ok(step.description.length >= 40, `${attack.id} has a short step description`);
      assert.ok(step.detection.length >= 20, `${attack.id} has a step without detection guidance`);
    }

    assert.ok(attack.mitigations.length >= 2, `${attack.id} needs at least two mitigations`);

    for (const mitigation of attack.mitigations) {
      assert.ok(mitigation.length >= 8, `${attack.id} has a vague mitigation: ${mitigation}`);
    }
  }
});

test('attack names are unique within a protocol', () => {
  for (const protocol of PROTOCOLS) {
    const names = getAttacks(protocol.slug).map((attack) => attack.name);
    assert.equal(new Set(names).size, names.length, `${protocol.slug} repeats an attack name`);
  }
});

test('the library covers every attack category', () => {
  const used = new Set(ATTACKS.map((attack) => attack.category));
  for (const category of ATTACK_CATEGORIES) {
    assert.ok(used.has(category.id), `category ${category.id} has no scenarios`);
  }
});
