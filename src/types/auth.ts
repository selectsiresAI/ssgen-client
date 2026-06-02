export type UserRole = 'cliente' | 'tecnico' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  locale: string
  created_at: string
  updated_at: string
}
