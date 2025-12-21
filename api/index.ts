import axios from "axios";
const url = 'https://jsonplaceholder.typicode.com/posts'
export const fetchPosts = () => axios.get(url);
export const fetchPost = (id: number) => axios.get(`${url}/${id}`);