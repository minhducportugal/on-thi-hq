"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Home, XCircle, AlertCircle, Settings } from "lucide-react";

// Assuming these are separate JSON files
import luatHQ from "@/data/luat_hai_quan_2014.json";
import quyetDinh819 from "@/data/quyet_dinh_819.json";

interface Question {
	id: number;
	question: string;
	options: string[];
	answer: number;
}

interface QuizData {
	title: string;
	questions: Question[];
}

const QUIZZES: Record<string, QuizData> = {
	luat_hq: luatHQ,
	qd_819: quyetDinh819,
};

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function shuffleQuiz(quiz: QuizData): QuizData {
	const shuffledQuestions = shuffleArray(quiz.questions).map((q) => {
		const indexMapping = q.options.map((_, i) => i);
		const shuffledMapping = shuffleArray(indexMapping);

		const shuffledOptions = shuffledMapping.map((i) => q.options[i]);

		const newAnswerIndex = shuffledMapping.indexOf(q.answer);

		return {
			...q,
			options: shuffledOptions,
			answer: newAnswerIndex,
		};
	});

	return {
		...quiz,
		questions: shuffledQuestions,
	};
}

export default function QuizApp() {
	const router = useRouter();
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [isFinished, setIsFinished] = useState(false);
	const [isReviewMode, setIsReviewMode] = useState(false);
	const [shuffledQuiz, setShuffledQuiz] = useState<QuizData | null>(null);
	const [showAnswerMode, setShowAnswerMode] = useState<"instant" | "end">("end");

	useEffect(() => {
		// Load settings from localStorage
		const savedMode = localStorage.getItem("quiz_showAnswerMode");
		if (savedMode === "instant" || savedMode === "end") {
			setShowAnswerMode(savedMode);
		}
	}, []);

	const currentQuiz = shuffledQuiz;
	const progress = currentQuiz ? ((currentIdx + 1) / currentQuiz.questions.length) * 100 : 0;

	const startQuiz = (key: string) => {
		setSelectedKey(key);
		const originalQuiz = QUIZZES[key];
		setShuffledQuiz(shuffleQuiz(originalQuiz));
		setCurrentIdx(0);
		setAnswers({});
		setIsFinished(false);
		setIsReviewMode(false);
	};

	const score = currentQuiz?.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0), 0) || 0;

	// 1. Selection Screen
	if (!selectedKey) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
				<div className="w-full max-w-2xl mb-4 flex justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/settings")}
						className="flex items-center gap-2"
					>
						<Settings className="h-4 w-4" />
						Cài đặt
					</Button>
				</div>

				<h1 className="text-3xl font-bold mb-8 text-slate-800">Hệ Thống Ôn Thi Hải Quan</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
					{Object.entries(QUIZZES).map(([key, quiz]) => (
						<Card
							key={key}
							className="hover:ring-2 hover:ring-primary cursor-pointer transition-all"
							onClick={() => startQuiz(key)}
						>
							<CardHeader>
								<CardTitle className="text-lg">{quiz.title}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{quiz.questions.length} câu hỏi trắc nghiệm{" "}
								</p>
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// 2. Review Mode UI
	if (isReviewMode && currentQuiz) {
		return (
			<div className="min-h-screen bg-slate-50 p-4 md:p-8">
				<div className="max-w-3xl mx-auto space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-bold">Xem lại đáp án</h2>
						<Button onClick={() => setSelectedKey(null)} variant="outline">
							<Home className="mr-2 h-4" /> Trang chủ
						</Button>
					</div>

					<ScrollArea className="h-[70vh] rounded-md border p-4 bg-white">
						{currentQuiz.questions.map((q, idx) => {
							const isCorrect = answers[idx] === q.answer;
							return (
								<div key={idx} className="mb-8 p-4 border-b last:border-0">
									<div className="flex items-start gap-3 mb-3">
										{isCorrect ? (
											<CheckCircle2 className="text-green-500 mt-1" />
										) : (
											<XCircle className="text-red-500 mt-1" />
										)}
										<p className="font-medium">
											Câu {idx + 1}: {q.question}
										</p>
									</div>
									<div className="ml-9 space-y-2">
										{q.options.map((opt, i) => (
											<div
												key={i}
												className={`text-sm p-2 rounded ${
													i === q.answer
														? "bg-green-100 border-green-200 border text-green-800"
														: i === answers[idx] && !isCorrect
														? "bg-red-100 border-red-200 border text-red-800"
														: "text-slate-600"
												}`}
											>
												{String.fromCharCode(65 + i)}. {opt}
												{i === q.answer && (
													<span className="ml-2 font-bold">(Đáp án đúng)</span>
												)}
											</div>
										))}
									</div>
								</div>
							);
						})}
					</ScrollArea>

					<Button className="w-full py-6 text-lg" onClick={() => startQuiz(selectedKey)}>
						<RotateCcw className="mr-2" /> Thử sức lại
					</Button>
				</div>
			</div>
		);
	}

	// 3. Score Summary Screen
	if (isFinished && currentQuiz) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4 bg-slate-50">
				<Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary">
					<CardHeader className="text-center">
						<CardTitle className="text-3xl font-black">KẾT QUẢ</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex justify-center">
							<div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-slate-100">
								<span className="text-4xl font-bold">
									{score}/{currentQuiz.questions.length}
								</span>
							</div>
						</div>
						<p className="text-center text-muted-foreground font-medium">
							Bạn đã hoàn thành bài thi Luật Hải quan 2014 [cite: 313]
						</p>
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsReviewMode(true)}>
							<AlertCircle className="mr-2 h-4 w-4" /> Xem lại các câu sai
						</Button>
						<div className="flex gap-2 w-full">
							<Button variant="outline" className="flex-1" onClick={() => startQuiz(selectedKey)}>
								Làm lại
							</Button>
							<Button variant="ghost" className="flex-1" onClick={() => setSelectedKey(null)}>
								Trang chủ
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>
		);
	}

	// 4. Quiz Main Screen
	const q = currentQuiz!.questions[currentIdx];

	return (
		<div className="min-h-screen bg-slate-50 p-4 md:p-8">
			<div className="max-w-3xl mx-auto space-y-6">
				<header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
					<h2 className="font-bold text-lg truncate pr-4">{currentQuiz!.title}</h2>
					<span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-bold min-w-20 text-center">
						{currentIdx + 1} / {currentQuiz!.questions.length}
					</span>
				</header>

				<Progress value={progress} className="h-2 transition-all" />

				<Card className="shadow-xl min-h-[400px] flex flex-col">
					<CardHeader>
						<CardTitle className="text-xl leading-relaxed text-slate-800">{q.question}</CardTitle>
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
									}
									else if (isSelected && !isCorrect) {
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

						{currentIdx === currentQuiz!.questions.length - 1 ? (
							<Button
								onClick={() => setIsFinished(true)}
								className="bg-green-600 hover:bg-green-700 shadow-lg px-8"
							>
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
