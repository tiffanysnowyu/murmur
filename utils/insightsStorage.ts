// app/utils/insightsStorage.ts
import * as FileSystem from 'expo-file-system';

const INSIGHTS_FILE = FileSystem.documentDirectory + 'insights.json';

interface Insight {
  id: string;
  claim: string;
  analysis: string;
  mode: string;
  savedAt: string;
  title: string;
}

export const insightsStorage = {
  async getInsights(): Promise<Insight[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(INSIGHTS_FILE);
      if (!fileInfo.exists) {
        return [];
      }
      const content = await FileSystem.readAsStringAsync(INSIGHTS_FILE);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading insights:', error);
      return [];
    }
  },

  async saveInsights(insights: Insight[]): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(INSIGHTS_FILE, JSON.stringify(insights));
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  },

  async addInsight(insight: Insight): Promise<void> {
    const insights = await this.getInsights();
    insights.unshift(insight); // Add to beginning
    await this.saveInsights(insights);
  },

  async deleteInsight(id: string): Promise<void> {
    const insights = await this.getInsights();
    const filtered = insights.filter(item => item.id !== id);
    await this.saveInsights(filtered);
  }
};