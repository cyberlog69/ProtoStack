import assert from 'node:assert/strict';
import test from 'node:test';
import { PROTOCOLS } from '../src/data/protocols.ts';
import {
  HEADER_LAYERS,
  PROTOCOL_LAYOUTS,
  getProtocolLayout,
} from '../src/data/headerLayouts.ts';

const slugs = new Set(PROTOCOLS.map((protocol) => protocol.slug));

test('fixed header layers add up to their declared byte size', () => {
  for (const [id, layer] of Object.entries(HEADER_LAYERS)) {
    if (layer.bytes === null) continue;

    let total = 0;
    for (const field of layer.fields) {
      assert.notEqual(field.bits, null, `${id}.${field.name} is variable in a fixed layer`);
      total += field.bits ?? 0;
    }

    assert.equal(total, layer.bytes * 8, `${id}: ${total} bits does not match ${layer.bytes} bytes`);
  }
});

test('header layers have unique field names and describe every field', () => {
  for (const [id, layer] of Object.entries(HEADER_LAYERS)) {
    const names = new Set<string>();

    for (const field of layer.fields) {
      assert.ok(!names.has(field.name), `${id} has a duplicate field: ${field.name}`);
      names.add(field.name);
      assert.ok(field.description.length >= 10, `${id}.${field.name} needs a real description`);
      assert.ok(layer.name.length > 0, `${id} needs a display name`);
    }
  }
});

test('protocol layouts reference real protocols and real layers', () => {
  for (const [slug, layout] of Object.entries(PROTOCOL_LAYOUTS)) {
    assert.ok(slugs.has(slug), `layout references unknown protocol: ${slug}`);
    assert.ok(layout.layers.length > 0, `${slug} has an empty layer stack`);

    for (const layerId of layout.layers) {
      assert.ok(HEADER_LAYERS[layerId], `${slug} references unknown layer: ${layerId}`);
    }
  }
});

test('layouts cover most of the catalog', () => {
  const covered = PROTOCOLS.filter((protocol) => getProtocolLayout(protocol.slug)).length;
  assert.ok(
    covered >= 60,
    `expected at least 60 protocols with a header layout, found ${covered}`,
  );
});

test('layout stacks do not repeat a layer', () => {
  for (const [slug, layout] of Object.entries(PROTOCOL_LAYOUTS)) {
    const ids = layout.layers;
    assert.equal(new Set(ids).size, ids.length, `${slug} repeats a layer in its stack`);
  }
});
