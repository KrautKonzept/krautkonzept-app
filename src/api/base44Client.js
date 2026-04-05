import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xplyregpcpitlpcozzfn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zR1krhN8hAGB8r_sQV2L_w_rVcojXHQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// TABLE NAME MAP (base44 entity → supabase table)
// ============================================
const TABLE_MAP = {
  Task: 'tasks',
  Client: 'clients',
  TimeEntry: 'time_entries',
  TokenEntry: 'token_entries',
  Booking: 'bookings',
  Invoice: 'invoices',
  Note: 'notes',
  InternalMessage: 'internal_messages',
  Kostensatz: 'kostensaetze',
  CompanySettings: 'company_settings',
  AiUsage: 'ai_usage',
  User: 'profiles',
};

// ============================================
// ENTITY PROXY — mirrors base44.entities.X API
// base44:  base44.entities.Task.list('-created_date', 50)
// new:     base44.entities.Task.list('-created_date', 50)  ← identical call
// ============================================
function makeEntity(tableName) {
  return {
    // base44.entities.X.list(sort, limit)
    async list(sort = '-created_date', limit = 100) {
      const order = sort.startsWith('-') ? sort.slice(1) : sort;
      const ascending = !sort.startsWith('-');
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(order, { ascending })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    // base44.entities.X.filter(conditions, sort, limit)
    async filter(conditions = {}, sort = '-created_date', limit = 100) {
      const order = sort.startsWith('-') ? sort.slice(1) : sort;
      const ascending = !sort.startsWith('-');
      let query = supabase.from(tableName).select('*');
      for (const [key, val] of Object.entries(conditions)) {
        if (Array.isArray(val)) {
          query = query.in(key, val);
        } else {
          query = query.eq(key, val);
        }
      }
      const { data, error } = await query
        .order(order, { ascending })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    // base44.entities.X.create(data)
    async create(data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // base44.entities.X.update(id, data)
    async update(id, data) {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // base44.entities.X.delete(id)
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

// ============================================
// AUTH — mirrors base44.auth API
// ============================================
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    // Fetch profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return { ...user, ...profile };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  },

  redirectToLogin() {
    window.location.href = '/login';
  },
};

// ============================================
// INTEGRATIONS — replaces base44.integrations.Core.SendEmail
// ============================================
const integrations = {
  Core: {
    async SendEmail({ to, subject, body }) {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body },
      });
      if (error) throw error;
      return { success: true };
    },
  },
};

// ============================================
// MAIN EXPORT — drop-in replacement for base44
// Usage in components stays identical:
//   import { base44 } from '@/api/base44Client';
//   base44.entities.Task.list(...)  ← works unchanged
// ============================================
export const base44 = {
  entities: new Proxy({}, {
    get(_, entityName) {
      const tableName = TABLE_MAP[entityName];
      if (!tableName) throw new Error(`Unknown entity: ${entityName}`);
      return makeEntity(tableName);
    },
  }),
  auth,
  integrations,
};
