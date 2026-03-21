/**
 * Supabase-compatible API Client for iHost Backend
 * Drop-in replacement for @supabase/supabase-js
 * 
 * All existing code using supabase.from(...).select()... continues to work.
 */

const API_URL = import.meta.env.VITE_API_URL 
  || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.georgiantrip.com');

// ── Query Builder (mimics Supabase PostgREST client) ──

class QueryBuilder {
  constructor(table) {
    this._table = table;
    this._operation = null; // select, insert, update, upsert, delete
    this._select = '*';
    this._selectOptions = {};
    this._returnSelect = null; // for .insert().select() chains
    this._filters = [];
    this._order = [];
    this._limit = null;
    this._offset = null;
    this._data = null;
    this._upsertOptions = null;
    this._single = false;
    this._maybeSingle = false;
  }

  select(cols = '*', opts = {}) {
    if (this._operation === 'insert' || this._operation === 'update' || this._operation === 'upsert') {
      // .insert().select() chain — means "return data after mutation"
      this._returnSelect = cols;
    } else {
      this._operation = 'select';
      this._select = cols;
      this._selectOptions = opts;
    }
    return this;
  }

  insert(data) {
    this._operation = 'insert';
    this._data = data;
    return this;
  }

  update(data) {
    this._operation = 'update';
    this._data = data;
    return this;
  }

  upsert(data, opts) {
    this._operation = 'upsert';
    this._data = data;
    this._upsertOptions = opts || {};
    return this;
  }

  delete() {
    this._operation = 'delete';
    return this;
  }

  // Filter methods
  eq(col, val)    { this._filters.push({ type: 'eq', col, val }); return this; }
  neq(col, val)   { this._filters.push({ type: 'neq', col, val }); return this; }
  gt(col, val)    { this._filters.push({ type: 'gt', col, val }); return this; }
  lt(col, val)    { this._filters.push({ type: 'lt', col, val }); return this; }
  gte(col, val)   { this._filters.push({ type: 'gte', col, val }); return this; }
  lte(col, val)   { this._filters.push({ type: 'lte', col, val }); return this; }
  in(col, vals)   { this._filters.push({ type: 'in', col, val: vals }); return this; }
  ilike(col, pat) { this._filters.push({ type: 'ilike', col, val: pat }); return this; }
  like(col, pat)  { this._filters.push({ type: 'like', col, val: pat }); return this; }
  not(col, op, val) { this._filters.push({ type: 'not', col, op, val }); return this; }
  or(orStr)       { this._filters.push({ type: 'or', val: orStr }); return this; }
  is(col, val)    { this._filters.push({ type: 'is', col, val }); return this; }

  // Ordering & Pagination
  order(col, opts = {}) {
    this._order.push({ col, ascending: opts.ascending !== false });
    return this;
  }
  limit(n)        { this._limit = n; return this; }
  range(from, to) { this._offset = from; this._limit = to - from + 1; return this; }

  // Result modifiers
  single()      { this._single = true; return this; }
  maybeSingle() { this._maybeSingle = true; return this; }

