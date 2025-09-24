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
    
    // Handle backend validation errors
    if (error.response?.status === 400 && error.response?.data?.errors) {
      // Convert backend validation errors to a more readable format
      const errors = error.response.data.errors;
      const errorMessage = Object.values(errors).join(', ');
      error.message = errorMessage;
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (otpData) => api.post('/auth/verify-otp', otpData),
  resendOtp: (emailData) => api.post('/auth/resend-otp', emailData),
  forgotPassword: (emailData) => api.post('/auth/forgot-password', emailData),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  validateOtp: (otpData) => api.post('/auth/validate-otp', otpData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
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
  // User endpoints
  search: (params) => api.get('/buses/search', { params }),
  searchBuses: (params) => api.get('/buses/search', { params }), // Alias for compatibility
  searchAdvanced: (params) => api.get('/buses/search/advanced', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  getAvailable: () => api.get('/buses/available'),
  getAvailableBuses: () => api.get('/buses/available'), // Alias for compatibility
  getRoutes: () => api.get('/buses/routes'),
  getOperators: () => api.get('/buses/operators'),
  getPopularRoutes: () => api.get('/buses/routes/popular'),
  checkSeatAvailability: (busId, requestedSeats) => api.get(`/buses/${busId}/availability`, { params: { requestedSeats } }),
  
  // Admin endpoints
  addBus: (busData) => api.post('/buses/admin', busData),
  updateBus: (id, busData) => api.put(`/buses/admin/${id}`, busData),
  deleteBus: (id) => api.delete(`/buses/admin/${id}`),
  getAllBuses: () => api.get('/buses/admin'),
  updateBusStatus: (id, status) => api.put(`/buses/admin/${id}/status`, null, { params: { status } }),
  getBusStatistics: () => api.get('/buses/admin/statistics'),
  
  // Test endpoint
  test: () => api.get('/buses/test'),
};

// Bus Bookings API endpoints
export const busBookingsAPI = {
  // User endpoints
  bookBus: (bookingData) => api.post('/bus-bookings/book', bookingData),
  getUserBookings: () => api.get('/bus-bookings/my-bookings'),
  getUserActiveBookings: () => api.get('/bus-bookings/my-bookings/active'),
  cancelBooking: (id) => api.put(`/bus-bookings/${id}/cancel`),
  getBookingById: (id) => api.get(`/bus-bookings/${id}`),
  getBookingByReference: (ref) => api.get(`/bus-bookings/reference/${ref}`),
  downloadTicket: (id) => api.get(`/bus-bookings/${id}/download`, { responseType: 'blob' }),
  
  // Admin endpoints
  getAllBookings: () => api.get('/bus-bookings/admin/all'),
  getBookingsByBus: (busId) => api.get(`/bus-bookings/admin/bus/${busId}`),
  getBookingStatistics: () => api.get('/bus-bookings/admin/statistics'),
  updateBookingStatus: (id, status) => api.put(`/bus-bookings/admin/${id}/status`, { params: { status } }),
  getPassengerManifest: (busId) => api.get(`/bus-bookings/admin/bus/${busId}/manifest`),
  processRefund: (id) => api.post(`/bus-bookings/admin/${id}/refund`),
  
  // Test endpoint
  test: () => api.get('/bus-bookings/test'),
};

// Train API endpoints
export const trainAPI = {
  // Admin endpoints
  addTrain: (trainData) => api.post('/trains/admin/add', trainData),
  updateTrain: (id, trainData) => api.put(`/trains/admin/update/${id}`, trainData),
  deleteTrain: (id) => api.delete(`/trains/admin/delete/${id}`),
  getAllTrains: (params) => api.get('/trains/admin/all', { params }),
  updateTrainStatus: (id, status) => api.put(`/trains/admin/status/${id}`, { status }),
  
  // User endpoints
  getAvailableTrains: () => api.get('/trains/available'),
  searchTrains: (params) => api.get('/trains/search', { params }),
  getTrainById: (id) => api.get(`/trains/${id}`),
  checkAvailability: (id, date) => api.get(`/trains/available/${id}`, { params: { date } }),
  getTrainDetails: (id) => api.get(`/trains/details/${id}`),
};

// Bookings API endpoints
export const bookingsAPI = {
  // Train bookings
  bookTrain: (bookingData) => api.post('/bookings/book', bookingData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  cancelBooking: (id) => api.put(`/bookings/cancel/${id}`),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  downloadTicket: (id) => api.get(`/bookings/${id}/download`, { responseType: 'blob' }),
  
  // Admin endpoints
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  getBookingStats: () => api.get('/bookings/admin/statistics'),
  processRefund: (id) => api.put(`/bookings/admin/refund/${id}`),
  
  // Vendor endpoints
  getAllTrainBookings: () => api.get('/bookings/vendor/all'),
  
  // Legacy endpoints (for other booking types)
  create: (bookingData) => api.post('/bookings', bookingData),
  getById: (id) => api.get(`/bookings/${id}`),
  getUserBookingsById: (userId) => api.get(`/bookings/user/${userId}`),
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