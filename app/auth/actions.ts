'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const identity = formData.get('identity') as string
  const password = formData.get('password') as string

  // Handle hardcoded Admin login
  if (identity === 'admin' && password === 'Zorro2026!') {
    const cookieStore = await cookies()
    cookieStore.set('user-role', 'admin', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      httpOnly: false, // Allow client-side reading for Navbar
    })
    
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // Handle standard User login
  const data = {
    email: identity.trim(),
    password: password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  const cookieStore = await cookies()
  cookieStore.set('user-role', 'user', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    httpOnly: false,
  })

  revalidatePath('/', 'layout')
  redirect('/store')
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
