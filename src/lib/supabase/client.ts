import { createClient } from '@supabase/supabase-js';

// Dormant: no feature queries Supabase today (feedback board is localStorage-only).
// Kept out of src/lib/supabase/index.ts on purpose so the client, project URL and anon
// key never ship in the browser bundle. Import from './client' directly when a backend
// feature goes live, and add the Supabase host to connect-src in next.config.ts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
