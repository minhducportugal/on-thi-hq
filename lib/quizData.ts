import luatHQ from "@/data/luat_hai_quan_2014.json";
import quyetDinh819 from "@/data/quyet_dinh_819.json";
import testQuiz from "@/data/test.json";

export interface Question {
	id: number;
	question: string;
	options: string[];
	answer: number;
}

export interface QuizData {
	title: string;
	questions: Question[];
}

export const QUIZZES: Record<string, QuizData> = {
	luat_hq: luatHQ,
	qd_819: quyetDinh819,
	test: testQuiz,
};

export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function shuffleQuiz(quiz: QuizData): QuizData {
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
