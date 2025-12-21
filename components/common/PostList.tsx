import Loading from "@/app/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const PostList = ({ data, isLoading }: { data: { id: number; title: string; body: string }[]; isLoading: boolean }) => {
	if (isLoading) {
		return <Loading />;
	}
	return (
		<div>
			{data.map((post: { id: number; title: string; body: string }) => (
				<Card key={post.id}>
					<CardHeader>
						<CardTitle>{post.title}</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>{post.body}</CardDescription>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default PostList;
