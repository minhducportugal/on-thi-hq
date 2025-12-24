import { call, put, takeLatest } from "redux-saga/effects";
import { fetchPost, fetchPosts } from "@/api";
import {
	fetchPostsFailure,
	fetchPostsSuccess,
	fetchPostsRequest,
	fetchPostFailure,
	fetchPostRequest,
	fetchPostSuccess,
} from "../slices/postSlice";
import { PayloadAction } from "@reduxjs/toolkit/react";

interface Post {
	userId: number;
	id: number;
	title: string;
	body: string;
}

function* handleFetchPosts() {
	try {
		const response: { data: Post[] } = yield call(fetchPosts);
		yield put(fetchPostsSuccess(response.data));
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		yield put(fetchPostsFailure(message));
	}
}

function* handleFetchPost(action: PayloadAction<number>) {
	try {
		const response: { data: Post } = yield call(fetchPost, action.payload);
		yield put(fetchPostSuccess(response.data));
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		yield put(fetchPostFailure(message));
	}
}

export function* watchPostSaga() {
	yield takeLatest(fetchPostRequest.type, handleFetchPost);
	yield takeLatest(fetchPostsRequest.type, handleFetchPosts);
}
