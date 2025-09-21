import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Movies API endpoints
export const moviesAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  getShowtimes: (movieId, date) => api.get(`/movies/${movieId}/showtimes`, { params: { date } }),
  getSeats: (movieId, showtimeId) => api.get(`/movies/${movieId}/showtimes/${showtimeId}/seats`),
  searchMovies: (query) => api.get('/movies/search', { params: { q: query } }),
};

// Sports API endpoints
export const sportsAPI = {
  getAll: (params) => api.get('/sports', { params }),
  getById: (id) => api.get(`/sports/${id}`),
  getVenues: (eventId) => api.get(`/sports/${eventId}/venues`),
  getSeats: (eventId, venueId) => api.get(`/sports/${eventId}/venues/${venueId}/seats`),
  searchEvents: (query) => api.get('/sports/search', { params: { q: query } }),
};

// Buses API endpoints
export const busesAPI = {
  search: (params) => api.get('/buses/search', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  getSeats: (busId, date) => api.get(`/buses/${busId}/seats`, { params: { date } }),
  getRoutes: () => api.get('/buses/routes'),
};

// Bookings API endpoints
export const bookingsAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getById: (id) => api.get(`/bookings/${id}`),
  getUserBookings: (userId) => api.get(`/bookings/user/${userId}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// Payment API endpoints
export const paymentsAPI = {
  createOrder: (amount, currency = 'INR') => api.post('/payments/create-order', { amount, currency }),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  getPaymentHistory: (userId) => api.get(`/payments/history/${userId}`),
};

// User API endpoints
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, userData) => api.put(`/users/${id}`, userData),
  changePassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;