  // Make awaitable
  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_URL}/db`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          table: this._table,
          operation: this._operation || 'select',
          select: this._select,
          selectOptions: this._selectOptions,
          returnSelect: this._returnSelect,
          filters: this._filters,
          order: this._order,
          limit: this._limit,
          offset: this._offset,
          data: this._data,
          upsertOptions: this._upsertOptions,
          single: this._single,
          maybeSingle: this._maybeSingle,
        })
      });

      const result = await response.json();

      if (result.error) {
        return { data: null, error: { message: result.error }, count: null };
      }

      return {
        data: result.data,
        error: null,
        count: result.count !== undefined ? result.count : null,
      };
    } catch (err) {
      return { data: null, error: { message: err.message }, count: null };
    }
  }
}


// ── Auth Module ──

const authListeners = [];
let currentSession = null;

const auth = {
  async getSession() {
    const token = localStorage.getItem('auth_token');
    if (!token) return { data: { session: null }, error: null };

    try {
      const res = await fetch(`${API_URL}/auth/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return { data: { session: null }, error: null };
      }
      const data = await res.json();
      currentSession = data.session;
      return { data: { session: data.session }, error: null };
    } catch (err) {
      return { data: { session: null }, error: { message: err.message } };
    }
  },

  onAuthStateChange(callback) {
    authListeners.push(callback);
    // Check current state on subscription
    const token = localStorage.getItem('auth_token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('auth_user') || 'null');
      if (userData) {
        const session = { user: userData, access_token: token };
        setTimeout(() => callback('SIGNED_IN', session), 0);
      }
    } else {
      setTimeout(() => callback('SIGNED_OUT', null), 0);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = authListeners.indexOf(callback);
            if (idx > -1) authListeners.splice(idx, 1);
          }
        }
      }
    };
  },

  async signUp({ email, password, options }) {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, options })
      });
      const result = await res.json();
      if (result.error) return { data: { user: null, session: null }, error: result.error };

      localStorage.setItem('auth_token', result.session.access_token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      currentSession = result.session;
      _notifyAuth('SIGNED_IN', result.session);
      return { data: result, error: null };
    } catch (err) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  },

  async signInWithPassword({ email, password }) {
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();
      if (result.error) return { data: { user: null, session: null }, error: result.error };

      localStorage.setItem('auth_token', result.session.access_token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      currentSession = result.session;
      _notifyAuth('SIGNED_IN', result.session);
      return { data: result, error: null };
    } catch (err) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  },

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    currentSession = null;
    _notifyAuth('SIGNED_OUT', null);
    return { error: null };
  },

  async updateUser(updates) {
    const token = localStorage.getItem('auth_token');
    if (!token) return { data: { user: null }, error: { message: 'Not authenticated' } };

    try {
      const res = await fetch(`${API_URL}/auth/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (result.error) return { data: { user: null }, error: result.error };
      return { data: { user: result.user }, error: null };
    } catch (err) {
      return { data: { user: null }, error: { message: err.message } };
    }
  },

  async resetPasswordForEmail(email, options = {}) {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...options })
      });
      const result = await res.json();
      if (result.error) return { data: null, error: result.error };
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
};

function _notifyAuth(event, session) {
  authListeners.forEach(cb => {
    try { cb(event, session); } catch (e) { console.error('Auth listener error:', e); }
  });
}


// ── Storage Module ──

const storage = {
  from(bucket) {
    return {
      async upload(path, file, options = {}) {
        const token = localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('path', path);
        if (options.upsert) formData.append('upsert', 'true');

        try {
          const res = await fetch(`${API_URL}/storage/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
          });
          const result = await res.json();
          if (result.error) return { data: null, error: { message: result.error } };
          return { data: { path: result.key, fullPath: result.key }, error: null };
        } catch (err) {
          return { data: null, error: { message: err.message } };
        }
      },

      getPublicUrl(path) {
        // Construct S3 public URL
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        const publicUrl = `https://s3.ihost.ge/site-georgiantrip-com/images/${cleanPath}`;
        return { data: { publicUrl } };
      },

      async remove(paths) {
        // Stub - can implement later
        return { data: null, error: null };
      },

      async list(prefix, options = {}) {
        // Stub - can implement later
        return { data: [], error: null };
      }
    };
  }
};


// ── RPC Module ──

async function rpc(fnName, args) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}/rpc/${fnName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(args)
    });
    const result = await res.json();
    if (result.error) return { data: null, error: { message: result.error } };
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
}


// ── Edge Functions Module ──

const functions = {
  async invoke(fnName, { body } = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_URL}/functions/${fnName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.error) return { data: null, error: { message: result.error } };
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }
};


// ── Realtime Channel (stub with polling fallback) ──

function channel(name) {
  const listeners = [];
  let pollInterval = null;

  return {
    on(eventType, config, callback) {
      listeners.push({ eventType, config, callback });
      return this;
    },
    subscribe() {
      // For now, stub realtime — admin pages can use manual refresh
      // Could implement polling here if needed
      return this;
    },
    unsubscribe() {
      if (pollInterval) clearInterval(pollInterval);
    }
  };
}


// ── Main Client Object ──

const client = {
  from: (table) => new QueryBuilder(table),
  auth,
  storage,
  rpc,
  functions,
  channel,
};

export default client;
export {
  client as customSupabaseClient,
  client as supabase,
};
