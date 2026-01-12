// Complete Sidebar component with working logout functionality
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

const Sidebar = ({ user, onClose }) => {
  const navigation = useNavigation();
  const { logout } = useAuth(); // Get logout function from AuthContext
  const [expandedItems, setExpandedItems] = useState({});

  // Navigate and close sidebar
  const navigateTo = (screen) => {
    navigation.navigate(screen);
    onClose();
  };

  // Toggle dropdown menu
  const toggleDropdown = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              onClose(); // Close sidebar first
              await logout(); // Call logout from AuthContext
              // Navigation to login screen is usually handled by AuthContext
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Complete menu items matching your website exactly
  const getAllMenuItems = () => {
    const userRoles = user?.activeRoles || user?.roles || [];

    return [
      // ==================== COMMON ITEMS (All Users) ====================
      {
        key: 'profile',
        title: 'Profile',
        icon: 'account',
        screen: 'Profile',
        roles: ['student', 'mosque_admin', 'ministry_admin', 'parent', 'teacher']
      },
      {
        key: 'calendar',
        title: 'Calendar',
        icon: 'calendar',
        screen: 'Calendar',
        roles: ['ministry_admin', 'mosque_admin', 'teacher', 'student', 'parent', 'donor']
      },
      {
        key: 'events',
        title: 'Events',
        icon: 'calendar-star',
        screen: 'Events',
        roles: ['ministry_admin', 'mosque_admin', 'teacher', 'student', 'parent']
      },

      // ==================== MINISTRY ADMIN ONLY ====================
      {
        key: 'statistics',
        title: 'Statistics',
        icon: 'chart-bar',
        screen: 'Statistics',
        roles: ['mosque_admin', 'ministry_admin']
      },
      {
        key: 'mosques',
        title: 'Mosque Management',
        icon: 'mosque',
        roles: ['ministry_admin'],
        children: [
          {
            key: 'add-mosque',
            title: 'Add Mosque',
            screen: 'AddMosque',
            icon: 'plus'
          },
          {
            key: 'mosque-list',
            title: 'Mosque List',
            screen: 'MosqueList',
            icon: 'format-list-bulleted'
          }
        ]
      },
      {
        key: 'fundraising',
        title: 'Fundraising Events',
        icon: 'cash-multiple',
        screen: 'FundraisingApprovals',
        roles: ['ministry_admin']
      },
      {
        key: 'user-management',
        title: 'User Management',
        icon: 'account-group',
        roles: ['ministry_admin'],
        children: [
          {
            key: 'add-user',
            title: 'Add User',
            screen: 'AddUser',
            icon: 'account-plus'
          },
          {
            key: 'user-list',
            title: 'User List',
            screen: 'UserList',
            icon: 'format-list-bulleted'
          }
        ]
      },
      {
        key: 'settings',
        title: 'Settings',
        icon: 'cog',
        roles: ['ministry_admin'],
        children: [
          {
            key: 'general-settings',
            title: 'General',
            screen: 'GeneralSettings',
            icon: 'cog-outline'
          },
          {
            key: 'notifications',
            title: 'Notifications',
            screen: 'NotificationSettings',
            icon: 'bell-outline'
          }
        ]
      },

      // ==================== MOSQUE ADMIN ONLY ====================
      {
        key: 'my-mosque',
        title: 'My Mosque',
        icon: 'mosque',
        screen: 'MyMosque',
        roles: ['mosque_admin']
      },
      {
        key: 'teachers-management',
        title: 'Teachers Management',
        icon: 'account-tie',
        screen: 'TeachersManagement',
        roles: ['mosque_admin']
      },
      {
        key: 'courses',
        title: 'Courses',
        icon: 'book-open-variant',
        roles: ['mosque_admin'],
        children: [
          {
            key: 'course-list',
            title: 'All Courses',
            screen: 'CourseList',
            icon: 'format-list-bulleted'
          },
          {
            key: 'add-course',
            title: 'Add Course',
            screen: 'AddCourse',
            icon: 'plus'
          }
        ]
      },

      // ==================== TEACHER ONLY ====================
      {
        key: 'my-courses',
        title: 'My Courses',
        icon: 'book-multiple',
        screen: 'MyCourses',
        roles: ['teacher']
      },
      {
        key: 'all-students',
        title: 'All Students',
        icon: 'account-group',
        screen: 'TeacherStudents',
        roles: ['teacher']
      },

      // ==================== STUDENT & PARENT ====================
      {
        key: 'my-enrollments',
        title: userRoles.includes('student') ? 'My Enrollments' : 'Children Enrollments',
        icon: 'book-open',
        screen: 'MyEnrollments',
        roles: ['student', 'parent']
      },

      // ==================== PARENT ONLY ====================
      {
        key: 'children',
        title: 'My Children',
        icon: 'human-child',
        screen: 'MyChildren',
        roles: ['parent']
      },
      {
        key: 'progress',
        title: 'Progress Reports',
        icon: 'chart-line',
        screen: 'ProgressReports',
        roles: ['parent']
      },
    ];
  };

  // Filter menu items based on user roles
  const getFilteredMenuItems = useMemo(() => {
    const userRoles = user?.activeRoles || user?.roles || [];
    if (userRoles.length === 0) return [];

    const hasAccess = (item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => userRoles.includes(role));
    };

    const allItems = getAllMenuItems();
    const filteredItems = allItems.filter(item => hasAccess(item));

    // Filter children as well
    return filteredItems.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => 
            !child.roles || child.roles.some(role => userRoles.includes(role))
          )
        };
      }
      return item;
    });
  }, [user]);

  // Render menu item
  const renderMenuItem = (item, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.key];

    return (
      <View key={item.key}>
        <TouchableOpacity
          style={[
            styles.menuItem,
            isChild && styles.childMenuItem
          ]}
          onPress={() => {
            if (hasChildren) {
              toggleDropdown(item.key);
            } else if (item.screen) {
              navigateTo(item.screen);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name={item.icon} 
            size={isChild ? 20 : 24} 
            color={isChild ? theme.colors.textSecondary : theme.colors.primary} 
          />
          <Text style={[
            styles.menuText,
            isChild && styles.childMenuText
          ]}>
            {item.title}
          </Text>
          {hasChildren && (
            <MaterialCommunityIcons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.textLight} 
            />
          )}
          {!hasChildren && !isChild && (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={theme.colors.textLight} 
            />
          )}
        </TouchableOpacity>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {item.children.map(child => renderMenuItem(child, true))}
          </View>
        )}
      </View>
    );
  };

  const menuItems = getFilteredMenuItems;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={32} color={theme.colors.white} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map(item => renderMenuItem(item))}

          {/* Chat - All Users */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('Chat')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chat" size={24} color={theme.colors.primary} />
            <Text style={styles.menuText}>Chat</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          {/* Storyteller - All Users */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigateTo('Storyteller')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={theme.colors.primary} />
            <Text style={styles.menuText}>Storyteller</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          {/* Logout with working functionality */}
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={24} color={theme.colors.error} />
            <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.lightGray,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  menuContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  childMenuItem: {
    paddingLeft: theme.spacing.xxl,
    paddingVertical: theme.spacing.sm,
  },
  menuText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  childMenuText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  childrenContainer: {
    backgroundColor: theme.colors.lightGray,
  },
  logoutItem: {
    marginTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: theme.colors.error,
  },
});

export default Sidebar;