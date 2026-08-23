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
