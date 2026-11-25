export interface StoredScore {
  score: number;
  total: number;
  updatedAt: string;
}

export interface ProgressSnapshot {
  app: 'protostack';
  version: 1;
  exportedAt: string;
  learnedProtocols: string[];
  bookmarkedProtocols: string[];
  quizScores: Record<string, StoredScore>;
  attackScores: Record<string, StoredScore>;
}

export interface ProgressSnapshotInput {
  learnedProtocols: string[];
  bookmarkedProtocols: string[];
  quizScores: Record<string, StoredScore>;
  attackScores: Record<string, StoredScore>;
  exportedAt?: string;
}

export type ParseResult =
  | { ok: true; snapshot: ProgressSnapshot }
  | { ok: false; error: string };

const MAX_IMPORT_BYTES = 1_000_000;
const MAX_LIST_ITEMS = 500;
const MAX_SCORE_KEYS = 500;
const MAX_ID_LENGTH = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isoOrNow(value: unknown): string {
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) return new Date(timestamp).toISOString();
  }
  return new Date().toISOString();
}

function parseIdList(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > MAX_ID_LENGTH) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    list.push(trimmed);
    if (list.length >= MAX_LIST_ITEMS) break;
  }
  return list;
}

function normaliseScore(value: unknown): StoredScore | null {
  if (!isRecord(value)) return null;

  const rawScore = value.score;
  const rawTotal = value.total;
  if (
    typeof rawScore !== 'number' ||
    !Number.isFinite(rawScore) ||
    typeof rawTotal !== 'number' ||
    !Number.isFinite(rawTotal) ||
    rawTotal <= 0
  ) {
    return null;
  }

  const total = Math.round(rawTotal);
  if (total <= 0) return null;
  const score = Math.max(0, Math.min(Math.round(rawScore), total));

  return { score, total, updatedAt: isoOrNow(value.updatedAt) };
}

export function parseScoreMap(value: unknown): Record<string, StoredScore> {
  if (!isRecord(value)) return {};

  const scores: Record<string, StoredScore> = {};
  let added = 0;

  for (const [key, candidate] of Object.entries(value)) {
    if (!key || key.length > MAX_ID_LENGTH) continue;
    const normalised = normaliseScore(candidate);
    if (!normalised) continue;
    scores[key] = normalised;
    added += 1;
    if (added >= MAX_SCORE_KEYS) break;
  }

  return scores;
}

export function createProgressSnapshot(input: ProgressSnapshotInput): ProgressSnapshot {
  return {
    app: 'protostack',
    version: 1,
    exportedAt: isoOrNow(input.exportedAt),
    learnedProtocols: [...input.learnedProtocols],
    bookmarkedProtocols: [...input.bookmarkedProtocols],
    quizScores: { ...input.quizScores },
    attackScores: { ...input.attackScores },
  };
}

export function serializeProgressSnapshot(snapshot: ProgressSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

/**
 * Strict but forgiving importer for a user-supplied backup. Shape errors stop
 * the import; individual malformed score entries are skipped so one bad row
 * does not throw away an otherwise usable record.
 */
export function parseProgressSnapshot(raw: string): ParseResult {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { ok: false, error: 'The file is empty.' };
  }
  if (raw.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'The file is larger than the 1 MB import limit.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: 'The backup must be a JSON object.' };
  }
  if (parsed.app !== undefined && parsed.app !== 'protostack') {
    return { ok: false, error: 'This file was not created by ProtoStack.' };
  }
  if (parsed.version !== undefined && parsed.version !== 1) {
    return { ok: false, error: 'This backup version is not supported.' };
  }

  const learned = parseIdList(parsed.learnedProtocols);
  const bookmarks = parseIdList(parsed.bookmarkedProtocols);
  if (learned === null) return { ok: false, error: 'learnedProtocols must be an array of strings.' };
  if (bookmarks === null) return { ok: false, error: 'bookmarkedProtocols must be an array of strings.' };

  if (parsed.quizScores !== undefined && !isRecord(parsed.quizScores)) {
    return { ok: false, error: 'quizScores must be an object.' };
  }
  if (parsed.attackScores !== undefined && !isRecord(parsed.attackScores)) {
    return { ok: false, error: 'attackScores must be an object.' };
  }

  const quizScores = parseScoreMap(parsed.quizScores);
  const attackScores = parseScoreMap(parsed.attackScores);

  const hasProgress =
    learned.length > 0 ||
    bookmarks.length > 0 ||
    Object.keys(quizScores).length > 0 ||
    Object.keys(attackScores).length > 0;

  if (!hasProgress) {
    return { ok: false, error: 'This file does not contain any saved ProtoStack progress.' };
  }

  return {
    ok: true,
    snapshot: {
      app: 'protostack',
      version: 1,
      exportedAt: isoOrNow(parsed.exportedAt),
      learnedProtocols: learned,
      bookmarkedProtocols: bookmarks,
      quizScores,
      attackScores,
    },
  };
}
