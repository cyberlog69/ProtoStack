'use client';

import React, { useState } from 'react';

interface StepHexViewerProps {
  hexString: string;
  label?: string;
}

function parseHex(hex: string): number[] {
  return hex
    .trim()
    .split(/\s+/)
    .map((b) => parseInt(b, 16))
    .filter((n) => !Number.isNaN(n));
}

function toAscii(byte: number): string {
  return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
}

export default function StepHexViewer({ hexString, label = 'Simulated frame / packet bytes' }: StepHexViewerProps) {
  const [showAscii, setShowAscii] = useState(false);
  const bytes = parseHex(hexString);
  if (bytes.length === 0) return null;

  const rows: number[][] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    rows.push(bytes.slice(i, i + 16));
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-850 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
          <span className="text-[9px] font-mono text-slate-500">({bytes.length} bytes)</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAscii((prev) => !prev)}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 transition-colors"
        >
          {showAscii ? 'Switch to Hex' : 'Switch to ASCII'}
        </button>
      </div>

      <div className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-900/40">
                <td className="text-slate-600 pr-4 select-none w-12">
                  {(rowIndex * 16).toString(16).padStart(4, '0')}
                </td>
                <td className="py-0.5">
                  <div className="flex flex-wrap gap-x-2">
                    {row.map((byte, byteIndex) => (
                      <span
                        key={byteIndex}
                        className={
                          showAscii
                            ? 'text-emerald-300 w-3 text-center'
                            : 'text-cyan-300 w-5 text-center'
                        }
                      >
                        {showAscii ? toAscii(byte) : byte.toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
