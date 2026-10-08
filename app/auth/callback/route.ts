import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/mypage'
  const providerError =
    requestUrl.searchParams.get('error_description') ??
    requestUrl.searchParams.get('error') ??
    null

  if (!code) {
    const redirectUrl = new URL('/mypage', requestUrl.origin)
    const receivedParams = Array.from(requestUrl.searchParams.keys())
      .filter((key) => key !== 'code')
      .join(', ')

    redirectUrl.searchParams.set(
      'auth_error',
      providerError
        ? providerError
        : `missing_code${receivedParams ? `; received: ${receivedParams}` : ''}`
    )
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const redirectUrl = new URL('/mypage', requestUrl.origin)
    redirectUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
