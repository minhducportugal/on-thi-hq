"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, CheckCircle2, Timer, AlertTriangle, Flag } from "lucide-react";
import { QUIZZES, QuizData, shuffleQuiz } from "@/lib/quizData";

export default function QuizTest() {
	const router = useRouter();
	const params = useParams();
	const slug = params.slug as string;

	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [shuffledQuiz, setShuffledQuiz] = useState<QuizData | null>(null);
	const [showAnswerMode, setShowAnswerMode] = useState<"instant" | "end">("end");
	const [timerEnabled, setTimerEnabled] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);
	const [showExitDialog, setShowExitDialog] = useState(false);
	const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

	useEffect(() => {
		// Load quiz data
		const originalQuiz = QUIZZES[slug];
		if (!originalQuiz) {
			router.push("/quizz");
			return;
		}

		setShuffledQuiz(shuffleQuiz(originalQuiz));

		// Load settings from localStorage
		const savedMode = localStorage.getItem("quiz_showAnswerMode");
		if (savedMode === "instant" || savedMode === "end") {
			setShowAnswerMode(savedMode);
		}

		const savedTimerEnabled = localStorage.getItem("quiz_timerEnabled");
		if (savedTimerEnabled === "true") {
			setTimerEnabled(true);
			const savedMinutes = localStorage.getItem("quiz_timerMinutes");
			const minutes = savedMinutes ? parseInt(savedMinutes) : 30;
			setTimeLeft(minutes * 60);
		}
	}, [slug, router]);

	// Prevent accidental page leave
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
		// Push a state to history when component mounts
		window.history.pushState(null, "", window.location.href);

		const handlePopState = (e: PopStateEvent) => {
			// Push the state again to prevent going back
			window.history.pushState(null, "", window.location.href);
			// Show exit dialog instead
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
					// Auto submit when time is up
					handleSubmit();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [timerEnabled, timeLeft]);

	const handleSubmit = () => {
		// Save answers to sessionStorage
		sessionStorage.setItem(`quiz_${slug}_answers`, JSON.stringify(answers));
		sessionStorage.setItem(`quiz_${slug}_shuffled`, JSON.stringify(shuffledQuiz));
		router.push(`/quizz/${slug}/result`);
	};

	const handleExit = () => {
		setShowExitDialog(true);
	};

	const confirmExit = () => {
		sessionStorage.removeItem(`quiz_${slug}_answers`);
		sessionStorage.removeItem(`quiz_${slug}_shuffled`);
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

	if (!shuffledQuiz) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	const q = shuffledQuiz.questions[currentIdx];
	const progress = ((currentIdx + 1) / shuffledQuiz.questions.length) * 100;

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
						<Button variant="ghost" size="sm" onClick={handleExit} className="text-slate-600 hover:text-slate-900">
							← Thoát
						</Button>
						<h2 className="font-bold text-lg truncate pr-4">{shuffledQuiz.title}</h2>
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
						<span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold min-w-20 text-center">
							{currentIdx + 1} / {shuffledQuiz.questions.length}
						</span>
					</div>
				</header>

				<Progress value={progress} className="h-2 transition-all" />

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
											className="min-w-[3rem]"
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
							<CardTitle className="text-xl leading-relaxed text-slate-800 flex-1">{q.question}</CardTitle>
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
							{q.options.map((opt, i) => {
								const isSelected = answers[currentIdx] === i;
								const isCorrect = i === q.answer;
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
												<span className="inline-block w-8 h-8 rounded-full text-center leading-8 mr-3 transition-colors">
													{String.fromCharCode(65 + i) + "."}
												</span>
												{opt}
											</div>
										</Label>
									</div>
								);
							})}
						</RadioGroup>
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

						{currentIdx === shuffledQuiz.questions.length - 1 ? (
							<Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 shadow-lg px-8">
								Nộp bài <CheckCircle2 className="ml-2 h-4 w-4" />
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
