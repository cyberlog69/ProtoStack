const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

export function crc32(input: string | Uint8Array): number {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function crc32Hex(input: string | Uint8Array): string {
  return `0x${crc32(input).toString(16).padStart(8, '0')}`;
}

export interface HexDumpLine {
  offset: string;
  hex: string;
  ascii: string;
}

/**
 * Formats bytes as an offset / hex / ASCII dump. The payload marker makes it
 * obvious that the dump was generated from the current step, not hard-coded.
 */
export function hexDump(input: string | Uint8Array, maxBytes = 96): HexDumpLine[] {
  const encoded = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const bytes = encoded.slice(0, maxBytes);
  const lines: HexDumpLine[] = [];

  for (let offset = 0; offset < bytes.length; offset += 16) {
    const slice = bytes.slice(offset, offset + 16);
    const hex = Array.from(slice)
      .map((byte, index) => {
        const value = byte.toString(16).padStart(2, '0');
        return index === 7 ? `${value} ` : value;
      })
      .join(' ');
    const ascii = Array.from(slice)
      .map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'))
      .join('');
    lines.push({
      offset: offset.toString(16).padStart(4, '0'),
      hex,
      ascii,
    });
  }

  return lines;
}

export function toBitString(input: string | Uint8Array, maxBytes = 48): string {
  const encoded = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  return Array.from(encoded.slice(0, maxBytes))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ');
}
