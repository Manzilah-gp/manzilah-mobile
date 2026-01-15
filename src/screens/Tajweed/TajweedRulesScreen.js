import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TAJWEED_RULES } from '../../utils/tajweedUtils';
import { getTrainingVerses } from '../../data/tajweedVerses';
import { getVerseWithTajweed } from '../../api/tajweedApi';
import TajweedText from '../../components/Quran/TajweedText';

/**
 * Tajweed Rules List Screen
 * Displays all available Tajweed rules with example verses
 * Each verse shows only the highlighted color for that specific rule
 */
const TajweedRulesScreen = () => {
  const navigation = useNavigation();
  const [expandedRule, setExpandedRule] = useState(null);
  const [verseData, setVerseData] = useState({});
  const [loadingVerses, setLoadingVerses] = useState({});

  /**
   * Navigate to training screen for selected rule
   */
  const handleRulePress = (rule) => {
    navigation.navigate('TajweedTraining', { ruleId: rule.id });
  };

  /**
   * Toggle expansion of rule to show/hide example verses
   */
  const toggleRuleExpansion = async (ruleId) => {
    if (expandedRule === ruleId) {
      // Collapse if already expanded
      setExpandedRule(null);
    } else {
      // Expand and load verses if not already loaded
      setExpandedRule(ruleId);
      
      if (!verseData[ruleId]) {
        await loadExampleVerses(ruleId);
      }
    }
  };

  /**
   * Load example verses for a specific rule
   */
  const loadExampleVerses = async (ruleId) => {
    setLoadingVerses(prev => ({ ...prev, [ruleId]: true }));
    
    try {
      const verseKeys = getTrainingVerses(ruleId);
      // Load first 3 verses as examples
      const exampleKeys = verseKeys.slice(0, 3);
      
      const verses = await Promise.all(
        exampleKeys.map(key => getVerseWithTajweed(key))
      );
      
      setVerseData(prev => ({ ...prev, [ruleId]: verses }));
    } catch (error) {
      console.error('Error loading example verses:', error);
    } finally {
      setLoadingVerses(prev => ({ ...prev, [ruleId]: false }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>تدريب التجويد</Text>
          <Text style={styles.headerSubtitle}>Tajweed Training</Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>قواعد التجويد</Text>
          <Text style={styles.infoText}>
            اضغط على أي قاعدة لرؤية الأمثلة، واضغط "ابدأ التدريب" للتمرين الكامل
          </Text>
        </View>
      </View>

      {/* Rules List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>اختر قاعدة التجويد</Text>

        {TAJWEED_RULES.map((rule) => (
          <View key={rule.id} style={styles.ruleCardWrapper}>
            {/* Rule Header Card */}
            <TouchableOpacity
              style={styles.ruleCard}
              onPress={() => toggleRuleExpansion(rule.id)}
              activeOpacity={0.7}
            >
              <View style={styles.ruleIconContainer}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
              </View>

              <View style={styles.ruleContent}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleNameAr}>{rule.nameAr}</Text>
                  <Text style={styles.ruleNameEn}>{rule.nameEn}</Text>
                </View>
                <Text style={styles.ruleDescription}>{rule.descriptionAr}</Text>
                <Text style={styles.ruleDetails}>{rule.details}</Text>
                
                {/* Color indicator */}
                <View style={styles.colorIndicatorContainer}>
                  <View 
                    style={[
                      styles.colorIndicator, 
                      { backgroundColor: rule.color }
                    ]} 
                  />
                  <Text style={styles.colorLabel}>اللون المميز</Text>
                </View>
              </View>

              <Text style={styles.chevron}>
                {expandedRule === rule.id ? '▼' : '›'}
              </Text>
            </TouchableOpacity>

            {/* Expanded Section - Example Verses */}
            {expandedRule === rule.id && (
              <View style={styles.expandedSection}>
                {loadingVerses[rule.id] ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#006D4E" />
                    <Text style={styles.loadingText}>جاري التحميل...</Text>
                  </View>
                ) : verseData[rule.id] ? (
                  <>
                    <Text style={styles.examplesTitle}>أمثلة من القرآن:</Text>
                    {verseData[rule.id].map((verse, index) => (
                      <View key={index} style={styles.verseExample}>
                        <Text style={styles.verseReference}>{verse.verseKey}</Text>
                        <TajweedText 
                          text={verse.text}
                          showColors={true}
                          filterRuleId={rule.id}
                          style={styles.verseText}
                        />
                      </View>
                    ))}
                    
                    {/* Start Training Button */}
                    <TouchableOpacity
                      style={styles.startTrainingButton}
                      onPress={() => handleRulePress(rule)}
                    >
                      <Text style={styles.startTrainingIcon}>▶️</Text>
                      <Text style={styles.startTrainingText}>ابدأ التدريب</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.noVersesText}>لا توجد آيات متاحة</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📚 كل قاعدة تحتوي على آيات مختارة بعناية
          </Text>
          <Text style={styles.footerText}>
            🎧 استمع إلى التلاوة الصحيحة
          </Text>
          <Text style={styles.footerText}>
            🔄 وضع التكرار للحفظ
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#006D4E',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ruleCardWrapper: {
    marginBottom: 12,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ruleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ruleIcon: {
    fontSize: 32,
  },
  ruleContent: {
    flex: 1,
  },
  ruleHeader: {
    marginBottom: 4,
  },
  ruleNameAr: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  ruleNameEn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  ruleDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  ruleDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    lineHeight: 16,
  },
  colorIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 40,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  colorLabel: {
    fontSize: 11,
    color: '#999',
  },
  chevron: {
    fontSize: 24,
    color: '#CCC',
    marginLeft: 8,
  },
  expandedSection: {
    backgroundColor: '#FAFAFA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  verseExample: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  verseReference: {
    fontSize: 12,
    color: '#006D4E',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  verseText: {
    fontSize: 24,
    lineHeight: 42,
  },
  startTrainingButton: {
    backgroundColor: '#006D4E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  startTrainingIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  startTrainingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noVersesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'right',
  },
});

export default TajweedRulesScreen;