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

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export default function ResponsePage() {
  const { claim, text, mode } = useLocalSearchParams();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [showAnalysisButton, setShowAnalysisButton] = useState(false);

  // Get the text from parameters
  const inputText = (claim || text) as string;
  const currentMode = mode as string;
  const isAnalyzeMode = currentMode === 'analyze' || currentMode !== 'summarize';
  const isSummaryMode = currentMode === 'summarize';

  // Debug API key
  useEffect(() => {
    console.log('Claude API Key exists:', !!CLAUDE_API_KEY);
    console.log('Claude API Key starts with sk-ant:', CLAUDE_API_KEY.startsWith('sk-ant'));
  }, []);

  const getSystemPrompt = (mode: string) => {
    if (mode === 'summarize') {
      return `You are an expert content analyzer with web search capabilities. When given article URLs, excerpts, or headlines:

1. If given a URL: Fetch and analyze the full article
2. If given an excerpt or headline: Use web search to find the original full article
3. If you can't access the article (paywall): Find alternative reliable sources about the same topic

TASK: Provide a clear, comprehensive summary including:
- KEY FINDINGS: Main points and conclusions from the article
- METHODOLOGY: How any research was conducted (if applicable)  
- CONTEXT: Important background information and credibility assessment
- FULL STORY: What the complete article says beyond just the headline

Keep the summary factual and balanced. Highlight any concerning claims that might warrant further fact-checking.

Format as a clean, readable summary with clear headings. If you found the article through search, mention that.`;
    } else {
      return `You are an expert fact-checker and health analyst with web search capabilities. 

For headlines, claims, or excerpts, use web search to:
1. Find recent, credible sources about the topic
2. Look for the original studies or reports mentioned
3. Check multiple reliable sources for verification
4. If given an excerpt, try to find the original article it came from

REQUIRED OUTPUT FORMAT - Use this exact structure:

**What's true:**
[List factual, accurate aspects based on current research and credible sources]

**What's misleading:**
[List any misleading, false, exaggerated, or out-of-context aspects]

**What you can do:**
[Provide SPECIFIC, ACTIONABLE steps the person can take. Include:
- Specific brands, products, or alternatives to consider (e.g., "Buy California-grown rice like Lundberg or Kokuho Rose")
- Concrete actions they can take immediately (e.g., "Rinse rice 3 times, cook with 6:1 water ratio")
- Specific places to shop or what to look for on labels
- Practical lifestyle modifications
- Both short-term and long-term actionable strategies
Make these suggestions concrete and implementable, not just general advice]

**Citations and sources:**
[Include specific, credible sources you found through web search with publication dates when available]

Focus on anxiety relief and practical guidance with current, verified information.`;
    }
  };

  const analyzeContentWithClaude = async (contentText: string, analysisMode: string) => {
    setLoading(true);
    setError('');
    setResponse('');
    
    const stepText = analysisMode === 'summarize' ? 'Summarizing article...' : 'Searching for current information...';
    setAnalysisStep(stepText);

    try {
      // Check if API key exists
      if (!CLAUDE_API_KEY) {
        throw new Error('Claude API key not found. Please add EXPO_PUBLIC_CLAUDE_API_KEY to your .env file');
      }

      if (!CLAUDE_API_KEY.startsWith('sk-ant-')) {
        throw new Error('Invalid Claude API key format. Key should start with sk-ant-');
      }

      const systemPrompt = getSystemPrompt(analysisMode);
      const userPrompt = analysisMode === 'summarize' 
        ? `Please analyze this content. If it's a URL, fetch the article. If it's an excerpt or headline, search for and find the original full article. Content: "${contentText}"`
        : `Please analyze this content. Use web search to find current, credible information about this topic and provide specific actionable advice: "${contentText}"`;

      setAnalysisStep(analysisMode === 'summarize' ? 'Analyzing content...' : 'Finding reliable sources...');

      console.log('Making request to Claude API...');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Claude API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Claude API Error (${res.status}): ${errorText}`);
        }
        
        throw new Error(`Claude API Error: ${errorData.error?.message || errorData.message || 'Unknown error'}`);
      }

      const data = await res.json();
      console.log('🔍 Claude response:', JSON.stringify(data, null, 2));

      setAnalysisStep('Generating comprehensive analysis...');

      // Handle Claude's response format
      let reply = '';
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        // Get the text content from Claude's response
        const textContent = data.content.find((item: any) => item.type === 'text');
        if (textContent && textContent.text) {
          reply = textContent.text.trim();
        }
      }

      if (reply) {
        setResponse(reply);
        setAnalysisStep('');
        // Show analysis button if this was a summary
        if (analysisMode === 'summarize') {
          setShowAnalysisButton(true);
        }
      } else {
        console.error('No text content found in response:', data);
        setError('No response received from Claude.');
      }
    } catch (err) {
      console.error('❌ Claude API error:', err);
      setError(`Error contacting Claude API: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAnalysisStep('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inputText && typeof inputText === 'string') {
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithClaude(inputText, analysisMode);
    }
  }, [inputText, currentMode]);

  const handleRetry = () => {
    if (inputText && typeof inputText === 'string') {
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithClaude(inputText, analysisMode);
    }
  };

  const handleAnalyzeClaims = () => {
    if (inputText && typeof inputText === 'string') {
      analyzeContentWithClaude(inputText, 'analyze');
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