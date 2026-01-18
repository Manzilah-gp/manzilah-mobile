import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// ============================================
// ⚠️ CHANGE THESE
// ============================================
const DEV_LOCAL_IP = '192.168.1.107';  // Your computer IP
const DEV_PORT = '5000';

// ⚠️ IMPORTANT: Remove /api from end - we add it in getBaseURL
const PRODUCTION_URL ='https://unmeridional-nonequable-takako.ngrok-free.dev';

// ============================================
// AUTO DETECTION
// ============================================
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isStandalone = !isExpoGo;

const getBaseURL = () => {
  console.log('📱 Platform:', Platform.OS);
  console.log('📦 Is EAS Build:', isStandalone);
  
  // EAS Build (installed .apk)
  if (isStandalone) {
    const url = `${PRODUCTION_URL}/api`;
    console.log('✅ Using PRODUCTION:', url);
    return url;
  }
  
  // Expo Go
  const isPhysical = Constants.isDevice;
  if (Platform.OS === 'android' && !isPhysical) {
    return `http://10.0.2.2:${DEV_PORT}/api`;
  }
  return `http://${DEV_LOCAL_IP}:${DEV_PORT}/api`;
};

export const API_BASE_URL = getBaseURL();
export const SOCKET_URL = API_BASE_URL.replace('/api', '');

console.log('🔗 Final API URL:', API_BASE_URL);