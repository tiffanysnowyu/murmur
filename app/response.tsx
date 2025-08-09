// Updated response.tsx with save functionality and Next button
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { insightsStorage } from '../utils/insightsStorage';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export default function ResponsePage() {
  const { claim, text, mode, previousClaim } = useLocalSearchParams();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [showAnalysisButton, setShowAnalysisButton] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [articleData, setArticleData] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

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

  // Save insight to file
  const saveInsight = async () => {
    try {
      const newInsight = {
        id: Date.now().toString(),
        claim: inputText,
        analysis: response,
        mode: currentMode,
        savedAt: new Date().toISOString(),
        title: articleData?.title || inputText.substring(0, 50) + '...',
      };

      await insightsStorage.addInsight(newInsight);
      setIsSaved(true);
      // Don't show alert here anymore, just set the saved state
    } catch (error) {
      console.error('Error saving insight:', error);
      Alert.alert('Error', 'Failed to save insight.');
    }
  };

  // Handle tapping the save button (checkmark when saved)
  const handleSaveButtonPress = () => {
    if (isSaved) {
      // Show modal explaining it's already saved
      setShowSavedModal(true);
    } else {
      // Save the insight
      saveInsight();
    }
  };

  // Direct fetch function (will have CORS limitations)
  const readUrlContent = async (url: string) => {
    try {
      // Try using a CORS proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.contents;
    } catch (error) {
      // If proxy fails, try direct fetch as fallback
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
      } catch (directError) {
        throw new Error(`Failed to read URL content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

  const getSystemPrompt = (mode: string, isPreFactChecked: boolean = false, isFollowUp: boolean = false) => {
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
    } else if (isFollowUp) {
      return `You are an expert fact-checker and health analyst responding to a FOLLOW-UP QUESTION.

IMPORTANT: The user previously received a fact-check about a specific topic and now has a follow-up concern. This is NOT a new standalone claim to fact-check - it's a specific worry related to their original question.

CONTEXT AWARENESS: 
- Always acknowledge what they originally asked about
- Connect your response to their initial concern
- Provide targeted reassurance for their specific follow-up worry

RESPONSE FORMAT for follow-ups:

**About your concern:**
[Acknowledge their original topic and explain how this follow-up relates to it. Be specific about what they're worried about.]

**Here's what you need to know:**
[Address their specific follow-up question with facts and context. Focus on what actually applies to their situation.]

**What this means for you:**
[Practical, specific guidance that directly addresses their follow-up concern. Keep it simple and actionable.]

**Sources:**
[Include 1-2 credible sources that support the key points
- Health organizations (CDC, WHO, local health departments)  
- Official government health websites
- Format as simple list without full citations]

**Bottom line:**
[Clear, reassuring summary that ties back to their original concern and gives them confidence about what to do next.]

Remember: This is about providing targeted reassurance for a specific follow-up worry, not doing a full fact-check analysis.`;
    } else {
      return `You are an expert fact-checker and health analyst.

IMPORTANT: First check if the claim is political in nature.
- If it's political but NOT directly related to environmental, climate, or public health policy, respond ONLY with:
"This claim may be politically important, but Murmur focuses on health, climate, and environmental information. If you're feeling overwhelmed, we're here to help with claims that impact your safety, wellbeing, and understanding of the world."

- If it IS related to environmental, climate, or public health policy, proceed with the analysis below.

For valid claims, analyze the input to determine if it's:
1. A formal claim/headline - Look for these clear indicators:
   - Contains quotation marks around a statement
   - Has attribution ("According to...", "Scientists say...", "Doctors warn...")
   - Includes specific statistics or percentages
   - Uses sensational language ("BREAKING:", "WARNING:", exclamation points)
   - Mentions specific dates, locations WITH claims about them
   - Has the structure of a headline or social media post
   
2. A personal concern - Everything else, including:
   - Single topics or keywords
   - Questions
   - Informal phrasing
   - No clear claim structure

Only use "What's misleading" when there's a specific false or exaggerated claim to address. If someone just enters a topic or general concern, use "About this concern" instead.

GENERAL GUIDELINES:
- Start with a brief, reassuring statement to put the user at ease
- Never tell users to "avoid" things - always frame as what they SHOULD do instead
- When discussing common activities, provide calming context and be specific about what's actually affected
- NEVER use vague terms like "relatively rare" - be specific with reassuring statistics if needed
- If a claim mentions a specific region, ALWAYS clarify: 1) exactly which areas are affected, 2) which areas are NOT affected, and 3) reassure that even in affected areas, simple precautions work
- Don't personify bacteria or diseases (no "deserves respect" language)
- Include historical perspective when relevant to show how similar concerns have been successfully managed
- Focus on immediate, simple actions - do NOT provide complex preparedness plans for any scenario (disasters, pandemics, emergencies, etc.)
- Focus ONLY on claims that matter for the user's concerns
- Keep responses focused on what actually impacts the user
- Write recommendations clearly to avoid misinterpretation
- When suggesting organic alternatives, clearly state: "Choose organic versions of produce that typically have high pesticide residues when grown conventionally"
- Never write sentences that could be read as recommending contaminated products or environmentally or physically toxic practices
- Be explicit about what you're trying to avoid vs. what you're recommending

REQUIRED OUTPUT FORMAT - Use this exact structure:

[Start with 1-2 sentences of immediate reassurance about the topic - something calming and positive]

**What's true:**
[List only the relevant, important facts that address the user's concern. Skip hyper-local details unless they're crucial to the claim]

**Where this applies (if location-specific):**
[Only include if the claim involves specific regions/conditions
- Be specific about affected areas
- Explicitly state where it does NOT apply
- Reassure that even in affected areas, the precautions below work well]

**What's misleading:** [ONLY when there's a specific claim with false/exaggerated elements]
[Focus ONLY on misleading aspects that cause unnecessary worry or confusion. 
CRITICAL: Do NOT include factual information that might sound alarming, even if it's true. This section is for correcting FALSE claims that make things seem worse than they are.
Examples of what TO include: "The headline makes it sound like this affects everyone, but it only applies to..."
Examples of what NOT to include: True but scary facts, normal patterns that sound ominous, or accurate technical details that might worry people.
Keep this section focused on reducing anxiety by correcting exaggerations, not adding concerning facts.]

**About this concern:** [For topics, questions, or general worries without specific claims]
[Address what they're actually worried about with context and reassurance
- Explain the real situation
- Provide perspective without being dismissive]

**Putting this in perspective:**
[When relevant, include:
- How similar concerns have been around for years/decades
- How people have safely managed these situations before
- Success stories of precautions working well
- How millions continue to safely enjoy these activities
Keep this brief and reassuring, not dismissive]

**What you can do:**
[Basic, easy actions for most healthy people. Include:
- Specific positive actions (not "avoid X", but "do Y instead")
- Include timings and specifics where relevant
- Make it clear these simple steps are enough for most people
- Keep to immediate, simple actions only]

**If you're shopping for this:**
[CRITICAL: ONLY include this section if the user is asking about what specific products to BUY or AVOID BUYING.
INCLUDE ONLY IF the claim is directly about: food safety, baby products, cosmetics, household cleaners, supplements, toys, or other consumer goods where people need purchasing advice.
DO NOT INCLUDE for: laws, policies, water systems, regulations, medical advice, general health topics, news events, or anything that isn't about choosing products to purchase.

This section is ONLY for "what should I buy" situations - not "what's happening in the world" situations.

When included:
- Recommend specific brands, sources, or certifications
- Include where to find these products
- Focus on what TO choose, not what to avoid]

**If you have certain health conditions:**
[ONLY for immediate health/safety actions, not long-term planning
- Only for people with weakened immune systems, chronic conditions, recent surgeries, etc.
- Frame positively: what to choose instead, not what to avoid
- No redundancy with the basic precautions above
- Be specific about safe alternatives they can enjoy
- Keep to simple, immediate actions only]

**Bottom line:**
[Clear, reassuring summary focused on empowerment and enjoying life
- Start with reassurance about safety with precautions
- End on a positive, action-oriented note
- NO reminders of risks or threats
- Focus on how simple the precautions are and how they can continue enjoying activities
- If location-specific, emphasize that most places are unaffected]

**Sources:**
[Include 2-4 credible sources that support the key claims
- Health organizations (CDC, WHO, local health departments)
- Peer-reviewed studies if relevant
- Official government health websites
- Format as simple list without full citations]

**Think critically about what you're reading:**
[CRITICAL: ONLY include this section if the claim comes from an article, social media post, or other media source that appears sensationalist, biased, or has clear motivations.
INCLUDE ONLY IF: the content uses alarming language, comes from a source with potential bias, or appears designed to provoke strong emotions.
DO NOT INCLUDE for: straightforward factual claims, simple questions, or neutral informational requests.

When included, analyze this specific content:
- WHO BENEFITS: Identify who actually gains from this particular story or interpretation being shared (media outlets getting clicks, companies selling products, political groups, etc.). Be specific to this topic.
- WHY NOW: Explain why this specific story is trending or being shared at this moment. Is there a news cycle, political timing, or business reason?
- WHAT'S MISSING: Point out what important context, nuance, or opposing viewpoints aren't being discussed in typical coverage of this topic.
- THE REAL IMPACT: Compare how urgent/scary this is being made to seem versus how it actually affects people's daily lives.

Keep it empowering - teaching them to think critically, not making them more suspicious or anxious.]

Format each question on its own line, without numbers or bullets. Make each one specific to THIS topic and tap into deep parental/family protection instincts. Channel their catastrophic thinking - these people assume the worst and need specific reassurance.]

