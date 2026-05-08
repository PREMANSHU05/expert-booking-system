import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export const fetchExperts = (params) => API.get('/experts', { params });
export const fetchExpertById = (id) => API.get(`/experts/${id}`);
export const createBooking = (data) => API.post('/bookings', data);
export const fetchBookingsByEmail = (email) => API.get('/bookings', { params: { email } });
export const updateBookingStatus = (id, status) => API.patch(`/bookings/${id}/status`, { status });

export default API;
