"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";
import { QuizData } from "@/lib/quizData";

export default function QuizReview() {
	const router = useRouter();
	const params = useParams();
	const slug = params.slug as string;

	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [quiz, setQuiz] = useState<QuizData | null>(null);

	useEffect(() => {
		// Load data from sessionStorage
		const answersData = sessionStorage.getItem(`quiz_${slug}_answers`);
		const quizData = sessionStorage.getItem(`quiz_${slug}_shuffled`);

		if (!answersData || !quizData) {
			router.push("/quizz");
			return;
		}

		setAnswers(JSON.parse(answersData));
		setQuiz(JSON.parse(quizData));
	}, [slug, router]);

	const handleRetry = () => {
		sessionStorage.removeItem(`quiz_${slug}_answers`);
		sessionStorage.removeItem(`quiz_${slug}_shuffled`);
		router.push(`/quizz/${slug}`);
	};

	const handleHome = () => {
		sessionStorage.removeItem(`quiz_${slug}_answers`);
		sessionStorage.removeItem(`quiz_${slug}_shuffled`);
		router.push("/quizz");
	};

	if (!quiz) {
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
					<h2 className="text-2xl font-bold">Xem lại đáp án</h2>
					<Button onClick={handleHome} variant="outline">
						<Home className="mr-2 h-4" /> Trang chủ
					</Button>
				</div>

				<ScrollArea className="h-[70vh] rounded-md border p-4 bg-white">
					{quiz.questions.map((q, idx) => {
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
											{i === q.answer && <span className="ml-2 font-bold">(Đáp án đúng)</span>}
										</div>
									))}
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
