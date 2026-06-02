import axios from 'axios';

const API_BASE_URL = 'https://catelog.itsanish.in//api';

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

export const getAllQuotes = () => API.get('/quotes');
export const getQuoteById = (id: string) => API.get(`/quotes/${id}`);
export const createQuote = (data: Omit<iQuote, '_id' | 'shareToken'>) => API.post('/quotes', data);
export const updateQuote = (id: string, data: iQuote) => API.put(`/quotes/${id}`, data);
export const deleteQuote = (id: string) => API.delete(`/quotes/${id}`);

export const getAllProducts = () => API.get('/products');
export const createProduct = (data: Omit<iProduct, '_id'>) => API.post('/products', data);
export const updateProduct = (id: string, data: iProduct) => API.put(`/products/${id}`, data);
export const deleteProduct = (id: string) => API.delete(`/products/${id}`);

export const getAllFeatures = () => API.get('/features');
export const createFeature = (data: { name: string; description: string }) => API.post('/features/add', data);
export const updateFeature = (id: string, data: iFeature) => API.put(`/features/${id}`, data);
export const deleteFeature = (id: string) => API.delete(`/features/${id}`);

export default API;