If the claim/concern is unclear, start with:
"I'm not sure what specific claim you'd like me to check. Based on your input, you might be concerned about [guess]. If that's not right, please clarify what claim you'd like verified."

Remember: Start reassuring, frame everything positively (what to do, not what to avoid), be specific about what's safe vs what needs care, end on empowerment not fear, and keep basic vs. extra precautions completely separate with no overlap.

IMPORTANT: If this claim is about a specific law, policy, regulation, or legal issue:
- Identify the specific bill/law number if possible
- Explain exactly what the law does and doesn't do
- Provide technical details about scope, limitations, and exceptions
- Address what this means for different types of water systems
- Be specific about timelines, affected parties, and enforcement mechanisms
- Include nuanced analysis of the implications for consumers

Focus on providing the detailed, technical accuracy that an informed person would want to know about this specific policy or legal claim.`;
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
          
          const systemPrompt = getSystemPrompt(analysisMode, false, false);
          const userPrompt = `Please analyze this article content:

            Title: ${extractedData.title}
            Content: ${extractedData.content}
            Source URL: ${contentText}
            Word Count: ${extractedData.wordCount}
            Note: Content extracted directly from web page, may have some formatting issues.`;

          await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
          
        } catch (fetchError) {
          // If direct fetch fails, inform user about CORS
          setError(`Could not fetch article content (likely CORS blocked): ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}. Please copy and paste the article text instead.`);
          setLoading(false);
          return;
        }
      } else {
        // For analyze mode or non-URL content, use the text directly
        setAnalysisStep(isPreFactChecked ? 'Analyzing existing fact-check...' : 'Analyzing content...');
        const isFollowUpQuestion = !!previousClaim;
        const systemPrompt = getSystemPrompt(analysisMode, isPreFactChecked, isFollowUpQuestion);
        
        let userPrompt: string;
        if (isPreFactChecked) {
          userPrompt = `SCENARIO: A user found this fact-check online and wants to know if they should trust it.

