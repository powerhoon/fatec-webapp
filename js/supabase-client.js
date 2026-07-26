// Supabase client - lightweight fetch-based, no SDK needed
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

const supabase = {
  async from(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`);
    return res.json();
  },

  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if (!res.ok && res.status !== 201) throw new Error(`Supabase insert ${table}: ${res.status}`);
    return res;
  },

  async storageDownload(bucket, path) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`);
    if (!res.ok) throw new Error(`Storage download: ${res.status}`);
    return res;
  },

  async storageUpload(bucket, path, file) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: file
    });
    if (!res.ok) throw new Error(`Storage upload: ${res.status}`);
    return res.json();
  },

  async rpc(fn, params = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`RPC ${fn}: ${res.status}`);
    return res.json();
  }
};

// Set env vars (these should be replaced with actual values)
// window.SUPABASE_URL = 'https://your-project.supabase.co';
// window.SUPABASE_ANON_KEY = 'your-anon-key';