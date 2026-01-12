// Main layout wrapper combining Header, Content, Footer, and Sidebar
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { theme } from '../../styles/theme';

const MainLayout = ({ children, title, showFooter = true, user }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  // Open sidebar with animation
  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // Close sidebar with animation
  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Header title={title} onMenuPress={openSidebar} />

      {/* Main Content */}
      <View style={styles.content}>{children}</View>

      {/* Footer (optional) */}
      {showFooter && <Footer />}

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalContainer}>
          {/* Overlay */}
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          {/* Sidebar */}
          <Animated.View
            style={[
              styles.sidebarContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <Sidebar user={user} onClose={closeSidebar} />
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    width: 280,
    backgroundColor: theme.colors.white,
    ...theme.shadows.large,
  },
});

export default MainLayout;