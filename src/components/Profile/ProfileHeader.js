// Profile header showing user basic information
// Updated to work with backend's roles array
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../styles/theme';

const ProfileHeader = ({ user }) => {
  const navigation = useNavigation();

  // Get roles from either activeRoles or roles
  const userRoles = user?.activeRoles || user?.roles || [];

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <MaterialCommunityIcons 
          name="account" 
          size={60} 
          color={theme.colors.white} 
        />
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user?.full_name || 'User Name'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        
        {/* Roles */}
        <View style={styles.rolesContainer}>
          {userRoles.length > 0 ? (
            userRoles.map((role, index) => (
              <View key={index} style={styles.roleChip}>
                <Text style={styles.roleText}>
                  {role.replace('_', ' ')}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.roleChip}>
              <Text style={styles.roleText}>No Role</Text>
            </View>
          )}
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons 
          name="pencil" 
          size={20} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.white,
    textTransform: 'capitalize',
  },
  editButton: {
    padding: theme.spacing.sm,
  },
});

export default ProfileHeader;