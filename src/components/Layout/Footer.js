// Footer bottom navigation component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Navigation items (customize based on user role)
  const navItems = [
    { name: 'Home', icon: 'home', route: 'Home' },
    { name: 'Courses', icon: 'book-open', route: 'Courses' },
    { name: 'Profile', icon: 'account', route: 'Profile' },
    { name: 'Settings', icon: 'cog', route: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = route.name === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive ? theme.colors.primary : theme.colors.textLight}
            />
            <Text
              style={[
                styles.navText,
                isActive && styles.navTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    ...theme.shadows.small,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  navText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  navTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default Footer;