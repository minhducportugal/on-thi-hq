"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function QuizSelection() {
	const router = useRouter();
	const { quizzes, loading, error } = useQuizzes();
	const { user, loading: authLoading, signOut } = useAuth();

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	if (authLoading || loading) {
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
				<div className="text-red-500">Lỗi: {error.message}</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
			<div className="w-full max-w-2xl mb-4 flex justify-between items-center">
				<div className="flex items-center gap-2 text-sm text-slate-600">
					<User className="h-4 w-4" />
					{user ? (user.user_metadata ? user.user_metadata.name : user.email) : "Not logged in"}
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.push("/settings")}
						className="flex items-center gap-2"
					>
						<Settings className="h-4 w-4" />
						Cài đặt
					</Button>
					<Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center gap-2">
						<LogOut className="h-4 w-4" />
						Đăng xuất
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
				{quizzes.map((quiz) => (
					<Card
						key={quiz.id}
						className="hover:ring-2 hover:ring-primary cursor-pointer transition-all"
						onClick={() => router.push(`/quizz/${quiz.slug}`)}
					>
						<CardHeader>
							<CardTitle className="text-lg">{quiz.title}</CardTitle>
							<p className="text-sm text-muted-foreground">
								{quiz.total_questions} câu hỏi trắc nghiệm
							</p>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
