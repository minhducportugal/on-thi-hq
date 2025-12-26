"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function RandomQuizResult() {
	const router = useRouter();

	const [score, setScore] = useState(0);
	const [total, setTotal] = useState(0);
	const [quizTitle, setQuizTitle] = useState("");

	useEffect(() => {
		// Load data from sessionStorage
		const answersData = sessionStorage.getItem(`quiz_random_answers`);
		const quizData = sessionStorage.getItem(`quiz_random_shuffled`);

		if (!answersData || !quizData) {
			router.push("/quizz");
			return;
		}

		try {
			const answers: Record<number, number> = JSON.parse(answersData);
			const shuffledQuestions = JSON.parse(quizData);

			if (!Array.isArray(shuffledQuestions) || shuffledQuestions.length === 0) {
				router.push("/quizz");
				return;
			}

			const calculatedScore = shuffledQuestions.reduce(
				(acc: number, q: { correct_option: number }, idx: number) => acc + (answers[idx] === q.correct_option ? 1 : 0),
				0
			);

			setScore(calculatedScore);
			setTotal(shuffledQuestions.length);
			
			const titleData = sessionStorage.getItem(`quiz_random_title`);
			setQuizTitle(titleData || "Đề thi ngẫu nhiên");
		} catch (error) {
			console.error("Error loading quiz result:", error);
			router.push("/quizz");
		}
	}, [router]);

	const handleReview = () => {
		router.push(`/quizz/random-quiz/review`);
	};

	const handleRetry = () => {
		sessionStorage.removeItem(`quiz_random_answers`);
		sessionStorage.removeItem(`quiz_random_shuffled`);
		sessionStorage.setItem('random_quiz_mode', '60');
		router.push(`/quizz/random-quiz/test`);
	};

	const handleHome = () => {
		sessionStorage.removeItem(`quiz_random_answers`);
		sessionStorage.removeItem(`quiz_random_shuffled`);
		sessionStorage.removeItem(`quiz_random_title`);
		router.push("/quizz");
	};

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
								{score}/{total}
							</span>
						</div>
					</div>
					<p className="text-center text-muted-foreground font-medium">
						Bạn đã hoàn thành {quizTitle}
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-3">
					<Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleReview}>
						<AlertCircle className="mr-2 h-4 w-4" /> Xem lại các câu sai
					</Button>
					<div className="flex gap-2 w-full">
						<Button variant="outline" className="flex-1" onClick={handleRetry}>
							Làm lại
						</Button>
						<Button variant="ghost" className="flex-1" onClick={handleHome}>
							Trang chủ
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
