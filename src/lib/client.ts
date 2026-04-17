import { createBrowserClient } from '@supabase/ssr'

const MOCK_AUTH_STORAGE_KEY = 'portfolio.mock-auth.session'

type AuthUser = {
  email: string
  created_at: string
  last_sign_in_at: string
}

type AuthSession = {
  user: AuthUser
}

type AuthChangeCallback = (event: string, session: AuthSession | null) => void

type QueryResult<T = unknown> = Promise<{
  data: T | null
  error: { message: string } | null
}>

type QueryBuilder = {
  select: (_columns: string) => {
    order: (_column: string, _options?: { ascending?: boolean }) => QueryResult<unknown[]>
  }
  upsert: (_payload: unknown) => QueryResult<null>
  delete: () => {
    eq: (_column: string, _value: string) => QueryResult<null>
  }
}

type SupabaseLikeClient = {
  auth: {
    getSession: () => Promise<{ data: { session: AuthSession | null } }>
    onAuthStateChange: (
      callback: AuthChangeCallback,
    ) => { data: { subscription: { unsubscribe: () => void } } }
    signInWithPassword: (credentials: {
      email: string
      password: string
    }) => Promise<{ error: { message: string } | null }>
    signOut: () => Promise<{ error: null }>
  }
  from: (_table: string) => QueryBuilder
  rpc: (_fn: string, _args: Record<string, unknown>) => QueryResult<null>
  storage: {
    createBucket: (
      _bucket: string,
      _options?: { public?: boolean; fileSizeLimit?: string | null },
    ) => QueryResult<null>
    from: (_bucket: string) => {
      upload: (
        _path: string,
        _file: File,
        _options?: { cacheControl?: string; upsert?: boolean },
      ) => QueryResult<null>
      getPublicUrl: (_path: string) => { data: { publicUrl: string } }
      remove: (_paths: string[]) => QueryResult<null>
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

function readMockSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
    return null
  }
}

function writeMockSession(session: AuthSession | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!session) {
    window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(session))
}

function createMockSupabaseClient(): SupabaseLikeClient {
  const listeners = new Set<AuthChangeCallback>()

  function notify(event: string, session: AuthSession | null) {
    listeners.forEach((listener) => listener(event, session))
  }

  function unavailableError(message: string) {
    return {
      data: null,
      error: { message },
    }
  }

  return {
    auth: {
      async getSession() {
        return {
          data: {
            session: readMockSession(),
          },
        }
      },
      onAuthStateChange(callback) {
        listeners.add(callback)

        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback)
              },
            },
          },
        }
      },
      async signInWithPassword({ email, password }) {
        const validUser = 'pinguim-eletrico@gmail.com'
        const validPass = 'pinguim-trovoada'
        if (email.trim() !== validUser || password !== validPass) {
          return {
            error: { message: 'Usuário ou senha inválidos para o modo local.' },
          }
        }

        const now = new Date().toISOString()
        const session = {
          user: {
            email: email.trim(),
            created_at: now,
            last_sign_in_at: now,
          },
        }

        writeMockSession(session)
        notify('SIGNED_IN', session)

        return { error: null }
      },
      async signOut() {
        writeMockSession(null)
        notify('SIGNED_OUT', null)
        return { error: null }
      },
    },
    from() {
      return {
        select() {
          return {
            async order() {
              return unavailableError('Supabase client not configured')
            },
          }
        },
        async upsert() {
          return unavailableError('Supabase client not configured')
        },
        delete() {
          return {
            async eq() {
              return unavailableError('Supabase client not configured')
            },
          }
        },
      }
    },
    async rpc() {
      return unavailableError('Supabase client not configured')
    },
    storage: {
      async createBucket() {
        return unavailableError('Supabase storage not configured')
      },
      from() {
        return {
          async upload() {
            return unavailableError('Supabase storage not configured')
          },
          getPublicUrl() {
            return {
              data: {
                publicUrl: '',
              },
            }
          },
          async remove() {
            return unavailableError('Supabase storage not configured')
          },
        }
      },
    },
  }
}

function createSupabaseClient() {
  if (!isSupabaseConfigured) {
    return createMockSupabaseClient()
  }

  return createBrowserClient(supabaseUrl!, supabaseKey!) as unknown as SupabaseLikeClient
}

export const supabase = createSupabaseClient()
