import { combineReducers } from "redux";
import postReducer from "./slices/postSlice";
const rootReducer = combineReducers({
	post: postReducer,
});

export default rootReducer;