YOUR ROLE: You're a skeptical expert who HATES bad fact-checks that don't cite sources.

THE FACT-CHECK THEY FOUND:
${contentText}

YOUR TASK: Tear apart this fact-check for having ZERO sources. Do NOT verify if the claims are true - you CAN'T without sources. Instead, explain why this is a terrible fact-check that no one should trust.

Start your response with: "This fact-check is fundamentally flawed because..."`;
        } else if (previousClaim) {
          // This is a follow-up question
          userPrompt = `CONTEXT: A user previously asked about: "${previousClaim}"

They received a fact-check analysis and now have a follow-up concern: "${contentText}"

IMPORTANT: This is NOT a new standalone claim. This is a follow-up question about "${previousClaim}". 

Your response should:
1. Acknowledge this is about their original concern: "${previousClaim}"
2. Address their specific follow-up worry: "${contentText}"
3. Provide reassurance and practical guidance related to the original topic

Please analyze this follow-up concern in the context of their original question.`;
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
          model: 'claude-opus-4-1-20250805',
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
        
        // Extract follow-up questions if present
        const followUpMatch = reply.match(/\*\*You might be wondering:\*\*\s*\n(.+?)(?=\n\n|\n\*\*|$)/s);
        if (followUpMatch) {
          const questionsText = followUpMatch[1].trim();
          const questions = questionsText.split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('*') && !q.match(/^question \d/i));
          
          if (questions.length > 0) {
            setFollowUpQuestions(questions);
            setShowFollowUp(true);
          }
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
    if (previousClaim) {
      // If this is a follow-up, go back to the original claim's response page
      router.push({
        pathname: '/response',
        params: {
          text: previousClaim,
          mode: currentMode
        }
      });
    } else {
      // If this is not a follow-up, go back to text input with the original text
      router.push({
        pathname: '/text',
        params: {
          initialText: inputText,
          mode: currentMode
        }
      });
    }
  };

  const handleNext = () => {
    router.push('/followup');
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
        {response && !loading && (
          <TouchableOpacity 
            onPress={handleSaveButtonPress} 
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>{isSaved ? '✓' : '💾'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {previousClaim && (
          <View style={styles.followUpFromSection}>
            <Text style={styles.followUpFromLabel}>Follow-up to:</Text>
            <Text style={styles.followUpFromText}>{previousClaim as string}</Text>
          </View>
        )}

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
              <Text style={styles.loadingText}>{analysisStep || 'Analyzing...'}</Text>
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
              <Text style={styles.responseText}>
                {response.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    // This is a bold section - remove ** and make it bold
                    const boldText = part.replace(/\*\*/g, '');
                    return (
                      <Text key={index} style={styles.boldText}>
                        {boldText}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
              
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

              {showFollowUp && followUpQuestions.length > 0 && (
                <View style={styles.followUpContainer}>
                  <Text style={styles.followUpLabel}>You might be wondering:</Text>
                  {followUpQuestions.map((question, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[styles.followUpButton, index > 0 && styles.followUpButtonSpacing]}
                      onPress={() => {
                        // Navigate to response page with the follow-up question
                        router.push({
                          pathname: '/response',
                          params: {
                            text: question.replace(/["""]/g, ''),
                            mode: 'analyze',
                            previousClaim: inputText
                          }
                        });
                      }}
                    >
                      <Text style={styles.followUpQuestion}>{question}</Text>
                      <Text style={styles.followUpArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}

          {!inputText && !loading && (
            <Text style={styles.noContentText}>
              No content provided for analysis. Please go back and enter some content.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Saved Modal */}
      <Modal
        visible={showSavedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSavedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✓ Already Saved</Text>
            <Text style={styles.modalMessage}>
              This analysis has been saved to your insights. You can find it in your saved insights section.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSavedModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  followUpFromSection: {
    marginBottom: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  followUpFromLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  followUpFromText: {
    fontSize: 14,
    color: '#0D47A1',
    fontStyle: 'italic',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  boldText: {
    fontWeight: 'bold',
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
  followUpContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e8f0',
  },
  followUpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  followUpButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  followUpButtonSpacing: {
    marginTop: 12,
  },
  followUpQuestion: {
    fontSize: 16,
    color: '#32535F',
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
  followUpArrow: {
    fontSize: 20,
    color: '#32535F',
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#32535F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});