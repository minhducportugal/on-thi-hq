"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/reduxHook";
import { fetchPostsRequest } from "@/store/slices/postSlice";
const ReduxPage = () => {
	const dispatch = useAppDispatch();
	const { posts, loading, error } = useAppSelector((state) => state.post);
	useEffect(() => {
		dispatch(fetchPostsRequest());
	}, [dispatch]);
	if (loading) {
		return <div>Loading...</div>;
	}
	if (error) {
		return <div>Error: {error}</div>;
	}
	return (
		<div>
			{posts &&
				posts.map((post) => (
					<Card key={post.id}>
						<CardHeader>
							<CardTitle>{post.title}</CardTitle>
							<CardDescription>{post.body}</CardDescription>
						</CardHeader>
						<CardContent>
							<p>User ID: {post.userId}</p>
						</CardContent>
					</Card>
				))}
		</div>
	);
};

export default ReduxPage;
