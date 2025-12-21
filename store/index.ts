import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
// import logger from './logs/logger'
import rootSaga from "./sagas";
import rootReducer from "./rootReducer";

// 1. Tạo Saga Middleware
const sagaMiddleware = createSagaMiddleware();

// 2. Cấu hình Store với Saga Middleware
const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});
// 3. Chạy Saga
sagaMiddleware.run(rootSaga);

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
