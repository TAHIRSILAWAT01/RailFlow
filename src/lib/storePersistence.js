const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseSecretKey) {
  throw new Error('Missing SUPABASE_SECRET_KEY');
}

const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function getStateId(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  return `railflow-session-${sessionId}`;
}

async function loadPersistedState(sessionId) {
  const stateId = getStateId(sessionId);

  const { data, error } = await supabase
    .from('railflow_state')
    .select('state')
    .eq('id', stateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load RailFlow state: ${error.message}`);
  }

  return data?.state || null;
}

async function savePersistedState(sessionId, state) {
  const stateId = getStateId(sessionId);

  const { data, error } = await supabase
    .from('railflow_state')
    .upsert(
      {
        id: stateId,
        state,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )
    .select('id, updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to save RailFlow state: ${error.message}`);
  }

  return data;
}

async function clearPersistedState(sessionId) {
  const stateId = getStateId(sessionId);

  const { error } = await supabase
    .from('railflow_state')
    .delete()
    .eq('id', stateId);

  if (error) {
    throw new Error(`Failed to clear RailFlow state: ${error.message}`);
  }
}

module.exports = {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
};