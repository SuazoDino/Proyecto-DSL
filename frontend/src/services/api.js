import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('codelab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data);

export const logout = () =>
  api.post('/auth/logout').then(r => r.data);

export const getMe = () =>
  api.get('/auth/me').then(r => r.data);

export const getSchema = () =>
  api.get('/query/schema').then(r => r.data);

export const getCategories = () =>
  api.get('/query/categories').then(r => r.data);

export const validateQuery = (sql) =>
  api.post('/query/validate', { sql }).then(r => r.data);

export const executeQuery = (sql) =>
  api.post('/query/execute', { sql }).then(r => r.data);

export const buildQuery = (descriptor) =>
  api.post('/query/build', descriptor).then(r => r.data);

export const getStats = () =>
  api.get('/query/stats').then(r => r.data);

export const addProduct = (data) =>
  api.post('/products', data).then(r => r.data);

export default api;
