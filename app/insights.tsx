// app/insights.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { insightsStorage } from '../utils/insightsStorage';
import { BackButton, MainScreen } from '@/components/Common';

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
          },
        },
      ]
    );
  };

  const openInsight = (insight: Insight) => {
    router.push({
      pathname: '/response',
      params: {
        text: insight.claim,
        mode: insight.mode,
        savedResponse: insight.analysis,
      },
    });
  };

  return (
    <MainScreen backgroundColor='#F4F4F9'>
      <BackButton onPress={() => router.back()} buttonText="Back" />
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
              <View style={styles.cardContent}>
                <Image 
                  source={insight.mode === 'summarize' ? require('../assets/images/icon_summ.png') : require('../assets/images/icon_analysis.png')}
                  style={styles.cardIcon}
                />
                <Text style={styles.cardText} numberOfLines={1}>
                  {insight.title}
                </Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteInsight(insight.id);
                  }}
                  style={styles.trashButton}
                >
                  <Image 
                    source={require('../assets/images/trash.png')}
                    style={styles.trashIcon}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    // Undo the 40 padding set in the MainScreen component
    marginBottom: -40,
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
    height: 76,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 16,
  },
  trashButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  trashIcon: {
    width: 20,
    height: 20,
  },
});