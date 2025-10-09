import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getUserProfile } from './user-profiles'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (
    !(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  ) {
    throw new Error('Missing Supabase environment variables')
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  
  if (!user && !request.nextUrl.pathname.startsWith('/auth/invitation')) {
    return supabaseResponse
  }
  if (!(user || request.nextUrl.pathname.startsWith('/auth'))) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check their profile and handle redirects
  if (user) {
    const userId = user.sub || user.id
    try {
      const profile = await getUserProfile(userId)
      
      if (profile) {
      // If user is studio_admin with no studio, redirect to create studio page
      if (profile.role === 'studio_admin' && !profile.studio_id && 
          !request.nextUrl.pathname.startsWith('/studio/create') &&
          !request.nextUrl.pathname.startsWith('/auth/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/studio/create'
        return NextResponse.redirect(url)
      }
      
      // If user is studio_member with no studio, redirect to waiting page
      if (profile.role === 'studio_member' && !profile.studio_id &&
          !request.nextUrl.pathname.startsWith('/waiting') &&
          !request.nextUrl.pathname.startsWith('/auth/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/waiting'
        return NextResponse.redirect(url)
      }
      
      // Protect studio routes - only allow access if user has a studio
      if (request.nextUrl.pathname.startsWith('/studio') && 
          !request.nextUrl.pathname.startsWith('/studio/create') &&
          !profile.studio_id) {
        const url = request.nextUrl.clone()
        if (profile.role === 'studio_admin') {
          url.pathname = '/studio/create'
        } else {
          url.pathname = '/waiting'
        }
        return NextResponse.redirect(url)
      }
      
      // Allow studio_admins to access /studio/create even without a studio
      if (request.nextUrl.pathname.startsWith('/studio/create') && 
          profile.role !== 'studio_admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/waiting'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error fetching user profile in middleware:', error)
      // If profile fetch fails, allow the request to continue
      // This prevents middleware from breaking the app
    }
  }

  

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
