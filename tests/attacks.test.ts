import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import { ATTACKS, getAttacks, getDefenceDistractors } from '../src/data/attacks.ts';
import { ATTACK_CATEGORIES } from '../src/data/attackCategories.ts';
import { ATTACK_PHASES } from '../src/data/attackPhases.ts';
import { MITRE_BY_ATTACK, MITRE_TECHNIQUES } from '../src/data/mitre.ts';

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

test('every scenario has a meaningful difficulty and a three-phase sequence', () => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const phases = ATTACK_PHASES.map((phase) => phase.id);

  for (const attack of ATTACKS) {
    assert.ok([1, 2, 3].includes(attack.difficulty), `${attack.id} has an invalid difficulty`);
    distribution[attack.difficulty] += 1;

    assert.equal(attack.steps.length, 3, `${attack.id} should have exactly three phases`);
    assert.deepEqual(
      attack.steps.map((step) => step.phase),
      phases,
      `${attack.id} must progress precondition → action → impact`,
    );

    for (const step of attack.steps) {
      assert.equal(step.trafficDirection, 'attacker-to-target', `${attack.id} has an invalid direction`);
    }
  }

  assert.ok(distribution[1] >= 10, `expected at least 10 beginner scenarios, found ${distribution[1]}`);
  assert.ok(distribution[2] >= 10, `expected at least 10 intermediate scenarios, found ${distribution[2]}`);
  assert.ok(distribution[3] >= 10, `expected at least 10 advanced scenarios, found ${distribution[3]}`);
});

test('MITRE mappings only use reviewed techniques', () => {
  const mapped = new Set(Object.keys(MITRE_BY_ATTACK));
  const attackIds = new Set(ATTACKS.map((attack) => attack.id));

  for (const id of mapped) {
    assert.ok(attackIds.has(id), `MITRE mapping references unknown attack: ${id}`);
  }

  for (const attack of ATTACKS) {
    const expected = MITRE_BY_ATTACK[attack.id] ?? [];
    assert.deepEqual(attack.mitreIds, expected, `${attack.id} MITRE IDs do not match the reviewed map`);

    for (const technique of attack.mitreIds) {
      assert.ok(MITRE_TECHNIQUES[technique], `${attack.id} uses an unreviewed technique: ${technique}`);
    }
  }
});

test('defence distractors are real, distinct controls', () => {
  for (const attack of ATTACKS.slice(0, 25)) {
    const distractors = getDefenceDistractors(attack.id, 2);
    assert.equal(distractors.length, 2, `${attack.id} needs two distractors`);
    assert.equal(new Set(distractors).size, distractors.length, `${attack.id} repeats a distractor`);
    assert.ok(
      distractors.every((control) => control !== attack.mitigations[0]),
      `${attack.id} uses the correct control as a distractor`,
    );
  }
});
