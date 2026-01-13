// COMPLETE App.js - WITH ALL NAVIGATION SCREENS ADDED
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native'; 

// Auth Screens (you already have these)
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';

// Main Screens (you already have these)
import HomeScreen from './src/screens/Home/HomeScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';

// Student Screens
import MyEnrollmentsScreen from './src/screens/Student/MyEnrollmentsScreen';
import EnrollmentDetailsScreen from './src/screens/Student/EnrollmentDetailsScreen';
import PaymentScreen from './src/screens/Student/PaymentScreen';

// Parent Screens
import { MyChildrenScreen } from './src/screens/Parent/MyChildrenScreen';
import ProgressReportsScreen from './src/screens/Parent/ProgressReportsScreen';
import ChildDetailsScreen from './src/screens/Parent/ChildDetailsScreen';

// Ministry Admin Screens
import  FundraisingEventsScreen  from './src/screens/MinistryAdmin/FundraisingEventsScreen';

// Mosque Admin Screens
import { MyMosqueScreen, EventsManagementScreen } from './src/screens/MosqueAdmin/MosqueAdminScreens';
import CreateEventScreen from './src/screens/MosqueAdmin/CreateEventScreen';

// Events (All Users)
import EventsScreen from './src/screens/Events/EventsScreen';

import BrowseMosquesScreen from './src/screens/Profile/BrowseMosquesScreen';
import MosqueDetailsScreen from './src/screens/Profile/MosqueDetailsScreen';
import BrowseCoursesScreen from './src/screens/Student/BrowseCoursesScreen';
import CourseDetailsScreen from './src/screens/Profile/CourseDetailsScreen';

const Stack = createStackNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Main Stack - WITH ALL SCREENS INCLUDING MISSING ONES
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Main Screens */}
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    
    {/* ===== STUDENT SCREENS ===== */}
    <Stack.Screen name="MyEnrollments" component={MyEnrollmentsScreen} />
    <Stack.Screen name="EnrollmentDetails" component={EnrollmentDetailsScreen} />

    {/* NEWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW */}
    <Stack.Screen name="BrowseMosques" component={BrowseMosquesScreen} />
    <Stack.Screen name="MosqueDetails" component={MosqueDetailsScreen} />
    <Stack.Screen name="BrowseCourses" component={BrowseCoursesScreen} />
    <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />



    
    {/* MISSING SCREENS - ADD THESE: */}
<Stack.Screen name="EnrollmentInfo" component={EnrollmentDetailsScreen} />
    <Stack.Screen name="Courses" component={MyEnrollmentsScreen} />
    
    {/* ===== PARENT SCREENS ===== */}
    <Stack.Screen name="MyChildren" component={MyChildrenScreen} />
    <Stack.Screen name="ProgressReports" component={ProgressReportsScreen} />
    <Stack.Screen name="ChildDetails" component={ChildDetailsScreen} />
    
    {/* MISSING PARENT SCREENS - ADD THESE: */}
    <Stack.Screen name="ChildEnrollments" component={ProgressReportsScreen} />
    <Stack.Screen name="ChildProgress" component={ChildDetailsScreen} />
    <Stack.Screen name="LinkChild" component={MyChildrenScreen} />
    
    {/* ===== MINISTRY ADMIN SCREENS ===== */}
    <Stack.Screen name="FundraisingApprovals" component={FundraisingEventsScreen} />
    
    {/* ===== MOSQUE ADMIN SCREENS ===== */}
    <Stack.Screen name="MyMosque" component={MyMosqueScreen} />
    <Stack.Screen name="EventsManagement" component={EventsManagementScreen} />
    <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
    <Stack.Screen name="EditEvent" component={CreateEventScreen} />
    
    {/* ===== EVENTS (ALL USERS) ===== */}
    <Stack.Screen name="Events" component={EventsScreen} />
    <Stack.Screen name="EventDetails" component={EventsScreen} />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
