"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Option {
	id: string;
	option_text: string;
	is_correct: boolean;
}

interface QuestionWithOptions {
	id: string;
	question_text: string;
	explanation?: string;
	options: Option[];
}

interface ShuffledQuestion {
	id: string;
	question_text: string;
	shuffled_options: string[];
	correct_option: number;
	explanation?: string;
}

export default function RandomQuizReview() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const attemptId = searchParams.get('attempt');

	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadReview() {
			// If viewing from history (has attemptId), load from database
			if (attemptId) {
				try {
					// Get user answers for this attempt
					const { data: userAnswers } = await supabase
						.from('user_answers')
						.select('question_id, selected_option_id, questions(id, question_text, explanation, options(id, option_text, is_correct))')
						.eq('attempt_id', attemptId);

					if (!userAnswers || userAnswers.length === 0) {
						router.push("/quizz");
						return;
					}

					// Build questions and answers
					const loadedQuestions: ShuffledQuestion[] = [];
					const loadedAnswers: Record<number, number> = {};

					userAnswers.forEach((ua, idx) => {
						const q = ua.questions as unknown as QuestionWithOptions;
						const options = q.options.sort((a, b) => a.option_text.localeCompare(b.option_text));
						const correctIdx = options.findIndex(opt => opt.is_correct);
						const selectedIdx = options.findIndex(opt => opt.id === ua.selected_option_id);

						loadedQuestions.push({
							id: q.id,
							question_text: q.question_text,
							shuffled_options: options.map(opt => opt.option_text),
							correct_option: correctIdx,
							explanation: q.explanation
						});

						loadedAnswers[idx] = selectedIdx;
					});

					setQuestions(loadedQuestions);
					setAnswers(loadedAnswers);
					setLoading(false);
				} catch (error) {
					console.error("Error loading attempt:", error);
					router.push("/quizz");
				}
			} else {
				// Load from sessionStorage (just completed quiz)
				const answersData = sessionStorage.getItem(`quiz_random_answers`);
				const quizData = sessionStorage.getItem(`quiz_random_shuffled`);

				if (!answersData || !quizData) {
					router.push("/quizz");
					return;
				}

				try {
					setAnswers(JSON.parse(answersData));
					setQuestions(JSON.parse(quizData));
					setLoading(false);
				} catch (error) {
					console.error("Error loading quiz review:", error);
					router.push("/quizz");
				}
			}
		}

		loadReview();
	}, [attemptId, router]);

	const handleRetry = () => {
		sessionStorage.removeItem(`quiz_random_answers`);
		sessionStorage.removeItem(`quiz_random_shuffled`);
		sessionStorage.removeItem(`quiz_random_title`);
		sessionStorage.setItem('random_quiz_mode', '60');
		router.push(`/quizz/random-quiz/test`);
	};

	const handleHome = () => {
		sessionStorage.removeItem(`quiz_random_answers`);
		sessionStorage.removeItem(`quiz_random_shuffled`);
		sessionStorage.removeItem(`quiz_random_title`);
		router.push("/quizz");
	};

	if (questions.length === 0 || loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 p-4 md:p-8">
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold">Xem lại đáp án - Đề ngẫu nhiên</h2>
					<Button onClick={handleHome} variant="outline">
						<Home className="mr-2 h-4" /> Trang chủ
					</Button>
				</div>

				<ScrollArea className="h-[70vh] rounded-md border p-4 bg-white">
					{questions.map((q, idx) => {
						const isCorrect = answers[idx] === q.correct_option;
						return (
							<div key={idx} className="mb-8 p-4 border-b last:border-0">
								<div className="flex items-start gap-3 mb-3">
									{isCorrect ? (
										<CheckCircle2 className="text-green-500 mt-1" />
									) : (
										<XCircle className="text-red-500 mt-1" />
									)}
									<p className="font-medium">
										Câu {idx + 1}: {q.question_text}
									</p>
								</div>
								<div className="ml-9 space-y-2">
									{q.shuffled_options.map((opt, i) => (
										<div
											key={i}
											className={`text-sm p-2 rounded ${
												i === q.correct_option
													? "bg-green-100 border-green-200 border text-green-800"
													: i === answers[idx] && !isCorrect
													? "bg-red-100 border-red-200 border text-red-800"
													: "text-slate-600"
											}`}
										>
											{String.fromCharCode(65 + i)}. {opt}
											{i === q.correct_option && (
												<span className="ml-2 font-bold">(Đáp án đúng)</span>
											)}
										</div>
									))}

									{/* Show explanation if available */}
									{q.explanation && (
										<div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
											<div className="flex items-start gap-2">
												<span className="font-semibold text-blue-700">💡 Giải thích:</span>
												<p className="text-slate-700 text-sm leading-relaxed flex-1 pt-0.5">
													{q.explanation}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</ScrollArea>

				<Button className="w-full py-6 text-lg" onClick={handleRetry}>
					<RotateCcw className="mr-2" /> Thử sức lại
				</Button>
			</div>
		</div>
	);
}
