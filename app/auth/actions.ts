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

  console.log(`--- Login Attempt ---`);
  console.log(`Identity provided: "${identity}"`);

  // 1. Resolve Identity to Email via 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, role, username')
    .or(`email.eq.${identity},username.eq.${identity}`)
    .single()

  if (profileError || !profile) {
    console.warn(`No profile found for identity: "${identity}"`);
    return redirect('/login?error=' + encodeURIComponent('Account not found. Please check your username or email.'))
  }

  const emailToSignIn = profile.email
  console.log(`Identity resolved to email: "${emailToSignIn}" (Role: ${profile.role})`);

  // 2. Final Auth Attempt with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password: password,
  })

  if (error) {
    console.log(`Sign-in failed for "${emailToSignIn}": ${error.message}`);
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  console.log(`Sign-in successful for: ${data.user.email}`);

  // 3. Determine role from Profiles table
  const role = profile.role || 'user'

  const cookieStore = await cookies()
  cookieStore.set('user-role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    httpOnly: false, // Allow client-side reading for Navbar
  })
  
  revalidatePath('/', 'layout')
  
  if (role === 'admin') {
    redirect('/dashboard')
  } else {
    redirect('/store')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const fullName = formData.get('full_name') as string || ''

  // Determine the correct redirect URL based on environment
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.NODE_ENV === 'production' ? 'https://onlydiecast.vercel.app' : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        full_name: fullName
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Profile will be created automatically via database trigger (SQL provided in instructions)
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
