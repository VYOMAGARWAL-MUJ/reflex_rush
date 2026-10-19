const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const supabase = getSupabase();
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('scores')
        .select('id, name, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);
      if (error) throw error;
      return res.status(200).json((data || []).map(row => ({
        id: row.id,
        name: row.name,
        score: row.score,
        createdAt: row.created_at
      })));
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 18) : '';
    const score = Number(body.score);
    if (!name) return res.status(400).json({ error: 'Please provide a player name.' });
    if (!Number.isInteger(score) || score < 0 || score > 100000) {
      return res.status(400).json({ error: 'Score must be a valid non-negative integer.' });
    }

    const { data, error } = await supabase
      .from('scores')
      .insert({ name, score })
      .select('id, name, score, created_at')
      .single();
    if (error) throw error;
    return res.status(201).json({
      message: 'Score saved!',
      entry: { id: data.id, name: data.name, score: data.score, createdAt: data.created_at }
    });
  } catch (error) {
    console.error('Scores API error:', error.message || error);
    return res.status(500).json({ error: 'Leaderboard storage is not configured correctly or is temporarily unavailable.' });
  }
};
