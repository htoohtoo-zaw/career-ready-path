/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://mkfbclcdrcakyikoqkvf.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LhhflrZep29pxLRn3MdBPg_AoqjAQAI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'placeholder-anon-key'
  );
}

export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export function toValidUuid(input?: string | null): string {
  if (input && isValidUuid(input)) return input.toLowerCase();

  const seed = (input && input.trim()) || ('user_' + Date.now() + '_' + Math.random());

  // Generate deterministic RFC4122 compliant UUIDv4 from seed
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5b79a781;
  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    hash1 = (hash1 ^ code) * 0x01000193;
    hash2 = (hash2 ^ (code * 31)) * 0x5bd1e995;
  }

  let hex = '';
  for (let i = 0; i < 32; i++) {
    const charCode = seed.charCodeAt(i % seed.length) + (i * 37) + (hash1 & 0xff) + (hash2 & 0xff);
    hex += (((charCode ^ (i * 19)) >>> 0) & 0xf).toString(16);
  }

  const p1 = hex.substring(0, 8);
  const p2 = hex.substring(8, 12);
  const p3 = '4' + hex.substring(13, 16); // UUID Version 4
  const p4 = (['8', '9', 'a', 'b'][Math.abs(hash1) % 4]) + hex.substring(17, 20); // Variant
  const p5 = hex.substring(20, 32);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`.toLowerCase();
}
