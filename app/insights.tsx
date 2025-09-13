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

  const goBack = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Image source={require('../assets/images/chevron_back.png')} style={styles.chevron} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        {/* <Text style={styles.title}>Saved Insights</Text> */}
        
        <View style={{ width: 40 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F9',
  },
  header: {
    paddingTop: 72,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chevron: {
    width: 24,
    height: 24,
  },
  backText: {
    fontSize: 17,
    fontFamily: "SF Pro Display",
    color: "#B0B0B8",
    fontWeight: "400",
  },
  title: {
    fontSize: 32,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    flex: 1,
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