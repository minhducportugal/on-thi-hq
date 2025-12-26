"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, CheckCircle2, Timer, AlertTriangle, Flag } from "lucide-react";
import { shuffleArray } from "@/lib/quizData";
import { useAllQuestions, useQuizSubmit, useSettings } from "@/hooks/useQuiz";
import { Question as DBQuestion, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Extended type for shuffled question
interface ShuffledQuestion extends DBQuestion {
	correct_option: number; // index of correct answer
	shuffled_options: string[]; // shuffled option texts
}

export default function RandomQuizTest() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
	const [quizTitle] = useState("Đề thi ngẫu nhiên - 60 câu");
	const hasInitialized = useRef(false);
	const { questions, loading, error } = useAllQuestions();
	const { submitQuiz, submitting } = useQuizSubmit();
	const { settings } = useSettings(user?.id);
	const [showAnswerMode, setShowAnswerMode] = useState<"instant" | "end">("end");
	const [timerEnabled, setTimerEnabled] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [initialTime, setInitialTime] = useState(0);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

	// Check authentication
	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	useLayoutEffect(() => {
		if (!questions || questions.length === 0 || hasInitialized.current) return;

		hasInitialized.current = true;

		// Get random 60 questions from all available questions
		const randomMode = sessionStorage.getItem("random_quiz_mode");
		const questionCount = randomMode ? parseInt(randomMode) : 60;

		// Clear the mode after using it
		sessionStorage.removeItem("random_quiz_mode");

		// Shuffle all questions and take only the required count
		const selectedQuestions = shuffleArray([...questions]).slice(0, Math.min(questionCount, questions.length));

		const shuffled = selectedQuestions.map((q) => {
			// Get option texts in original order
			const optionTexts = q.options.map((opt) => opt.option_text);

			// Find index of correct answer (keep original position)
			const correctIndex = q.options.findIndex((opt) => opt.is_correct);

			return {
				...q,
				shuffled_options: optionTexts,
				correct_option: correctIndex,
			};
		});

		setShuffledQuestions(shuffled);

		// Load settings from useSettings hook
		if (settings) {
			setShowAnswerMode(settings.show_answer_mode);
			setTimerEnabled(settings.timer_enabled);
			if (settings.timer_enabled) {
				const timeInSeconds = settings.timer_minutes * 60;
				setTimeLeft(timeInSeconds);
				setInitialTime(timeInSeconds);
			}
		}
	}, [questions, settings]);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = "";
			return "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	// Prevent browser back button
	useEffect(() => {
		window.history.pushState(null, "", window.location.href);

		const handlePopState = () => {
			window.history.pushState(null, "", window.location.href);
			setShowExitDialog(true);
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	// Timer countdown effect
	useEffect(() => {
		if (!timerEnabled || timeLeft <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					handleSubmit();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timerEnabled, timeLeft]);

	const handleSubmit = async () => {
		if (!shuffledQuestions.length) return;

		// Calculate time taken
		const timeTaken = timerEnabled ? initialTime - timeLeft : undefined;

		// Save answers to sessionStorage for result page
		sessionStorage.setItem(`quiz_random_answers`, JSON.stringify(answers));
		sessionStorage.setItem(`quiz_random_shuffled`, JSON.stringify(shuffledQuestions));
		sessionStorage.setItem(`quiz_random_title`, quizTitle);

		// Save to database if user is logged in
		if (user) {
			try {
				// First, get the random-quiz from database
				const { data: quiz, error: quizError } = await supabase
					.from("quizzes")
					.select("id")
					.eq("slug", "random-quiz")
					.single();

				if (quizError) {
					console.error("Error fetching random quiz:", quizError);
				} else if (quiz) {
					const userAnswers = Object.entries(answers).map(([idx, selectedOption]) => {
						const questionIdx = parseInt(idx);
						const shuffledQ = shuffledQuestions[questionIdx];

						// Map shuffled option index back to original option
						const selectedText = shuffledQ.shuffled_options[selectedOption];
						const originalOption = shuffledQ.options.find((opt) => opt.option_text === selectedText);

						return {
							questionId: shuffledQ.id,
							selectedOptionId: originalOption?.id || "",
							isCorrect: originalOption?.is_correct || false,
						};
					});

					const result = await submitQuiz(quiz.id, userAnswers, timeTaken, user.id);
					console.log("Quiz submitted:", result);
				}
			} catch (error) {
				console.error("Error submitting quiz:", error);
			}
		}

		router.push(`/quizz/random-quiz/result`);
	};

	const handleExit = () => {
		setShowExitDialog(true);
	};

	const confirmExit = () => {
		sessionStorage.removeItem(`quiz_random_answers`);
		sessionStorage.removeItem(`quiz_random_shuffled`);
		router.push("/quizz");
	};

	const toggleFlag = (idx: number) => {
		const newFlagged = new Set(flaggedQuestions);
		if (newFlagged.has(idx)) {
			newFlagged.delete(idx);
		} else {
			newFlagged.add(idx);
		}
		setFlaggedQuestions(newFlagged);
	};

	if (authLoading || loading || !shuffledQuestions.length) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-red-500">Lỗi: {error}</div>
			</div>
		);
	}

	const q = shuffledQuestions[currentIdx];
	const progress = ((currentIdx + 1) / shuffledQuestions.length) * 100;

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="min-h-screen bg-slate-50 p-4 md:p-8">
			{/* Exit Confirmation Dialog */}
			{showExitDialog && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
						<div className="flex items-center gap-3 mb-4">
							<AlertTriangle className="h-6 w-6 text-amber-500" />
							<h3 className="text-xl font-bold">Xác nhận thoát</h3>
						</div>
						<p className="text-slate-600 mb-6">
							Bạn có chắc chắn muốn thoát? Tiến trình làm bài của bạn sẽ không được lưu lại.
						</p>
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={() => setShowExitDialog(false)}>
								Hủy
							</Button>
							<Button variant="destructive" onClick={confirmExit}>
								Thoát
							</Button>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-3xl mx-auto space-y-6">
				<header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleExit}
							className="text-slate-600 hover:text-slate-900"
						>
							← Thoát
						</Button>
						<h2 className="font-bold text-lg pr-4 max-sm:w-[150px] sm:w-[200px] md:w-[400px] truncate">
							{quizTitle}
						</h2>
					</div>
					<div className="flex items-center gap-3">
						{timerEnabled && timeLeft > 0 && (
							<div
								className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
									timeLeft <= 60
										? "bg-red-100 text-red-700"
										: timeLeft <= 300
										? "bg-yellow-100 text-yellow-700"
										: "bg-blue-100 text-blue-700"
								}`}
							>
								<Timer className="h-4 w-4" />
								{formatTime(timeLeft)}
							</div>
						)}
					</div>
				</header>

				<div className="flex flex-col">
					<span className="px-3 py-1 rounded-full text-sm font-bold min-w-20 text-right">
						{currentIdx + 1} / {shuffledQuestions.length}
					</span>
					<Progress value={progress} className="h-2 transition-all" />
				</div>

				{flaggedQuestions.size > 0 && (
					<Card className="shadow-md bg-amber-50 border-amber-200">
						<CardContent className="p-4">
							<div className="flex items-center gap-2 mb-3">
								<Flag className="h-4 w-4 text-amber-600 fill-current" />
								<span className="font-semibold text-sm text-amber-800">
									Câu hỏi đã đánh dấu ({flaggedQuestions.size})
								</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{Array.from(flaggedQuestions)
									.sort((a, b) => a - b)
									.map((idx) => (
										<Button
											key={idx}
											variant={currentIdx === idx ? "default" : "outline"}
											size="sm"
											onClick={() => setCurrentIdx(idx)}
											className="min-w-12"
										>
											Câu {idx + 1}
										</Button>
									))}
							</div>
						</CardContent>
					</Card>
				)}

				<Card className="shadow-xl min-h-[400px] flex flex-col">
					<CardHeader>
						<div className="flex items-start justify-between gap-4">
							<CardTitle className="text-xl leading-relaxed text-slate-800 flex-1">
								{q.question_text}
							</CardTitle>
							<Button
								variant={flaggedQuestions.has(currentIdx) ? "default" : "outline"}
								size="sm"
								onClick={() => toggleFlag(currentIdx)}
								className="shrink-0"
							>
								<Flag className={`h-4 w-4 ${flaggedQuestions.has(currentIdx) ? "fill-current" : ""}`} />
							</Button>
						</div>
					</CardHeader>
					<CardContent className="grow">
						<RadioGroup
							value={answers[currentIdx]?.toString()}
							onValueChange={(val) => setAnswers({ ...answers, [currentIdx]: parseInt(val) })}
							className="space-y-4"
						>
							{q.shuffled_options.map((opt, i) => {
								const isSelected = answers[currentIdx] === i;
								const isCorrect = i === q.correct_option;
								const showFeedback = showAnswerMode === "instant" && answers[currentIdx] !== undefined;

								let borderColor = "border-slate-100 hover:border-slate-300";
								let bgColor = "";

								if (showFeedback) {
									if (isCorrect && isSelected) {
										borderColor = "border-green-500";
										bgColor = "bg-green-50";
									} else if (isSelected && !isCorrect) {
										borderColor = "border-red-500";
										bgColor = "bg-red-50";
									}
								} else if (isSelected) {
									borderColor = "border-primary";
									bgColor = "bg-primary/5";
								}

								return (
									<div
										key={i}
										onClick={() => setAnswers({ ...answers, [currentIdx]: i })}
										className={`group flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${borderColor} ${bgColor}`}
									>
										<RadioGroupItem value={i.toString()} id={`r-${i}`} className="sr-only" />
										<Label
											htmlFor={`r-${i}`}
											className="flex-1 cursor-pointer font-medium text-base leading-6 justify-between"
										>
											<div>
												<span className="inline-block w-8 h-8 rounded-full text-center leading-8 transition-colors">
													{String.fromCharCode(65 + i) + "."}
												</span>
												{opt}
											</div>
										</Label>
									</div>
								);
							})}
						</RadioGroup>

						{/* Show explanation when instant mode and answer selected */}
						{showAnswerMode === "instant" && answers[currentIdx] !== undefined && q.explanation && (
							<div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
								<div className="flex items-start gap-2">
									<div className="font-semibold text-blue-700 mt-0.5">💡 Giải thích:</div>
									<p className="text-slate-700 leading-relaxed flex-1">{q.explanation}</p>
								</div>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-between p-6 bg-slate-50/50 rounded-b-xl border-t">
						<Button
							variant="secondary"
							onClick={() => setCurrentIdx((prev) => prev - 1)}
							disabled={currentIdx === 0}
							className="cursor-pointer"
						>
							<ChevronLeft className="mr-1 h-4 w-4" /> Quay lại
						</Button>

						{currentIdx === shuffledQuestions.length - 1 ? (
							<Button
								onClick={handleSubmit}
								className="bg-green-600 hover:bg-green-700 shadow-lg px-8"
								disabled={submitting}
							>
								{submitting ? "Đang nộp..." : "Nộp bài"} <CheckCircle2 className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Button
								disabled={answers[currentIdx] === undefined}
								onClick={() => setCurrentIdx((prev) => prev + 1)}
								className="px-8 shadow-md cursor-pointer"
							>
								Tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
