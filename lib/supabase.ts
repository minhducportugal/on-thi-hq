import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Quiz {
  id: string
  slug: string
  title: string
  description?: string
  total_questions: number
  is_active: boolean
}

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  explanation?: string
  order_index: number
  options: Option[]
}

export interface Option {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

export interface QuizAttempt {
  id: string
  user_id?: string
  quiz_id: string
  score: number
  total_questions: number
  percentage: number
  time_taken?: number
  settings?: Record<string, unknown>
  completed_at: string
}

export interface UserAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option_id: string
  is_correct: boolean
}

export interface UserSettings {
  user_id?: string
  show_answer_mode: 'instant' | 'end'
  timer_enabled: boolean
  timer_minutes: number
  shuffle_questions?: boolean
  dark_mode?: boolean
  auto_next?: boolean
}
