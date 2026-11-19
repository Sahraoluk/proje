import defaultFeedbackRaw from '../data/defaultFeedback.json';
import { FeedbackItem } from '../types';

export const FEEDBACK_STORAGE_KEY = 'ankara_atlas_feedback_v1';
export const FEEDBACK_UPDATED_EVENT = 'ankara-atlas-feedback-updated';

function normalizeFeedbackItem(raw: unknown): FeedbackItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const neighborhoodId =
    typeof item.neighborhoodId === 'string' ? item.neighborhoodId.trim() : '';
  const comment = typeof item.comment === 'string' ? item.comment.trim() : '';
  if (!neighborhoodId || !comment) return null;

  const clampScore = (val: unknown, fallback = 75) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.max(0, Math.min(100, Math.round(num)));
  };

  return {
    id:
      typeof item.id === 'string' && item.id.trim()
        ? item.id
        : `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    neighborhoodId,
    name:
      typeof item.name === 'string' && item.name.trim()
        ? item.name.trim().slice(0, 60)
        : 'Anonim Ankara Sakini',
    comment: comment.slice(0, 800),
    safety: clampScore(item.safety),
    transport: clampScore(item.transport),
    livability: clampScore(item.livability),
    createdAt:
      typeof item.createdAt === 'string' && item.createdAt.trim()
        ? item.createdAt
        : new Date().toISOString(),
  };
}

function getDefaultFeedback(): FeedbackItem[] {
  if (!Array.isArray(defaultFeedbackRaw)) return [];
  return defaultFeedbackRaw
    .map(normalizeFeedbackItem)
    .filter((item): item is FeedbackItem => item !== null);
}

function readStoredFeedback(): FeedbackItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeFeedbackItem)
      .filter((item): item is FeedbackItem => item !== null);
  } catch {
    return [];
  }
}

export function loadAllFeedback(neighborhoodId?: string): FeedbackItem[] {
  const stored = readStoredFeedback();
  const defaults = getDefaultFeedback();

  const byId = new Map<string, FeedbackItem>();
  for (const item of stored) {
    byId.set(item.id, item);
  }
  for (const item of defaults) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (neighborhoodId) {
    return merged.filter((item) => item.neighborhoodId === neighborhoodId);
  }
  return merged;
}

export function saveFeedbackItem(input: {
  neighborhoodId: string;
  name?: string;
  comment: string;
  safety: number;
  transport: number;
  livability: number;
}): FeedbackItem {
  const clampScore = (val: number) =>
    Math.max(0, Math.min(100, Number.isFinite(val) ? Math.round(val) : 75));

  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    neighborhoodId: input.neighborhoodId.trim(),
    name: input.name?.trim().slice(0, 60) || 'Anonim Ankara Sakini',
    comment: input.comment.trim().slice(0, 800),
    safety: clampScore(input.safety),
    transport: clampScore(input.transport),
    livability: clampScore(input.livability),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = readStoredFeedback();
      const updated = [newItem, ...existing];
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(FEEDBACK_UPDATED_EVENT));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }

  return newItem;
}
