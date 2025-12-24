"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Award, Clock, TrendingUp } from "lucide-react";

export default function HomePage() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
			<div className="container mx-auto px-4 py-16">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<div className="inline-block mb-6">
						<div className="bg-primary/10 p-4 rounded-full">
							<BookOpen className="h-16 w-16 text-primary" />
						</div>
					</div>
					<div className="text-5xl font-black mb-4 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent p-2">
						Hệ Thống Ôn Thi Hải Quan
					</div>
					<p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
						Nền tảng luyện thi trắc nghiệm chuyên nghiệp dành cho công chức hải quan
					</p>
					<Button
						onClick={() => router.push("/quizz")}
						size="lg"
						className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
					>
						Bắt đầu ôn thi
					</Button>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
					<Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
						<CardContent className="p-6 text-center">
							<div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
								<BookOpen className="h-7 w-7 text-blue-600" />
							</div>
							<h3 className="font-bold text-lg mb-2">Ngân hàng câu hỏi</h3>
							<p className="text-slate-600 text-sm">
								Hàng trăm câu hỏi từ các văn bản pháp luật hải quan
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
						<CardContent className="p-6 text-center">
							<div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
								<Award className="h-7 w-7 text-green-600" />
							</div>
							<h3 className="font-bold text-lg mb-2">Chấm điểm tự động</h3>
							<p className="text-slate-600 text-sm">
								Kiểm tra kết quả ngay lập tức và xem đáp án chi tiết
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
						<CardContent className="p-6 text-center">
							<div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
								<Clock className="h-7 w-7 text-amber-600" />
							</div>
							<h3 className="font-bold text-lg mb-2">Tính giờ làm bài</h3>
							<p className="text-slate-600 text-sm">
								Rèn luyện khả năng quản lý thời gian hiệu quả
							</p>
						</CardContent>
					</Card>

					<Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
						<CardContent className="p-6 text-center">
							<div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
								<TrendingUp className="h-7 w-7 text-purple-600" />
							</div>
							<h3 className="font-bold text-lg mb-2">Theo dõi tiến độ</h3>
							<p className="text-slate-600 text-sm">
								Xem lại đáp án sai và cải thiện kết quả
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
