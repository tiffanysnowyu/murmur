// app/insights.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { insightsStorage } from '../utils/insightsStorage';

interface Insight {
  id: string;
  claim: string;
  analysis: string;
  mode: string;
  savedAt: string;
  title: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const savedInsights = await insightsStorage.getInsights();
    setInsights(savedInsights);
  };

  const handleDeleteInsight = async (id: string) => {
    Alert.alert(
      'Delete Insight',
      'Are you sure you want to delete this insight?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await insightsStorage.deleteInsight(id);
            await loadInsights(); // Reload the list
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setModalVisible(true);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Saved Insights</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {insights.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No saved insights yet</Text>
            <Text style={styles.emptySubtext}>
              Save fact-checks and analyses to review them later
            </Text>
          </View>
        ) : (
          insights.map((insight) => (
            <TouchableOpacity
              key={insight.id}
              style={styles.insightCard}
              onPress={() => openInsight(insight)}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightType}>
                  {insight.mode === 'summarize' ? '📄 Article' : '🔍 Fact Check'}
                </Text>
                <Text style={styles.insightDate}>{formatDate(insight.savedAt)}</Text>
              </View>
              <Text style={styles.insightTitle} numberOfLines={2}>
                {insight.title}
              </Text>
              <Text style={styles.insightPreview} numberOfLines={3}>
                {insight.claim}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectedInsight && handleDeleteInsight(selectedInsight.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>

          {selectedInsight && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalTypeContainer}>
                <Text style={styles.modalType}>
                  {selectedInsight.mode === 'summarize' ? '📄 Article Analysis' : '🔍 Fact Check'}
                </Text>
                <Text style={styles.modalDate}>{formatDate(selectedInsight.savedAt)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Original Content</Text>
                <Text style={styles.modalClaim}>{selectedInsight.claim}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Analysis</Text>
                <Text style={styles.modalAnalysis}>{selectedInsight.analysis}</Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#32535F',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightType: {
    fontSize: 14,
    color: '#666',
  },
  insightDate: {
    fontSize: 12,
    color: '#999',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  insightPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#32535F',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalType: {
    fontSize: 16,
    color: '#666',
  },
  modalDate: {
    fontSize: 14,
    color: '#999',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalClaim: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  modalAnalysis: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});