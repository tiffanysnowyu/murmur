// app/response.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export default function ResponsePage() {
  const { claim, text, mode } = useLocalSearchParams();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [showAnalysisButton, setShowAnalysisButton] = useState(false);

  // Get the text from parameters - no need to decode since we're not using URL encoding
  const inputText = (claim || text) as string;
  const currentMode = mode as string;
  const isAnalyzeMode = currentMode === 'analyze' || currentMode !== 'summarize';
  const isSummaryMode = currentMode === 'summarize';

  const getSystemPrompt = (mode: string) => {
    if (mode === 'summarize') {
      return `You are an expert content summarizer. Provide a clear, concise summary of the article focusing on:

1. KEY FINDINGS: Main points and conclusions
2. METHODOLOGY: How the research was conducted (if applicable)
3. CONTEXT: Important background information
4. CREDIBILITY: Source reliability and any limitations

Keep the summary factual and balanced. Highlight any concerning claims that might warrant further fact-checking.

Format as a clean, readable summary with clear headings.`;
    } else {
      return `You are an expert fact-checker and health analyst. Analyze content using this exact format:

REQUIRED OUTPUT FORMAT - Use this exact structure:

**What's true:**
[List factual, accurate aspects based on your knowledge]

**What's misleading:**
[List any misleading, false, exaggerated, or out-of-context aspects]

**What you can do:**
[Provide SPECIFIC, ACTIONABLE steps the person can take. Include:
- Specific brands, products, or alternatives to consider
- Concrete actions they can take immediately  
- Specific places to shop or what to look for
- Practical lifestyle modifications
- Both short-term and long-term actionable strategies
Make these suggestions concrete and implementable, not just general advice]

**Citations and sources:**
[Reference credible sources from your knowledge base. Include source names and note that you cannot provide live links]

Focus on anxiety relief and practical guidance.`;
    }
  };

  const analyzeContentWithOpenAI = async (contentText: string, analysisMode: string) => {
    setLoading(true);
    setError('');
    setResponse('');
    
    const stepText = analysisMode === 'summarize' ? 'Summarizing article...' : 'Analyzing content...';
    setAnalysisStep(stepText);

    try {
      const systemPrompt = getSystemPrompt(analysisMode);
      const userPrompt = analysisMode === 'summarize' 
        ? `Please summarize this article: "${contentText}"`
        : `Analyze this content and provide specific actionable advice in the "What you can do" section: "${contentText}"`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      console.log('🔍 OpenAI response:', JSON.stringify(data, null, 2));

      const reply = data.choices?.[0]?.message?.content?.trim();

      if (reply) {
        setResponse(reply);
        setAnalysisStep('');
        // Show analysis button if this was a summary
        if (analysisMode === 'summarize') {
          setShowAnalysisButton(true);
        }
      } else {
        setError('No response received from AI.');
      }
    } catch (err) {
      console.error('❌ OpenAI API error:', err);
      setError('Error contacting AI service. Please try again.');
      setAnalysisStep('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inputText && typeof inputText === 'string') {
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithOpenAI(inputText, analysisMode);
    }
  }, [inputText, currentMode]);

  const handleRetry = () => {
    if (inputText && typeof inputText === 'string') {
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithOpenAI(inputText, analysisMode);
    }
  };

  const handleAnalyzeClaims = () => {
    if (inputText && typeof inputText === 'string') {
      analyzeContentWithOpenAI(inputText, 'analyze');
      setShowAnalysisButton(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const getTitle = () => {
    if (isSummaryMode) return 'Article Summary';
    return 'Claim Analysis';
  };

  const getContentLabel = () => {
    if (isSummaryMode) return '📄 Article Content';
    return '🔍 Content to Analyze';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {inputText && (
          <View style={styles.inputSection}>
            <View style={styles.typeIndicator}>
              <Text style={styles.typeText}>{getContentLabel()}</Text>
            </View>
            <Text style={styles.inputText}>
              {inputText || 'No content provided'}
            </Text>
          </View>
        )}

        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>
            {isSummaryMode ? 'Summary:' : 'Analysis:'}
          </Text>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#32535F" />
              <Text style={styles.loadingText}>{analysisStep}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {response && !loading && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{response}</Text>
              
              {showAnalysisButton && (
                <TouchableOpacity 
                  style={styles.analyzeButton} 
                  onPress={handleAnalyzeClaims}
                >
                  <Text style={styles.analyzeButtonText}>
                    🔍 Fact-Check Claims from This Article
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!inputText && !loading && (
            <Text style={styles.noContentText}>
              No content provided for analysis. Please go back and enter some content.
            </Text>
          )}
        </View>
      </ScrollView>
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
  inputSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeIndicator: {
    backgroundColor: '#32535F',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputText: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  responseSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#32535F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: '#32535F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noContentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 40,
  },
});