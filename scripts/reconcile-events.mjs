import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  try {
    const nowIso = new Date().toISOString();
    console.log('Querying events with ends_at <', nowIso);
    const { data: events, error: eventsErr } = await supabase
      .from('events')
      .select('id')
      .lt('ends_at', nowIso)
      .not('status', 'in', '{completed,cancelled}');
    if (eventsErr) throw eventsErr;

    if (!events || events.length === 0) {
      console.log('No past events to reconcile.');
      return;
    }

    const ids = events.map((e) => e.id);
    console.log(`Found ${ids.length} event(s) to reconcile:`);
    console.log(ids.join(', '));

    const { error: updErr } = await supabase.from('events').update({ status: 'completed' }).in('id', ids);
    if (updErr) throw updErr;
    console.log('Marked events completed.');

    const { error: delErr } = await supabase.from('registrations').delete().in('event_id', ids);
    if (delErr) throw delErr;
    console.log('Deleted registrations for reconciled events.');

    console.log('Reconciliation complete. Processed:', ids.length);
  } catch (err) {
    console.error('Reconciliation failed:', err instanceof Error ? err.message : err);
    process.exit(2);
  }
}

run();
