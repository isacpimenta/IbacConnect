import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ROTAS PÚBLICAS (Adicionamos o callback e a redefinição aqui)
  const isLoginPage = pathname === '/'
  const isCadastroPage = pathname.startsWith('/cadastro')
  const isCallbackPage = pathname.startsWith('/auth/callback')
  const isRedefinirPage = pathname.startsWith('/redefinirsenha')
  
  // Se for qualquer uma dessas, o middleware não redireciona para o login
  const isPublicPage = isLoginPage || isCadastroPage || isCallbackPage || isRedefinirPage

  // 1. Se não houver usuário e não for página pública -> Vai para Login ('/')
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 2. Se houver usuário e tentar acessar Login ou Cadastro -> Vai para Home
  // (Nota: Não bloqueamos callback ou redefinir aqui para evitar loops)
  if (user && (isLoginPage || isCadastroPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}