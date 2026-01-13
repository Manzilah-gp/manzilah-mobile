// src/api/islamicService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.107:5000/api/islamic';

// Fetch daily prayer times
export const getPrayerTimes = async (latitude, longitude, date = null) => {
  try {
    const params = {
      latitude,
      longitude,
    };
    
    if (date) {
      params.date = date;
    }

    const response = await axios.get(`${API_BASE_URL}/prayer-times`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

// Fetch monthly prayer times calendar
export const getMonthlyPrayerTimes = async (latitude, longitude, month = null, year = null) => {
  try {
    const params = {
      latitude,
      longitude,
    };
    
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axios.get(`${API_BASE_URL}/prayer-times/monthly`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly prayer times:', error);
    throw error;
  }
};

// Get Qibla direction
export const getQiblaDirection = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/qibla`, {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Qibla direction:', error);
    throw error;
  }
};

// Get Hijri date
export const getHijriDate = async (date = null) => {
  try {
    const params = date ? { date } : {};
    const response = await axios.get(`${API_BASE_URL}/hijri-date`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Hijri date:', error);
    throw error;
  }
};