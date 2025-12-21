import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Post {
	userId: number;
	id: number;
	title: string;
	body: string;
}

interface PostState {
	posts: Post[];
	post: Post | null;
	loading: boolean;
	error: string | null;
}

const initialState: PostState = {
	posts: [],
	post: null,
	loading: false,
	error: null,
};

const postSlice = createSlice({
	name: "post",
	initialState,
	reducers: {
		// Action để kích hoạt Saga (trigger)
		fetchPostsRequest: (state) => {
			state.loading = true;
			state.error = null;
		},
		// Action để Saga cập nhật state thành công
		fetchPostsSuccess: (state, action: PayloadAction<Post[]>) => {
			state.loading = false;
			state.posts = action.payload;
		},
		// Action để Saga cập nhật state thất bại
		fetchPostsFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
		fetchPostRequest: (state, action: PayloadAction<number>) => {
			state.loading = true;
			state.error = null;
		},
		fetchPostSuccess: (state, action: PayloadAction<Post>) => {
			state.loading = false;
			state.post = action.payload;
		},
		fetchPostFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
	},
});

export const {
	fetchPostsRequest,
	fetchPostsSuccess,
	fetchPostsFailure,
	fetchPostRequest,
	fetchPostSuccess,
	fetchPostFailure,
} = postSlice.actions;
export default postSlice.reducer;
