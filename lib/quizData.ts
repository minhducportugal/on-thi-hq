export interface Question {
	id: number;
	question: string;
	options: string[];
	answer: number;
	explanation?: string;
}

export interface QuizData {
	title: string;
	questions: Question[];
}

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
