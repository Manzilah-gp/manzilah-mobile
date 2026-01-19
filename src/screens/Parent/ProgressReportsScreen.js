import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    RefreshControl,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getChildrenProgressSummary } from '../../api/parentProgress';

// Get device dimensions for responsive design
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ProgressReportsScreen = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);

    // Fetch data when component mounts
    useEffect(() => {
        fetchSummary();
    }, []);

    // Fetch progress summary for all children
    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await getChildrenProgressSummary();
            console.log('📊 Summary response:', response.data);

            if (response.data.success) {
                setSummary(response.data.data);
            } else {
                Alert.alert('Error', 'Failed to load progress summary');
            }
        } catch (error) {
            console.error('❌ Error fetching summary:', error);
            Alert.alert('Error', 'Failed to load progress reports');
        } finally {
            setLoading(false);
        }
    };

    // Handle pull-to-refresh functionality
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSummary();
        setRefreshing(false);
    };

    // Navigate to view all children screen
    const handleViewAllChildren = () => {
        navigation.navigate('MyChildren');
    };

    // Navigate to all enrollments screen
    const handleViewEnrollments = () => {
        navigation.navigate('ChildrenEnrollments');
    };

    // Navigate to specific child details
    const handleViewChildDetails = (childId) => {
        navigation.navigate('ChildDetails', { childId });
    };

    // Get appropriate emoji for milestone type
    const getMilestoneIcon = (type) => {
        if (type === 'graduation' || type === 'final_exam') {
            return '🎓';
        }
        if (type?.includes('exam')) {
            return '📝';
        }
        return '✓';
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    // Get color for progress percentage
    const getProgressColor = (percent) => {
        if (percent >= 75) return '#10b981';
        if (percent >= 50) return '#f59e0b';
        return '#ef4444';
    };

    // Render loading spinner
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading progress reports...</Text>
            </View>
        );
    }

    const stats = summary?.summary || {};
    const recentMilestones = summary?.recentMilestones || [];

    // Render individual stat card
    const renderStatCard = (title, value, icon, color, description) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statHeader}>
                <Ionicons name={icon} size={24} color={color} />
                <Text style={styles.statTitle}>{title}</Text>
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statDescription}>{description}</Text>
        </View>
    );

    // Render circular progress indicator
    const renderCircularProgress = () => {
        const avgProgress = Math.round(stats?.avg_progress || 0);
        const color = getProgressColor(avgProgress);

        return (
            <View style={[styles.statCard, styles.progressCard]}>
                <Text style={styles.statTitle}>Average Progress</Text>
                <View style={styles.circularProgressContainer}>
                    <View style={[styles.circularProgress, { borderColor: color }]}>
                        <Text style={[styles.progressText, { color }]}>
                            {avgProgress}%
                        </Text>
                    </View>
                </View>
                <Text style={styles.statDescription}>Overall completion rate</Text>
            </View>
        );
    };

    // Render milestone item in timeline
    const renderMilestoneItem = (milestone, index) => {
        const isPassed = milestone.score >= 90;
        const milestoneColor = isPassed ? '#10b981' : '#3b82f6';

        return (
            <View key={index} style={styles.milestoneItem}>
                {/* Timeline dot */}
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineDot, { backgroundColor: milestoneColor }]} />
                    {index < recentMilestones.length - 1 && (
                        <View style={styles.timelineLine} />
                    )}
                </View>

                {/* Milestone content */}
                <View style={styles.milestoneContent}>
                    <View style={styles.milestoneHeader}>
                        <Text style={styles.milestoneIcon}>
                            {getMilestoneIcon(milestone.milestone_type)}
                        </Text>
                        <View style={styles.milestoneHeaderText}>
                            <Text style={styles.childName}>{milestone.child_name}</Text>
                            <Text style={styles.milestoneDate}>
                                {formatDate(milestone.achieved_at)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.courseName}>{milestone.course_name}</Text>

                    <View style={styles.milestoneDetails}>
                        <View style={styles.milestoneType}>
                            <Text style={styles.milestoneTypeText}>
                                {milestone.milestone_type?.replace('_', ' ').toUpperCase()}
                            </Text>
                        </View>

                        {milestone.score !== null && milestone.score !== undefined && (
                            <View style={[styles.scoreTag, isPassed ? styles.scorePassed : styles.scoreFailed]}>
                                <Text style={[styles.scoreText, isPassed ? styles.scorePassedText : styles.scoreFailedText]}>
                                    Score: {milestone.score}/100
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    // Render empty state for milestones
    const renderEmptyMilestones = () => (
        <View style={styles.emptyMilestones}>
            <Ionicons name="trophy-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No recent achievements yet</Text>
            <Text style={styles.emptySubtitle}>
                Exam results and graduations will appear here
            </Text>
        </View>
    );

    // Render quick action card
    const renderActionCard = (icon, title, description, onPress) => (
        <TouchableOpacity
            style={styles.actionCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={32} color="#3b82f6" style={styles.actionIcon} />
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDescription}>{description}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" style={styles.actionArrow} />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Page Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>📊 Progress Reports</Text>
                    <Text style={styles.headerSubtitle}>
                        Overview of all your children's learning progress
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleViewAllChildren}
                    activeOpacity={0.8}
                >
                    <Ionicons name="people" size={18} color="#fff" />
                    <Text style={styles.headerButtonText}>View Children</Text>
                </TouchableOpacity>
            </View>

            {/* Summary Statistics */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    {renderStatCard(
                        'Total Children',
                        stats?.total_children || 0,
                        'people',
                        '#3b82f6',
                        'Children in your account'
                    )}
                    {renderStatCard(
                        'Active Enrollments',
                        stats?.active_enrollments || 0,
                        'book',
                        '#10b981',
                        'Currently enrolled courses'
                    )}
                </View>

                <View style={styles.statsRow}>
                    {renderStatCard(
                        'Graduated',
                        stats?.graduated_count || 0,
                        'trophy',
                        '#f59e0b',
                        'Completed courses'
                    )}
                    {renderCircularProgress()}
                </View>
            </View>

            {/* Recent Achievements Timeline */}
            <View style={styles.milestonesCard}>
                <View style={styles.milestonesHeader}>
                    <Text style={styles.milestonesTitle}>🏆 Recent Achievements</Text>
                    <Ionicons name="time-outline" size={20} color="#6b7280" />
                </View>

                <View style={styles.milestonesContent}>
                    {recentMilestones.length > 0 ? (
                        recentMilestones.map((milestone, index) =>
                            renderMilestoneItem(milestone, index)
                        )
                    ) : (
                        renderEmptyMilestones()
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {renderActionCard(
                        'people',
                        'View Children',
                        'See all your children\'s profiles',
                        handleViewAllChildren
                    )}
                    {renderActionCard(
                        'book',
                        'All Enrollments',
                        'View all course enrollments',
                        handleViewEnrollments
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
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
        marginBottom: 24,
            marginTop: 30,      // ← Add this line to push header down

    },
    headerTextContainer: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: isSmallDevice ? 24 : 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: isSmallDevice ? 14 : 16,
        color: '#6b7280',
        lineHeight: 22,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    headerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    statTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statDescription: {
        fontSize: 12,
        color: '#9ca3af',
    },
    progressCard: {
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#8b5cf6',
    },
    circularProgressContainer: {
        marginVertical: 12,
    },
    circularProgress: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    progressText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    milestonesCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    milestonesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    milestonesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    milestonesContent: {
        gap: 0,
    },
    milestoneItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineContainer: {
        width: 40,
        alignItems: 'center',
        marginRight: 12,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 6,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#e5e7eb',
        marginTop: 4,
    },
    milestoneContent: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 12,
    },
    milestoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    milestoneIcon: {
        fontSize: 24,
    },
    milestoneHeaderText: {
        flex: 1,
    },
    childName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    milestoneDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    courseName: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    milestoneDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    milestoneType: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    milestoneTypeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1e40af',
    },
    scoreTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    scorePassed: {
        backgroundColor: '#d1fae5',
    },
    scoreFailed: {
        backgroundColor: '#fee2e2',
    },
    scoreText: {
        fontSize: 11,
        fontWeight: '600',
    },
    scorePassedText: {
        color: '#065f46',
    },
    scoreFailedText: {
        color: '#991b1b',
    },
    emptyMilestones: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },
    quickActionsSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    actionsGrid: {
        gap: 12,
    },
    actionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        marginRight: 16,
    },
    actionTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    actionDescription: {
        flex: 1,
        fontSize: 13,
        color: '#6b7280',
    },
    actionArrow: {
        marginLeft: 8,
    },
});

export default ProgressReportsScreen;