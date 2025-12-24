"use client";

import { useState, useEffect } from 'react';
import { 
  getQuizzes, 
  getQuestions, 
  getUserSettings, 
  saveUserSettings,
  saveQuizAttempt,
  saveUserAnswers
} from '@/lib/quizService';
import { supabase } from '@/lib/supabase';
import type { Quiz, Question, UserSettings } from '@/lib/supabase';

interface QuizAttempt {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getQuizzes()
      .then(setQuizzes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { quizzes, loading, error };
}

export function useQuizHistory(quizSlug: string, userId: string | undefined) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!userId || !quizSlug) {
      setLoading(false);
      setAttempts([]);
      return;
    }

    setLoading(true);

    const { data: quiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('slug', quizSlug)
      .single();

    if (!quiz) {
      setLoading(false);
      setAttempts([]);
      return;
    }

    const { data } = await supabase
      .from('quiz_attempts')
      .select('id, score, total_questions, completed_at')
      .eq('user_id', userId)
      .eq('quiz_id', quiz.id)
      .order('completed_at', { ascending: false })
      .limit(5);

    setAttempts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizSlug, userId]);

  return { attempts, loading, refetch: fetchHistory };
}

export function useQuestions(slug: string | null) {
	const [questions, setQuestions] = useState<(Question & { quiz: Quiz })[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) {
			setLoading(false);
			return;
		}

		setLoading(true);
		
		// First get quiz by slug
		getQuizzes()
			.then((quizzes) => {
				const quiz = quizzes.find(q => q.slug === slug);
				if (!quiz) {
					throw new Error('Quiz not found');
				}
				return getQuestions(quiz.id).then(qs => 
					qs.map(q => ({ ...q, quiz }))
				);
			})
			.then(setQuestions)
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [slug]);

  return { questions, loading, error };
}

export function useSettings(userId?: string) {
  const [settings, setSettings] = useState<UserSettings>({
    show_answer_mode: 'end',
    timer_enabled: false,
    timer_minutes: 30
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first for instant UI
    const localMode = localStorage.getItem('quiz_showAnswerMode');
    const localTimer = localStorage.getItem('quiz_timerEnabled');
    const localMinutes = localStorage.getItem('quiz_timerMinutes');

    if (localMode || localTimer || localMinutes) {
      setSettings({
        show_answer_mode: (localMode as 'instant' | 'end') || 'end',
        timer_enabled: localTimer === 'true',
        timer_minutes: parseInt(localMinutes || '30')
      });
    }

    // Then load from DB if user exists
    getUserSettings(userId)
      .then(setSettings)
      .finally(() => setLoading(false));
  }, [userId]);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveUserSettings(updated, userId);
  };

  return { settings, saveSettings, loading, saving: false };
}

export function useQuizSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitQuiz = async (
    quizId: string,
    answers: Array<{
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
    }>,
    timeTaken?: number,
    userId?: string
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      // Calculate score from answers
      const score = answers.filter(a => a.isCorrect).length;
      const totalQuestions = answers.length;

      // Save attempt
      const attempt = await saveQuizAttempt(
        quizId,
        score,
        totalQuestions,
        timeTaken,
        {},
        userId
      );

      // Save individual answers
      await saveUserAnswers(attempt.id, answers);

      return { success: true, score, attempt };
    } catch (err) {
      setError(err as Error);
      return { success: false, score: 0, attempt: null };
    } finally {
      setSubmitting(false);
    }
  };

  return { submitQuiz, submitting, error };
}
