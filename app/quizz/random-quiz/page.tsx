"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Award, Trash2, CheckSquare, Square, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface QuizAttempt {
	id: string;
	score: number;
	total_questions: number;
	completed_at: string;
}

export default function RandomQuizHistory() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean;
		title: string;
		description: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		description: "",
		onConfirm: () => {},
	});

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	const fetchHistory = async () => {
		if (!user) {
			setLoading(false);
			setAttempts([]);
			return;
		}

		setLoading(true);

		// Get the "random-quiz" quiz id
		const { data: quiz } = await supabase
			.from('quizzes')
			.select('id')
			.eq('slug', 'random-quiz')
			.single();

		if (!quiz) {
			setLoading(false);
			setAttempts([]);
			return;
		}

		const { data } = await supabase
			.from('quiz_attempts')
			.select('id, score, total_questions, completed_at')
			.eq('user_id', user.id)
			.eq('quiz_id', quiz.id)
			.order('completed_at', { ascending: false });

		setAttempts(data || []);
		setLoading(false);
	};

	useEffect(() => {
		fetchHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const toggleSelectAttempt = (attemptId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedAttempts(prev => 
			prev.includes(attemptId) 
				? prev.filter(id => id !== attemptId)
				: [...prev, attemptId]
		);
	};

	const toggleSelectAll = () => {
		if (selectedAttempts.length === attempts.length) {
			setSelectedAttempts([]);
		} else {
			setSelectedAttempts(attempts.map(a => a.id));
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedAttempts.length === 0) return;

		const confirmMessage = selectedAttempts.length === 1
			? "Bạn có chắc muốn xóa lịch sử này?"
			: `Bạn có chắc muốn xóa ${selectedAttempts.length} lịch sử đã chọn?`;

		setDeleteDialog({
			open: true,
			title: "Xác nhận xóa",
			description: confirmMessage,
			onConfirm: async () => {
				try {
					const { error: answersError } = await supabase
						.from("user_answers")
						.delete()
						.in("attempt_id", selectedAttempts);

					if (answersError) throw answersError;

					const { error: attemptsError } = await supabase
						.from("quiz_attempts")
						.delete()
						.in("id", selectedAttempts);

					if (attemptsError) throw attemptsError;

					setSelectedAttempts([]);
					fetchHistory();
					toast.success("Đã xóa lịch sử thành công");
				} catch (error) {
					console.error("Error deleting attempts:", error);
					toast.error("Lỗi khi xóa lịch sử: " + (error as Error).message);
				}
				setDeleteDialog({ ...deleteDialog, open: false });
			},
		});
	};

	const handleDeleteAll = async () => {
		if (attempts.length === 0) return;

		setDeleteDialog({
			open: true,
			title: "Xóa tất cả lịch sử",
			description: `Bạn có chắc muốn xóa tất cả ${attempts.length} lịch sử? Hành động này không thể hoàn tác.`,
			onConfirm: async () => {
				const allAttemptIds = attempts.map(a => a.id);

				try {
					const { error: answersError } = await supabase
						.from("user_answers")
						.delete()
						.in("attempt_id", allAttemptIds);

					if (answersError) throw answersError;

					const { error: attemptsError } = await supabase
						.from("quiz_attempts")
						.delete()
						.in("id", allAttemptIds);

					if (attemptsError) throw attemptsError;

					setSelectedAttempts([]);
					fetchHistory();
					toast.success("Đã xóa tất cả lịch sử");
				} catch (error) {
					console.error("Error deleting all attempts:", error);
					toast.error("Lỗi khi xóa lịch sử: " + (error as Error).message);
				}
				setDeleteDialog({ ...deleteDialog, open: false });
			},
		});
	};

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

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
			<div className="w-full max-w-2xl space-y-4">
				<Button
					variant="ghost"
					onClick={() => router.push("/quizz")}
					className="flex items-center gap-2 mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại
				</Button>

				<Card>
					<CardHeader>
						<CardTitle>Đề thi ngẫu nhiên 60 câu</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							onClick={() => {
								sessionStorage.setItem('random_quiz_mode', '60');
								router.push(`/quizz/random-quiz/test`);
							}}
							className="w-full"
							size="lg"
						>
							Bắt đầu thi
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between max-sm:flex-col max-sm:gap-4">
							<div className="flex items-center gap-2">
								<History className="h-5 w-5" />
								<CardTitle className="text-lg">Lịch sử làm bài</CardTitle>
							</div>
							{attempts.length > 0 && (
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={toggleSelectAll}
										className="flex items-center gap-2"
									>
										{selectedAttempts.length === attempts.length ? (
											<CheckSquare className="h-4 w-4" />
										) : (
											<Square className="h-4 w-4" />
										)}
										{selectedAttempts.length === attempts.length ? "Bỏ chọn" : "Chọn tất cả"}
									</Button>
									{selectedAttempts.length > 0 && (
										<Button
											variant="destructive"
											size="sm"
											onClick={handleDeleteSelected}
											className="flex items-center gap-2"
										>
											<Trash2 className="h-4 w-4" />
											Xóa ({selectedAttempts.length})
										</Button>
									)}
									{selectedAttempts.length === 0 && (
										<Button
											variant="outline"
											size="sm"
											onClick={handleDeleteAll}
											className="flex items-center gap-2 text-red-600 hover:bg-red-50"
										>
											<Trash2 className="h-4 w-4" />
											Xóa tất cả
										</Button>
									)}
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
							</div>
						) : attempts.length > 0 ? (
							<div className="space-y-3">
								{attempts.map((attempt) => {
									const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
									const isSelected = selectedAttempts.includes(attempt.id);
									return (
										<div
											key={attempt.id}
											onClick={() =>
												router.push(
													`/quizz/random-quiz/review?attempt=${attempt.id}`
												)
											}
											className={`flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 transition cursor-pointer ${
												isSelected ? "bg-blue-50 ring-2 ring-blue-500" : "bg-slate-50"
											}`}
										>
											<div className="flex items-center gap-3">
												<div onClick={(e) => toggleSelectAttempt(attempt.id, e)}>
													{isSelected ? (
														<CheckSquare className="h-5 w-5 text-blue-600" />
													) : (
														<Square className="h-5 w-5 text-slate-400" />
													)}
												</div>
												<Award
													className={`h-5 w-5 ${
														percentage >= 80
															? "text-green-500"
															: percentage >= 50
															? "text-yellow-500"
															: "text-red-500"
													}`}
												/>
												<div>
													<p className="font-medium">
														{attempt.score}/{attempt.total_questions} câu đúng
													</p>
													<p className="text-xs text-slate-500">
														{new Date(attempt.completed_at).toLocaleString("vi-VN")}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div
													className={`text-lg font-bold ${
														percentage >= 80
															? "text-green-600"
															: percentage >= 50
															? "text-yellow-600"
															: "text-red-600"
													}`}
												>
													{percentage}%
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<Empty className="from-muted/50 to-background h-full bg-linear-to-b from-30%">
								<EmptyHeader>
									<EmptyDescription>Bạn chưa thực hiện bài thi nào!</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</CardContent>
				</Card>
			</div>
			
			<AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
						<AlertDialogDescription>{deleteDialog.description}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={deleteDialog.onConfirm} className="bg-red-600 hover:bg-red-700">
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
