import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This uses service role key which bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}