'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const identity = (formData.get('identity') as string).trim()
  const password = formData.get('password') as string

  let email = identity

  // If identity doesn't look like an email, assume it's a username
  if (!identity.includes('@')) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find user with this username in metadata
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (!fetchError && users) {
      const userMatch = users.users.find(u => u.user_metadata?.username?.toLowerCase() === identity.toLowerCase())
      if (userMatch && userMatch.email) {
        email = userMatch.email
      }
    }
  }

  // Handle Supabase Auth login using the resolved email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Determine role based on user metadata
  const user = data.user
  const isAdmin = user?.user_metadata?.username === 'admin'
  const role = isAdmin ? 'admin' : 'user'

  const cookieStore = await cookies()
  cookieStore.set('user-role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    httpOnly: false, // Allow client-side reading for Navbar
  })
  
  revalidatePath('/', 'layout')
  
  if (isAdmin) {
    redirect('/dashboard')
  } else {
    redirect('/store')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://partisihidup.vercel.app'}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const cookieStore = await cookies()
  cookieStore.delete('user-role')

  revalidatePath('/', 'layout')
  redirect('/login')
}
