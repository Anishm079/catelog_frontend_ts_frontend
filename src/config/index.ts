import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const verifyAuthToken = () => API.get('/auth/verify');
export const loginUser = (email: string, password: string) => API.post('/auth/login', { email, password });
export const logoutUser = () => API.post('/auth/logout');
export const fetchUserDetails = () => API.get('/user/details');
export const fetchQuotes = () => API.get('/quotes');
export const fetchProducts = () => API.get('/products');

export const getAllFeatures = () => API.get('/features');
export const createFeature = (data: { name: string; description: string }) => API.post('/features', data);
export const updateFeature = (id: string, data: iFeature) => API.put(`/features/${id}`, data);
export const deleteFeature = (id: string) => API.delete(`/features/${id}`);

export default API;