import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: false,
});

export async function login(email: string, password: string) {
  const { data } = await api.post('/login', { email, password });
  localStorage.setItem('token', data.token);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return data.user;
}

export async function getUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  try {
    const { data } = await api.get('/user');
    return data;
  } catch {
    return null;
  }
}

export async function logout() {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await api.post('/logout');
    localStorage.removeItem('token');
  }
}
