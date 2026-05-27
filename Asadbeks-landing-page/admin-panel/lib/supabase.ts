import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()

export type UserRole = 'super_admin' | 'admin' | 'moderator'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Course {
  id: string
  name: string
  price: number
  schedule: string
  students_count: number
  type: 'online' | 'offline' | 'both'
  description: string
  is_popular: boolean
  is_active: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  full_name: string
  phone: string
  course_id: string
  status: 'pending' | 'approved' | 'rejected'
  source_page: string
  created_at: string
  courses?: { name: string }
}

export interface Review {
  id: string
  full_name: string
  avatar_url: string | null
  course: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export interface SiteStat {
  id: string
  date: string
  visits: number
  unique_visitors: number
  enrollments_count: number
  most_visited_page: string
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  updated_at: string
}
