import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Contact form features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  case_details: string;
  urgency_level: 'emergency' | 'urgent' | 'normal';
  created_at: string;
}
