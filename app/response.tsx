// Updated response.tsx with fact-check detection and appropriate templates
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
  const [articleData, setArticleData] = useState<any>(null);

  // Get the text from parameters
  const inputText = (claim || text) as string;
  const currentMode = mode as string;
  const isAnalyzeMode = currentMode === 'analyze' || currentMode !== 'summarize';
  const isSummaryMode = currentMode === 'summarize';

  const isUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // Detect if content already contains fact-checking
  const detectPreFactCheckedContent = (content: string): boolean => {
    if (!content) return false;
    
    const lowerContent = content.toLowerCase();
    const patterns = [
      'fact-check results:',
      'fact check results:',
      "what's true:",
      'what\'s true:',
      '**what\'s true:**',
      'verdict:',
      'verification:',
      'fact check:',
      'fact checked:',
      'rating:',
      'claim:',
      'what\'s misleading:',
      'what\'s false:'
    ];
    
    // Check if content contains at least 2 of these patterns (more reliable)
    let matchCount = 0;
    for (const pattern of patterns) {
      if (lowerContent.includes(pattern)) {
        matchCount++;
        if (matchCount >= 2) {
          console.log('Detected pre-fact-checked content with patterns:', pattern);
          return true;
        }
      }
    }
    
    return false;
  };

  // Direct fetch function (will have CORS limitations)
  const readUrlContent = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const content = await response.text();
      return content;
    } catch (error) {
      throw new Error(`Failed to read URL content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Extract text content from HTML
  const extractTextFromHtml = (html: string) => {
    try {
      // Basic HTML cleaning (limited without DOM parser)
      let textContent = html
        // Remove script tags and content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove style tags and content
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove HTML tags
        .replace(/<[^>]*>/g, ' ')
        // Decode HTML entities (basic ones)
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Basic title extraction (look for <title> tag in original HTML)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Article';

      return {
        title,
        content: textContent,
        wordCount: textContent.split(' ').length,
        isPaywalled: html.toLowerCase().includes('paywall') || 
                     html.toLowerCase().includes('subscription') ||
                     html.toLowerCase().includes('premium content')
      };
    } catch (error) {
      throw new Error('Failed to extract text from HTML');
    }
  };

  const getSystemPrompt = (mode: string, isPreFactChecked: boolean = false) => {
    if (mode === 'summarize') {
      return `You are an expert content analyzer. You will be provided with article content that has been extracted from a web page.

TASK: Provide a comprehensive analysis including:
- **ARTICLE SUMMARY**: Main points and key findings from the article
- **KEY CLAIMS**: Important claims or statements made in the article  
- **CONTEXT**: Background information and why this topic matters
- **CREDIBILITY NOTES**: Any observations about the content quality

Note: The content may be incomplete due to technical limitations in extraction. Format with clear headings and be thorough with available information.`;
    } else if (isPreFactChecked) {
      // Special prompt for content that already contains fact-checking
      return `You are reviewing an existing fact-check. Focus on what matters to users.

TASK: Analyze whether this fact-check addresses real concerns effectively.

**Assessment Format:**

**Is this addressing a real concern?**
- What anxiety or worry might have prompted this fact-check?
- Does it focus on what actually matters to people?

**Quality of the fact-check:**
- Does it provide sources and evidence?
- Is it focusing on relevant details or getting lost in trivia?

**What's missing:**
- What questions would anxious readers still have?
- What practical guidance is lacking?

**What you can do:**
[Based on the topic, provide SPECIFIC actions readers can take, whether or not the original fact-check included them]

**Bottom line:**
[Is this fact-check helpful for someone who's worried? What should they actually do?]

Focus on practical anxiety relief, not academic analysis.`;
    } else {
      return `You are an expert fact-checker and health analyst.

IMPORTANT GUIDELINES:
- Focus ONLY on claims that matter for the user's concerns
- SKIP irrelevant details like specific numbers (e.g., "250 cows") unless they're central to what's being verified
- If there's no clear claim causing anxiety, identify what the user might be worried about
- Keep responses focused on what actually impacts the user

REQUIRED OUTPUT FORMAT - Use this exact structure:

**What's true:**
[List only the relevant, important facts that address the user's concern. Skip hyper-local details unless they're crucial to the claim]

**What's misleading:**
[Focus on misleading aspects that could cause unnecessary worry or confusion]

**What you can do:**
[Provide SPECIFIC, ACTIONABLE steps the person can take. Include:
- Specific brands, products, or alternatives to consider
- Concrete actions they can take immediately  
- Specific places to shop or what to look for on labels
- Practical lifestyle modifications
- Both short-term and long-term actionable strategies
Make these suggestions concrete and implementable, not just general advice]

**Bottom line:**
[Clear, concise summary addressing their core concern]

If the claim/concern is unclear, start with:
"I'm not sure what specific claim you'd like me to check. Based on your input, you might be concerned about [guess]. If that's not right, please clarify what claim you'd like verified."

Focus on anxiety relief and practical guidance. Don't include trivial details that don't matter to the main concern.`;
    }
  };

  const analyzeContentWithClaude = async (contentText: string, analysisMode: string) => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      // Check if content is already fact-checked
      const isPreFactChecked = detectPreFactCheckedContent(contentText);
      
      // Debug logging
      console.log('Content preview:', contentText.substring(0, 200));
      console.log('Is pre-fact-checked:', isPreFactChecked);
      console.log('Analysis mode:', analysisMode);
      
      if (isPreFactChecked && analysisMode === 'analyze') {
        setAnalysisStep('Detected existing fact-check. Preparing meta-analysis...');
      }

      // For summarize mode, try to extract article content if it's a URL
      if (analysisMode === 'summarize' && isUrl(contentText)) {
        setAnalysisStep('Attempting to fetch article content...');
        
        try {
          const rawHtml = await readUrlContent(contentText);
          const extractedData = extractTextFromHtml(rawHtml);
          
          setArticleData(extractedData);
          
          if (extractedData.isPaywalled) {
            setError('This article appears to be behind a paywall. Analysis may be incomplete.');
          }
          
          if (extractedData.content.length < 100) {
            setError('Could not extract sufficient content from this URL. This might be due to CORS restrictions or the site blocking automated access.');
            setLoading(false);
            return;
          }
          
          // Analyze with Claude
          setAnalysisStep('Analyzing article with AI...');
          
          const systemPrompt = getSystemPrompt(analysisMode, false);
          const userPrompt = `Please analyze this article content:

Title: ${extractedData.title}
Content: ${extractedData.content}
Source URL: ${contentText}
Word Count: ${extractedData.wordCount}
Note: Content extracted directly from web page, may have some formatting issues.`;

          await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
          
        } catch (fetchError) {
          // If direct fetch fails, try to analyze the URL itself
          setError(`Could not fetch article content (likely CORS blocked): ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}. Analyzing URL instead.`);
          
          const systemPrompt = getSystemPrompt(analysisMode, false);
          const userPrompt = `I cannot access the full content of this article URL due to technical restrictions, but please provide what analysis you can based on the URL and any knowledge you have: ${contentText}`;
          
          await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
        }
      } else {
        // For analyze mode or non-URL content, use the text directly
        setAnalysisStep(isPreFactChecked ? 'Analyzing existing fact-check...' : 'Analyzing content...');
        const systemPrompt = getSystemPrompt(analysisMode, isPreFactChecked);
        
        let userPrompt: string;
        if (isPreFactChecked) {
          userPrompt = `SCENARIO: A user found this fact-check online and wants to know if they should trust it.

YOUR ROLE: You're a skeptical expert who HATES bad fact-checks that don't cite sources.

THE FACT-CHECK THEY FOUND:
${contentText}

YOUR TASK: Tear apart this fact-check for having ZERO sources. Do NOT verify if the claims are true - you CAN'T without sources. Instead, explain why this is a terrible fact-check that no one should trust.

Start your response with: "This fact-check is fundamentally flawed because..."`;
        } else {
          userPrompt = `Please analyze this content: "${contentText}"`;
        }
        
        await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
      }
      
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAnalysisStep('');
      setLoading(false);
    }
  };

  const callClaudeAPI = async (systemPrompt: string, userPrompt: string, analysisMode: string) => {
    try {
      if (!CLAUDE_API_KEY) {
        throw new Error('Claude API key not found. Please add EXPO_PUBLIC_CLAUDE_API_KEY to your .env file');
      }

      if (!CLAUDE_API_KEY.startsWith('sk-ant-')) {
        throw new Error('Invalid Claude API key format. Key should start with sk-ant-');
      }

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

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Claude API Error (${res.status}): ${errorText}`);
        }
        throw new Error(`Claude API Error: ${errorData.error?.message || errorData.message || 'Unknown error'}`);
      }

      const data = await res.json();

      let reply = '';
      if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        const textContent = data.content.find((item: any) => item.type === 'text');
        if (textContent && textContent.text) {
          reply = textContent.text.trim();
        }
      }

      if (reply) {
        setResponse(reply);
        setAnalysisStep('');
        if (analysisMode === 'summarize') {
          setShowAnalysisButton(true);
        }
      } else {
        throw new Error('No response received from Claude.');
      }
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
    if (articleData?.content) {
      analyzeContentWithClaude(articleData.content, 'analyze');
      setShowAnalysisButton(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const getTitle = () => {
    const isPreFactChecked = inputText && detectPreFactCheckedContent(inputText);
    if (isSummaryMode) return 'Article Analysis';
    if (isPreFactChecked) return 'Fact-Check Analysis';
    return 'Claim Analysis';
  };

  const getContentLabel = () => {
    const isPreFactChecked = inputText && detectPreFactCheckedContent(inputText);
    if (isSummaryMode) {
      return isUrl(inputText || '') ? '🔗 Article URL' : '📄 Article Headline/Content';
    }
    if (isPreFactChecked) {
      return '✅ Pre-Fact-Checked Content';
    }
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
            <View style={[
              styles.typeIndicator,
              inputText && detectPreFactCheckedContent(inputText) && styles.preFactCheckedIndicator
            ]}>
              <Text style={styles.typeText}>{getContentLabel()}</Text>
            </View>
            <Text style={styles.inputText}>
              {inputText || 'No content provided'}
            </Text>
          </View>
        )}

        {articleData && isSummaryMode && (
          <View style={styles.articleInfoSection}>
            <Text style={styles.articleInfoTitle}>📄 Article Extracted</Text>
            <Text style={styles.articleTitle}>{articleData.title}</Text>
            <Text style={styles.articleMeta}>
              {articleData.wordCount} words • {articleData.isPaywalled ? '🔒 May be paywalled' : '✅ Content extracted'}
            </Text>
            <Text style={styles.warningText}>
              ⚠️ Note: Content extracted directly from web page. Some sites may block this method.
            </Text>
          </View>
        )}

        <View style={styles.responseSection}>
          <Text style={styles.sectionTitle}>
            {isSummaryMode ? 'Analysis:' : 
             (inputText && detectPreFactCheckedContent(inputText) ? 'Meta-Analysis Results:' : 'Fact-Check Results:')}
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
                    🔍 Now Fact-Check Claims from This Article
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
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeIndicator: {
    backgroundColor: '#32535F',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  preFactCheckedIndicator: {
    backgroundColor: '#28a745',
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
  articleInfoSection: {
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  articleInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#533f03',
    marginBottom: 4,
  },
  articleMeta: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
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
    fontWeight: '600',
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