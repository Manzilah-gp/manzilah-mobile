// Header component with navigation and menu
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const Header = ({ title, showBack = false, showMenu = true, onMenuPress }) => {
  const navigation = useNavigation();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Left Side - Back button or Menu */}
          <View style={styles.leftSection}>
            {showBack ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="arrow-left" 
                  size={24} 
                  color={theme.colors.white} 
                />
              </TouchableOpacity>
            ) : showMenu ? (
              <TouchableOpacity
                onPress={onMenuPress}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="menu" 
                  size={24} 
                  color={theme.colors.white} 
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center - Title/Logo */}
          <View style={styles.centerSection}>
            <Text style={styles.title}>{title || 'Manzilah'}</Text>
          </View>

          {/* Right Side - Notifications */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="bell" 
                size={24} 
                color={theme.colors.white} 
              />
              {/* Notification badge - uncomment when you have notifications */}
              {/* <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View> */}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.primary,
  },
  container: {
    height: 60,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  iconButton: {
    padding: theme.spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;