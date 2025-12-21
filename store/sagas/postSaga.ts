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

function* handleFetchPosts(): Generator<any, void, any> {
	try {
		const response = yield call(fetchPosts);
		yield put(fetchPostsSuccess(response.data));
	} catch (error: any) {
		yield put(fetchPostsFailure(error.message));
	}
}

function* handleFetchPost(action: PayloadAction<number>): Generator<any, void, any> {
	try {
		const response = yield call(fetchPost, action.payload);
		yield put(fetchPostSuccess(response.data));
	} catch (error: any) {
		yield put(fetchPostFailure(error.message));
	}
}

export function* watchPostSaga() {
	yield takeLatest(fetchPostRequest.type, handleFetchPost);
	yield takeLatest(fetchPostsRequest.type, handleFetchPosts);
}
