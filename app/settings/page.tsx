"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
	const router = useRouter();
	const [showAnswerMode, setShowAnswerMode] = useState<'instant' | 'end'>('end');
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		// Load settings from localStorage
		const savedMode = localStorage.getItem('quiz_showAnswerMode');
		if (savedMode === 'instant' || savedMode === 'end') {
			setShowAnswerMode(savedMode);
		}
	}, []);

	const handleSave = async () => {
		localStorage.setItem('quiz_showAnswerMode', showAnswerMode);
		setSaved(true);
		await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/'); 
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
			<div className="w-full max-w-2xl">
				<Button
					variant="outline"
					onClick={() => router.push('/quizz')}
					className="mb-6"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>

				<h1 className="text-3xl font-bold mb-8 text-slate-800">Cài đặt</h1>

				<Card className="shadow-lg">
					<CardHeader>
						<CardTitle className="text-xl">Tùy chọn hiển thị</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<Label className="text-base font-semibold mb-4 block">
								Chế độ hiển thị đáp án
							</Label>
							<RadioGroup
								value={showAnswerMode}
								onValueChange={(val) => setShowAnswerMode(val as 'instant' | 'end')}
								className="space-y-3"
							>
								<div
									className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
										showAnswerMode === 'end'
											? 'border-primary bg-primary/5'
											: 'border-slate-200 hover:border-slate-300'
									}`}
									onClick={() => setShowAnswerMode('end')}
								>
									<RadioGroupItem value="end" id="end" className="mt-1" />
									<Label htmlFor="end" className="flex-1 cursor-pointer">
										<div className="font-semibold text-base mb-1">
											Hiển thị đáp án sau khi hoàn thành
										</div>
										<div className="text-sm text-muted-foreground">
											Chỉ xem kết quả và đáp án đúng/sai sau khi làm xong toàn bộ bài thi.
											Phù hợp cho việc tự kiểm tra năng lực.
										</div>
									</Label>
								</div>

								<div
									className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
										showAnswerMode === 'instant'
											? 'border-primary bg-primary/5'
											: 'border-slate-200 hover:border-slate-300'
									}`}
									onClick={() => setShowAnswerMode('instant')}
								>
									<RadioGroupItem value="instant" id="instant" className="mt-1" />
									<Label htmlFor="instant" className="flex-1 cursor-pointer">
										<div className="font-semibold text-base mb-1">
											Hiển thị đáp án ngay lập tức
										</div>
										<div className="text-sm text-muted-foreground">
											Hiển thị đúng/sai ngay sau khi chọn đáp án. Phù hợp cho việc học và
											ghi nhớ kiến thức.
										</div>
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="pt-4 border-t">
							<Button
								onClick={handleSave}
								className="w-full"
								size="lg"
							>
								<Save className="mr-2 h-4 w-4" />
								{saved ? 'Đã lưu!' : 'Lưu cài đặt'}
							</Button>
							{saved && (
								<p className="text-center text-sm text-green-600 mt-2">
									✓ Cài đặt đã được lưu thành công
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
					<p className="text-sm text-blue-800">
						<strong>Lưu ý:</strong> Cài đặt của bạn sẽ được lưu trữ trên thiết bị này và
						tự động áp dụng cho các lần làm bài tiếp theo.
					</p>
				</div>
			</div>
		</div>
	);
}
