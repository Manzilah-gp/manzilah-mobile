import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { RECITERS } from '../../api/quranAudioApi';

const { height } = Dimensions.get('window');

/**
 * Reciter Selection Modal
 * Allows users to choose their preferred Quran reciter
 */
const ReciterSelector = ({ visible, onClose, selectedReciter, onSelectReciter }) => {
  /**
   * Handle reciter selection
   */
  const handleSelect = (reciter) => {
    onSelectReciter(reciter.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>اختر القارئ</Text>
            <Text style={styles.subtitle}>Select Reciter</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Reciter List */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {RECITERS.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.reciterItem,
                  selectedReciter === reciter.id && styles.reciterItemSelected,
                ]}
                onPress={() => handleSelect(reciter)}
                activeOpacity={0.7}
              >
                <View style={styles.reciterInfo}>
                  <Text style={styles.reciterFlag}>{reciter.flag}</Text>
                  <View style={styles.reciterTextContainer}>
                    <Text style={styles.reciterName}>{reciter.name}</Text>
                    <Text style={styles.reciterLanguage}>{reciter.language}</Text>
                  </View>
                </View>
                {selectedReciter === reciter.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7, // 70% of screen height
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  reciterItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  reciterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reciterFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  reciterTextContainer: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reciterLanguage: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#006D4E',
    fontWeight: '700',
    marginLeft: 12,
  },
});

export default ReciterSelector;