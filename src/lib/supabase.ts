import { createClient } from '@supabase/supabase-js';
import { debugLog, DEBUG_LEVELS } from './debug';
import type { Lead } from '../types/lead';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

debugLog(DEBUG_LEVELS.INFO, 'Initializing Supabase client', { url: supabaseUrl });

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

export type AuthError = {
  message: string;
};

export async function signUp(email: string, password: string) {
  debugLog(DEBUG_LEVELS.DB, 'Attempting user signup', { email });
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          email_confirmed: true
        }
      }
    });
    
    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Signup failed', error);
      throw error;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Signup successful', { userId: data.user?.id });

    // Sign in immediately after sign up
    if (data.user) {
      return signIn(email, password);
    }
    
    return data;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Unexpected error during signup', err);
    throw err;
  }
}

export async function signIn(email: string, password: string) {
  debugLog(DEBUG_LEVELS.DB, 'Attempting user signin', { email });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Signin failed', error);
      throw error;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Signin successful', { userId: data.user?.id });
    return data;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Unexpected error during signin', err);
    throw err;
  }
}

export async function signOut() {
  debugLog(DEBUG_LEVELS.DB, 'Attempting user signout');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Signout failed', error);
      throw error;
    }
    debugLog(DEBUG_LEVELS.INFO, 'Signout successful');
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Unexpected error during signout', err);
    throw err;
  }
}

export async function getCurrentUser() {
  debugLog(DEBUG_LEVELS.DB, 'Fetching current user');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Failed to fetch current user', error);
      throw error;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Current user fetched', { userId: user?.id });
    return user;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Unexpected error fetching current user', err);
    throw err;
  }
}

// Update a lead with error handling and validation
export async function updateLead(leadId: string, data: Partial<Lead>) {
  debugLog(DEBUG_LEVELS.DB, 'Updating lead', { leadId, data });

  try {
    const { error } = await supabase
      .from('leads')
      .update(data)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Failed to update lead', error);
      throw error;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Lead updated successfully', { leadId });
    return true;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Error updating lead', err);
    throw err;
  }
}

// Database health check
export async function checkDatabaseConnection() {
  debugLog(DEBUG_LEVELS.DB, 'Checking database connection');
  
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Database connection check failed', error);
      return false;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Database connection successful');
    return true;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Database connection check error', err);
    return false;
  }
}

// Verify table structure
export async function verifyTableStructure() {
  debugLog(DEBUG_LEVELS.DB, 'Verifying leads table structure');
  
  try {
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: 'leads' });

    if (error) {
      debugLog(DEBUG_LEVELS.ERROR, 'Table structure verification failed', error);
      return false;
    }

    debugLog(DEBUG_LEVELS.INFO, 'Table structure verified', data);
    return true;
  } catch (err) {
    debugLog(DEBUG_LEVELS.ERROR, 'Table structure verification error', err);
    return false;
  }
}