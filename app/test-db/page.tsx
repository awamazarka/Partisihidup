import { createClient } from '@/utils/supabase/server'

export default async function ConnectionTest() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
  
  // Note: _test_connection probably doesn't exist, but we can check the error type
  // to see if we're actually reaching Supabase or failing at auth/network level.
  
  return (
    <div className="p-10 glass mt-40 max-w-2xl mx-auto rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Status</h2>
      {error ? (
        <div className="space-y-2">
          <p className="text-amber-500 font-bold">Connected to API, but query failed (expected if table missing):</p>
          <pre className="bg-black/50 p-4 rounded-xl text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
          <p className="text-zinc-400 text-sm mt-4">
            Status Code: {error.code} <br/>
            If you see "PGRST116" or "42P01", it means we ARE connected but the table doesn't exist yet.
          </p>
        </div>
      ) : (
        <p className="text-neon-cyan font-bold">Successfully connected and queried!</p>
      )}
    </div>
  )
}
