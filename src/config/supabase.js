import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://gyucxqpvrczuqqqhtrkm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oj-CdLV4DVpn2ZMb_ot7Jg_RmpcYzMZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
