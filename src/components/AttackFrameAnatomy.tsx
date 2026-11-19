'use client';

import React from 'react';
import { getHeaderLayer, getProtocolLayout } from '@/data/headerLayouts';
import { Network } from 'lucide-react';

interface AttackFrameAnatomyProps {
  protocolSlug: string;
  protocolName: string;
}

/**
 * Shows the protocol's real frame layout (field widths and offsets) so learners
 * can connect the attack to the bytes on the wire. Attack packets themselves
 * are deliberately not reproduced: usable payloads would cross the line from
 * defence education into an exploit kit.
 */
export default function AttackFrameAnatomy({ protocolSlug, protocolName }: AttackFrameAnatomyProps) {
  const layout = getProtocolLayout(protocolSlug);
  const layers = (layout?.layers ?? [])
    .map((id) => getHeaderLayer(id))
    .filter((layer): layer is NonNullable<ReturnType<typeof getHeaderLayer>> => Boolean(layer));

  if (layers.length === 0) return null;

  const rows: { layer: (typeof layers)[number]; start: number | null }[] = [];
  let offset = 0;
  for (const layer of layers) {
    rows.push({ layer, start: layer.bytes === null ? null : offset });
    if (layer.bytes !== null) offset += layer.bytes;
  }

  return (
    <details className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
      <summary className="px-3.5 py-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 cursor-pointer hover:text-white transition-colors select-none flex items-center gap-2">
        <Network className="w-3 h-3 text-cyan-400" aria-hidden="true" />
        Frame anatomy — {protocolName}
      </summary>
      <div className="border-t border-slate-800 p-3 space-y-3">
        <p className="text-[10px] text-slate-500">
          The protocol&apos;s real header layout. Attack packets are not reproduced; this shows where the fields the
          attack abuses actually live.
        </p>

        {rows.map(({ layer, start }, index) => {
          let bits = 0;
          return (
            <div key={`${layer.id}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono bg-slate-900">
                <span className="text-slate-200 font-bold">{layer.name}</span>
                <span className="text-slate-500">
                  {start === null ? 'variable offset' : `offset ${start} B`} ·{' '}
                  {layer.bytes === null ? 'variable length' : `${layer.bytes} bytes`}
                </span>
              </div>
              <table className="w-full text-left">
                <caption className="sr-only">{layer.name} fields</caption>
                <thead className="text-slate-500 text-[9px] uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-1 font-semibold">Field</th>
                    <th scope="col" className="px-3 py-1 font-semibold">Bits</th>
                    <th scope="col" className="px-3 py-1 font-semibold hidden sm:table-cell">Offset</th>
                    <th scope="col" className="px-3 py-1 font-semibold hidden md:table-cell">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {layer.fields.map((field) => {
                    const bitStart = bits;
                    if (field.bits !== null) bits += field.bits;
                    const byteStart = start === null ? null : start + Math.floor(bitStart / 8);
                    return (
                      <tr key={field.name}>
                        <th scope="row" className="px-3 py-1 font-normal text-slate-300 whitespace-nowrap">{field.name}</th>
                        <td className="px-3 py-1 text-slate-500">{field.bits ?? 'var'}</td>
                        <td className="px-3 py-1 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                          {byteStart === null ? '—' : `${byteStart} B`}
                        </td>
                        <td className="px-3 py-1 text-slate-500 hidden md:table-cell">{field.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </details>
  );
}
