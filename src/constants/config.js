/**
 * Configuration Constants
 * Place in: src/constants/config.js
 */

// Your backend API URL
// CHANGE THIS to your actual backend URL
export const API_BASE_URL = 'http://192.168.1.107:5000/api'; 
// For Android emulator: http://10.0.2.2:5000/api
// For iOS simulator: http://localhost:5000/api
// For physical device: http://YOUR_COMPUTER_IP:5000/api

// Socket URL (without /api)
export const SOCKET_URL = API_BASE_URL.replace('/api', '');