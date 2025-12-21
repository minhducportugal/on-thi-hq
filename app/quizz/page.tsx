"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { QUIZZES } from "@/lib/quizData";

export default function QuizSelection() {
	const router = useRouter();

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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
				{Object.entries(QUIZZES).map(([key, quiz]) => (
					<Card
						key={key}
						className="hover:ring-2 hover:ring-primary cursor-pointer transition-all"
						onClick={() => router.push(`/quizz/${key}`)}
					>
						<CardHeader>
							<CardTitle className="text-lg">{quiz.title}</CardTitle>
							<p className="text-sm text-muted-foreground">{quiz.questions.length} câu hỏi trắc nghiệm</p>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
