import { supabase } from './supabase'
import type { Quiz, Question, QuizAttempt, UserSettings, Option } from './supabase'

// ============================================
// QUIZ OPERATIONS
// ============================================

export async function getQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  
  if (error) throw error
  return data as Quiz[]
}

export async function getQuizBySlug(slug: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data as Quiz
}

export async function getQuestions(quizId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      options (*)
    `)
    .eq('quiz_id', quizId)
    .order('order_index')
  
  if (error) throw error
  
  // Sort options by order_index
  return data.map(q => ({
    ...q,
    options: q.options.sort((a: Option, b: Option) => a.order_index - b.order_index)
  })) as Question[]
}

// ============================================
// QUIZ ATTEMPT OPERATIONS
// ============================================

export async function saveQuizAttempt(
  quizId: string,
  score: number,
  totalQuestions: number,
  timeTaken?: number,
  settings?: Record<string, unknown>,
  userId?: string
) {
  const percentage = (score / totalQuestions) * 100
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      percentage,
      time_taken: timeTaken,
      settings
    })
    .select()
    .single()
  
  if (error) throw error
  return data as QuizAttempt
}

export async function saveUserAnswers(
  attemptId: string,
  answers: Array<{
    questionId: string
    selectedOptionId: string
    isCorrect: boolean
  }>
) {
  const { error } = await supabase
    .from('user_answers')
    .insert(
      answers.map(a => ({
        attempt_id: attemptId,
        question_id: a.questionId,
        selected_option_id: a.selectedOptionId,
        is_correct: a.isCorrect
      }))
    )
  
  if (error) throw error
}

export async function getUserHistory(userId?: string, limit = 10) {
  let query = supabase
    .from('user_quiz_history')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit)
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// ============================================
// USER SETTINGS OPERATIONS
// ============================================

export async function getUserSettings(userId?: string): Promise<UserSettings> {
  // If no userId, return defaults
  if (!userId) {
    return {
      show_answer_mode: 'end',
      timer_enabled: false,
      timer_minutes: 30
    }
  }
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  // If no settings found, return defaults
  if (error || !data) {
    return {
      shuffle_questions: false,
      show_answer_mode: 'end',
      timer_enabled: false,
      timer_minutes: 30
    }
  }
  
  return data as UserSettings
}

export async function saveUserSettings(settings: UserSettings, userId?: string) {
  if (!userId) {
    // Save to localStorage if no user
    localStorage.setItem('quiz_showAnswerMode', settings.show_answer_mode)
    localStorage.setItem('quiz_timerEnabled', settings.timer_enabled.toString())
    localStorage.setItem('quiz_timerMinutes', settings.timer_minutes.toString())
    localStorage.setItem('quiz_shuffleQuestions', (settings.shuffle_questions ?? true).toString())
    return
  }
  
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings
    })
  
  if (error) throw error
}

// ============================================
// STATISTICS
// ============================================

export async function getQuizStatistics(quizId: string) {
  const { data, error } = await supabase
    .from('quiz_statistics')
    .select('*')
    .eq('id', quizId)
    .single()
  
  if (error) throw error
  return data
}

export async function getUserStats(userId: string) {
  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  
  const totalAttempts = attempts.length
  const avgScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
  const bestScore = Math.max(...attempts.map(a => a.percentage))
  
  return {
    totalAttempts,
    avgScore,
    bestScore
  }
}
