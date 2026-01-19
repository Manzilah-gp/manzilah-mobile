import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMyChildren } from '../../api/parentProgress';

// Get device dimensions for responsive design
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const MyChildrenScreen = () => {
    const navigation = useNavigation();

    const [children, setChildren] = useState([]);
    const [filteredChildren, setFilteredChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch data when component mounts
    useEffect(() => {
        fetchChildren();
    }, []);

    // Filter children based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredChildren(children);
        } else {
            const filtered = children.filter(child =>
                child.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                child.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredChildren(filtered);
        }
    }, [searchTerm, children]);

    // Fetch all children data from API
    const fetchChildren = async () => {
        setLoading(true);
        try {
            const response = await getMyChildren();
            console.log('👶 Children response:', response.data);

            if (response.data.success) {
                setChildren(response.data.data);
                setFilteredChildren(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to load children');
            }
        } catch (error) {
            console.error('❌ Error fetching children:', error);
            Alert.alert('Error', 'Failed to load children data');
        } finally {
            setLoading(false);
        }
    };

    // Handle pull-to-refresh functionality
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChildren();
        setRefreshing(false);
    };

    // Navigate to child details screen
    const handleViewChild = (childId) => {
        navigation.navigate('ChildDetails', { childId });
    };

    // Get appropriate color for progress percentage
    const getProgressColor = (percentage) => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 50) return '#f59e0b';
        return '#ef4444';
    };

    // Render loading spinner
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading your children...</Text>
            </View>
        );
    }

    // Render empty state when no children
    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
                {children.length === 0 ? 'No children found' : 'No matching children'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {children.length === 0 
                    ? 'Link your children to track their progress'
                    : 'Try adjusting your search'
                }
            </Text>
        </View>
    );

    // Render individual child card
    const renderChildCard = (child) => {
        const avgProgress = Math.round(child.avg_progress || 0);
        const progressColor = getProgressColor(avgProgress);

        return (
            <View key={child.child_id} style={styles.childCard}>
                {/* Child Header with Avatar */}
                <View style={styles.childHeader}>
                    <View style={styles.childAvatar}>
                        <Text style={styles.avatarText}>
                            {child.full_name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.childHeaderInfo}>
                        <Text style={styles.childName}>{child.full_name}</Text>
                        <Text style={styles.childAge}>{child.age} years old</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.contactSection}>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={16} color="#6b7280" />
                        <Text style={styles.contactText}>{child.email}</Text>
                    </View>
                    {child.phone && (
                        <View style={styles.contactItem}>
                            <Ionicons name="call-outline" size={16} color="#6b7280" />
                            <Text style={styles.contactText}>{child.phone}</Text>
                        </View>
                    )}
                </View>

                {/* Enrollment Statistics */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, styles.activeIcon]}>
                            <Ionicons name="book" size={20} color="#10b981" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{child.active_enrollments}</Text>
                            <Text style={styles.statLabel}>Active Courses</Text>
                        </View>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <View style={[styles.statIconContainer, styles.completedIcon]}>
                            <Ionicons name="trophy" size={20} color="#f59e0b" />
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{child.completed_enrollments}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                    </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Average Progress</Text>
                        <Text style={[styles.progressPercentage, { color: progressColor }]}>
                            {avgProgress}%
                        </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${avgProgress}%`, backgroundColor: progressColor }
                            ]} 
                        />
                    </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewChild(child.child_id)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Page Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Ionicons name="people" size={28} color="#3b82f6" />
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>My Children</Text>
                        <Text style={styles.headerSubtitle}>
                            Track your children's learning progress
                        </Text>
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor="#9ca3af"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.resultCount}>
                    {filteredChildren.length} of {children.length} children
                </Text>
            </View>

            {/* Children List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredChildren.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={styles.childrenGrid}>
                        {filteredChildren.map((child) => renderChildCard(child))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    headerTitle: {
        fontSize: isSmallDevice ? 22 : 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    resultCount: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    childrenGrid: {
        gap: 16,
    },
    childCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    childAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    childHeaderInfo: {
        flex: 1,
    },
    childName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    childAge: {
        fontSize: 14,
        color: '#6b7280',
    },
    contactSection: {
        marginBottom: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#e5e7eb',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    activeIcon: {
        backgroundColor: '#d1fae5',
    },
    completedIcon: {
        backgroundColor: '#fef3c7',
    },
    statContent: {
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 11,
        color: '#6b7280',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    viewButton: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    viewButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});

export default MyChildrenScreen;