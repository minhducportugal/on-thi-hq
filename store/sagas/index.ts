import { all } from "redux-saga/effects";
import { watchPostSaga } from "./postSaga";

function* rootSaga() {
	yield all([watchPostSaga()]);
}

export default rootSaga;
