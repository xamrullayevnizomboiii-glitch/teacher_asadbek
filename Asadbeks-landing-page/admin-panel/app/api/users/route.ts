import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This client uses the SERVICE_ROLE_KEY to bypass RLS and create auth users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, full_name, role } = body

    // Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      // Upsert user into public.users with the chosen role
      const { error: dbError } = await supabaseAdmin.from('users').upsert({
        id: authData.user.id,
        email,
        full_name,
        role
      }, { onConflict: 'id' })

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, user: authData.user })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
