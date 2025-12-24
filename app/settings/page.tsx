"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ChevronDown, ChevronUp, Eye, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useQuiz";

export default function SettingsPage() {
	const router = useRouter();
	const { settings, loading, saveSettings, saving } = useSettings();
	const [showAnswerMode, setShowAnswerMode] = useState<"instant" | "end">("end");
	const [timerEnabled, setTimerEnabled] = useState(false);
	const [timerMinutes, setTimerMinutes] = useState(30);
	const [saved, setSaved] = useState(false);
	const [expandedSection, setExpandedSection] = useState<string | null>("display");

	useEffect(() => {
		if (settings) {
			setShowAnswerMode(settings.show_answer_mode);
			setTimerEnabled(settings.timer_enabled);
			setTimerMinutes(settings.timer_minutes);
		}
	}, [settings]);

	const handleSave = async () => {
		// Save to database and localStorage
		await saveSettings({
			show_answer_mode: showAnswerMode,
			timer_enabled: timerEnabled,
			timer_minutes: timerMinutes,
		});
		
		setSaved(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		router.push("/quizz");
	};

	const toggleSection = (section: string) => {
		setExpandedSection(expandedSection === section ? null : section);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
			<div className="w-full max-w-2xl">
				<Button variant="outline" onClick={() => router.push("/quizz")} className="mb-6">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>

				<h1 className="text-3xl font-bold mb-8 text-slate-800">Cài đặt</h1>

				<div className="space-y-4">
					{/* Display Settings Section */}
					<Card className="shadow-lg overflow-hidden">
						<CardHeader
							className="cursor-pointer hover:bg-slate-50 transition-colors"
							onClick={() => toggleSection("display")}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Eye className="h-5 w-5 text-primary" />
									<CardTitle className="text-xl">Tùy chọn hiển thị</CardTitle>
								</div>
								{expandedSection === "display" ? (
									<ChevronUp className="h-5 w-5 text-slate-500" />
								) : (
									<ChevronDown className="h-5 w-5 text-slate-500" />
								)}
							</div>
						</CardHeader>
						{expandedSection === "display" && (
							<CardContent className="space-y-6">
								<div>
									<Label className="text-base font-semibold mb-4 block">Chế độ hiển thị đáp án</Label>
									<RadioGroup
										value={showAnswerMode}
										onValueChange={(val) => setShowAnswerMode(val as "instant" | "end")}
										className="space-y-3"
									>
										<div
											className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
												showAnswerMode === "end"
													? "border-primary bg-primary/5"
													: "border-slate-200 hover:border-slate-300"
											}`}
											onClick={() => setShowAnswerMode("end")}
										>
											<RadioGroupItem value="end" id="end" className="mt-1" />
											<Label htmlFor="end" className="flex-1 cursor-pointer">
												<div className="font-semibold text-base mb-1">
													Hiển thị đáp án sau khi hoàn thành
												</div>
												<div className="text-sm text-muted-foreground">
													Chỉ xem kết quả và đáp án đúng/sai sau khi làm xong toàn bộ bài thi. Phù hợp
													cho việc tự kiểm tra năng lực.
												</div>
											</Label>
										</div>

										<div
											className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
												showAnswerMode === "instant"
													? "border-primary bg-primary/5"
													: "border-slate-200 hover:border-slate-300"
											}`}
											onClick={() => setShowAnswerMode("instant")}
										>
											<RadioGroupItem value="instant" id="instant" className="mt-1" />
											<Label htmlFor="instant" className="flex-1 cursor-pointer">
												<div className="font-semibold text-base mb-1">Hiển thị đáp án ngay lập tức</div>
												<div className="text-sm text-muted-foreground">
													Hiển thị đúng/sai ngay sau khi chọn đáp án. Phù hợp cho việc học và ghi nhớ
													kiến thức.
												</div>
											</Label>
										</div>
									</RadioGroup>
								</div>
							</CardContent>
						)}
					</Card>

					{/* Timer Settings Section */}
					<Card className="shadow-lg overflow-hidden">
						<CardHeader
							className="cursor-pointer hover:bg-slate-50 transition-colors"
							onClick={() => toggleSection("timer")}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Clock className="h-5 w-5 text-primary" />
									<CardTitle className="text-xl">Hẹn giờ làm bài</CardTitle>
								</div>
								{expandedSection === "timer" ? (
									<ChevronUp className="h-5 w-5 text-slate-500" />
								) : (
									<ChevronDown className="h-5 w-5 text-slate-500" />
								)}
							</div>
						</CardHeader>
						{expandedSection === "timer" && (
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-200">
									<div className="flex-1">
										<div className="font-semibold text-base mb-1">Bật hẹn giờ</div>
										<div className="text-sm text-muted-foreground">
											Giới hạn thời gian làm bài để tạo áp lực thi thật
										</div>
									</div>
									<Button
										variant={timerEnabled ? "default" : "outline"}
										size="sm"
										onClick={() => setTimerEnabled(!timerEnabled)}
									>
										{timerEnabled ? "Bật" : "Tắt"}
									</Button>
								</div>

								{timerEnabled && (
									<div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
										<Label className="text-sm font-medium mb-3 block">Thời gian (phút)</Label>
										<div className="flex gap-2 flex-wrap">
											{[15, 30, 45, 60, 90, 120].map((minutes) => (
												<Button
													key={minutes}
													variant={timerMinutes === minutes ? "default" : "outline"}
													size="sm"
													onClick={() => setTimerMinutes(minutes)}
												>
													{minutes} phút
												</Button>
											))}
										</div>
									</div>
								)}
							</CardContent>
						)}
					</Card>

					{/* Save Button */}
					<Card className="shadow-lg">
						<CardContent className="pt-6">
							<Button 
								onClick={handleSave} 
								className="w-full" 
								size="lg"
								disabled={saving || loading}
							>
								<Save className="mr-2 h-4 w-4" />
								{saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu cài đặt"}
							</Button>
							{saved && (
								<p className="text-center text-sm text-green-600 mt-2">
									✓ Cài đặt đã được lưu thành công
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
					<p className="text-sm text-blue-800">
						<strong>Lưu ý:</strong> Cài đặt của bạn sẽ được lưu trữ trên thiết bị này và tự động áp
						dụng cho các lần làm bài tiếp theo.
					</p>
				</div>
			</div>
		</div>
	);
}
