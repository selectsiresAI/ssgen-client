export type UserRole = 'cliente' | 'tecnico' | 'admin'
export type BreedCode = 'HO' | 'JE'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  breed: BreedCode | null
  locale: string
  created_at: string
  updated_at: string
}
