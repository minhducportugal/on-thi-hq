"use client";

import QuizApp from "./quizz/page";

// import { useQuery } from "@tanstack/react-query";

// import Loading from "./loading";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useState } from "react";
// import { useDebounce } from "@/hooks/useDebounce";
// import PostList from "@/components/common/PostList";

// const Homepage = () => {
// 	const [searchId, setSearchId] = useState<string>("");
// 	const debouncedSearchTerm = useDebounce(searchId, 500);
// 	const { isPending, error, data, isFetching, refetch } = useQuery({
// 		queryKey: ["post", debouncedSearchTerm],
// 		queryFn: async () => {
// 			if (!debouncedSearchTerm) {
// 				const response = await fetch("https://jsonplaceholder.typicode.com/posts");
// 				return await response.json();
// 			}
// 			const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${debouncedSearchTerm}`);
// 			const data = await response.json();
// 			return [data];
// 		},
// 	});

// 	if (error) return "An error has occurred: " + error.message;

// 	return (
// 		<div className="m-4">
// 			<div className="grid w-full max-w-sm items-center gap-3 mb-4">
// 				<Label htmlFor="picture">Post Id: </Label>
// 				<div className="flex gap-1">
// 					<Input
// 						id="picture"
// 						type="text"
// 						value={searchId}
// 						onChange={(e) => setSearchId(e.target.value)}
// 					/>
// 				</div>
// 			</div>
// 			<PostList data={data} isLoading={isFetching} />
// 		</div>
// 	);
// };

// export default Homepage;

export default function Page() {
	return <QuizApp />;
}
