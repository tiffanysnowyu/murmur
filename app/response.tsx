// Updated response.tsx with empathetic prompting and fast source citations
import React, { useState, useEffect, useRef } from 'react';
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
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { insightsStorage } from '../utils/insightsStorage';
import { searchRecent, needsRecentInfo, formatSearchResults } from '../utils/simpleSearch';
import { findSourcesFirst, formatSourceReferences } from '../utils/sourceFirst';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export default function ResponsePage() {
  const { claim, text, mode, previousClaim, savedResponse } = useLocalSearchParams();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [articleData, setArticleData] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedInsightId, setSavedInsightId] = useState<string | null>(null);
  const [foundSources, setFoundSources] = useState<any[]>([]);
  const [stillUneasyResponse, setStillUneasyResponse] = useState<string>('');
  const [stillUneasyLoading, setStillUneasyLoading] = useState<boolean>(false);

  // Animation states
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const analyzeCTAScale = useRef(new Animated.Value(1)).current;
  const doneCTAScale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);
  
  // Summary-specific states
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [expandedClaims, setExpandedClaims] = useState<Set<number>>(new Set());
  const [showSummaryTitle, setShowSummaryTitle] = useState(true);
  const [showCTAs, setShowCTAs] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<{
    article: string;
    overview: string;
    keyClaims: Array<{ title: string; content: string }>;
  }>({ article: '', overview: '', keyClaims: [] });

  const [parsedAnalysis, setParsedAnalysis] = useState<{
    overview: string;
    keyClaims: Array<{ title: string; content: string }>;
    bottomLine: string;
  }>({ overview: '', keyClaims: [], bottomLine: '' });

  // Used to track whether or not we have already called the AI model API (OpenAI or Anthropic)
  const calledExternalModel = useRef(false);

  // Get the text from parameters
  const inputText = (claim || text) as string;
  const currentMode = mode as string;
  const isSummaryMode = currentMode === 'summarize';

  const isUrl = (t: string): boolean => {
    try {
      new URL(t);
      return true;
    } catch {
      return false;
    }
  };

  // Helper function to detect legal/policy claims
  const isLegalPolicyClaim = (t: string): boolean => {
    const keywords = ['law', 'policy', 'regulation', 'bill', 'water', 'legal', 'act', 'legislation'];
    const lowerText = t.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
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
      'what\'s false:',
    ];
    let matchCount = 0;
    for (const pattern of patterns) {
      if (lowerContent.includes(pattern)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return false;
  };

  // Parse summary response
  const parseSummaryResponse = (responseText: string) => {
    const sections = responseText.split(/^##\s+/m).filter(s => s.trim());
    
    let article = '';
    let overview = '';
    const keyClaims: Array<{ title: string; content: string }> = [];

    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const sectionTitle = lines[0].trim().toLowerCase();
      const content = lines.slice(1).join('\n').trim();

      if (sectionTitle === 'article') {
        article = content;
      } else if (sectionTitle === 'overview') {
        overview = content;
      } else if (sectionTitle === 'key claims') {
        // Parse key claims
        const claimMatches = content.matchAll(/\*\*([^*]+)\*\*\n([^*]+)(?=\*\*|$)/g);
        for (const match of claimMatches) {
          keyClaims.push({
            title: match[1].trim(),
            content: match[2].trim()
          });
        }
      }
    });

    setParsedSummary({ article, overview, keyClaims });
  };

  const parseAnalyzeResponse = (responseText: string) => {
    const sections = responseText.split(/^##\s+/m).filter(s => s.trim());

    let splitByBottomLine = responseText.split('Bottom line')
    if (splitByBottomLine.length < 2) {
      splitByBottomLine = responseText.split('Bottom Line')
    }
    let overview = splitByBottomLine[0].replace(':', '').trim()
    let bottomLine = splitByBottomLine.length > 1 ? splitByBottomLine[1].replace(':', '').trim() : ''
    // console.log('BEFORE BOTTOM LINE:', beforeottomLine, '\n\n')
    
   
    // THE CODE IN THIS FUNCTION BELOW HERE IS NOT DOING ANYTHING
    const keyClaims: Array<{ title: string; content: string }> = [];

    // sections.forEach(section => {
    //   const lines = section.trim().split('\n');
    //   const sectionTitle = lines[0].trim().toLowerCase();
    //   const content = lines.slice(1).join('\n').trim();

    //   if (sectionTitle.includes('overview') || sectionTitle.includes('summary')) {
    //     overview = content;
    //   } else if (sectionTitle.includes('bottom line') || sectionTitle.includes('conclusion')) {
    //     bottomLine = content;
    //   } else if (sectionTitle.includes('key') && (sectionTitle.includes('claims') || sectionTitle.includes('findings'))) {
    //     // Parse key claims
    //     const claimMatches = content.matchAll(/\*\*([^*]+)\*\*\n([^*]+)(?=\*\*|$)/g);
    //     for (const match of claimMatches) {
    //       keyClaims.push({
    //         title: match[1].trim(),
    //         content: match[2].trim()
    //       });
    //     }
    //   }
    // });
    // console.log('OVERVIEW:', overview, '\n\n')
    // console.log('BOTTOM LINE:', bottomLine, '\n\n')
    // console.log('KEY CLAIMS:', keyClaims, '\n\n')
    return { overview, keyClaims, bottomLine };
  };

  const toggleClaim = (index: number) => {
    const newExpanded = new Set(expandedClaims);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedClaims(newExpanded);
  };

  // CTA Press animations
  const handleAnalyzeCTAPressIn = () => {
    Animated.spring(analyzeCTAScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleAnalyzeCTAPressOut = () => {
    Animated.spring(analyzeCTAScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleDoneCTAPressIn = () => {
    Animated.spring(doneCTAScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleDoneCTAPressOut = () => {
    Animated.spring(doneCTAScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Save insight to file
  const saveInsight = async () => {
    try {
      const insightId = Date.now().toString();
      const newInsight = {
        id: insightId,
        claim: inputText,
        analysis: response,
        mode: currentMode,
        savedAt: new Date().toISOString(),
        title: articleData?.title || inputText.substring(0, 50) + '...',
        sources: formatSourceReferences(foundSources),
      };
      await insightsStorage.addInsight(newInsight);
      setSavedInsightId(insightId);
      setIsSaved(true);
    } catch (e) {
      console.error('Error saving insight:', e);
      Alert.alert('Error', 'Failed to save insight.');
    }
  };

  // Unsave insight
  const unsaveInsight = async () => {
    try {
      if (savedInsightId) {
        await insightsStorage.deleteInsight(savedInsightId);
        setSavedInsightId(null);
        setIsSaved(false);
      }
    } catch (e) {
      console.error('Error unsaving insight:', e);
      Alert.alert('Error', 'Failed to unsave insight.');
    }
  };

  const handleSaveButtonPress = () => {
    // Start the press animation
    setIsPressed(true);
    
    // Scale up to 28px (28/24 = 1.167)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.167, // 28px / 24px
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
    });
    
    // Toggle save/unsave
    if (isSaved) {
      unsaveInsight();
    } else {
      saveInsight();
    }
  };

  // Direct fetch function (will have CORS limitations)
  const readUrlContent = async (url: string) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const r = await fetch(proxyUrl);
      if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
      const data = await r.json();
      return data.contents;
    } catch (error) {
      try {
        const r = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        const content = await r.text();
        return content;
      } catch (directError) {
        throw new Error(`Failed to read URL content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Extract text content from HTML
  const extractTextFromHtml = (html: string) => {
    try {
      let textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Article';
      return {
        title,
        content: textContent,
        wordCount: textContent.split(' ').length,
        isPaywalled:
          html.toLowerCase().includes('paywall') ||
          html.toLowerCase().includes('subscription') ||
          html.toLowerCase().includes('premium content'),
      };
    } catch {
      throw new Error('Failed to extract text from HTML');
    }
  };

  const getSystemPrompt = (mode: string, isPreFactChecked: boolean = false, isFollowUp: boolean = false) => {
    if (mode === 'summarize') {
      return `You are an expert content analyzer. You will be provided with article content that has been extracted from a web page.

TASK: Provide a comprehensive analysis in EXACTLY this format:

## Article
[Summarize the main content in 2-3 clear sentences]

## Overview
[Provide a comprehensive overview paragraph explaining the main arguments, findings, and significance]

## Key Claims
**[First key claim stated clearly]**
[First sentence explaining this claim. Second sentence with additional context or evidence.]

**[Second key claim stated clearly]**
[First sentence explaining this claim. Second sentence with additional context or evidence.]

**[Third key claim stated clearly]**
[First sentence explaining this claim. Second sentence with additional context or evidence.]

Include 3-5 key claims. Each must have a clear statement followed by exactly two sentences of explanation.

Note: The content may be incomplete due to technical limitations in extraction. Format with clear headings and be thorough with available information.`;
    } else if (isPreFactChecked) {
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

The user previously received a fact-check about a specific topic and now has a follow-up concern. Connect your response to their initial concern and provide targeted reassurance.

Keep your response conversational and focused. Include:
- Acknowledgment of their original concern and how this relates
- Clear, factual answer to their specific follow-up
- Practical guidance if there are actionable steps
- 1-2 credible sources if making health/safety claims
- Reassuring bottom line that ties back to their original question

Be concise and directly address their worry without repeating the full fact-check structure.`;
    } else {
      return `You are an expert fact-checker and health analyst.

CORE PRINCIPLES:
- Provide accurate, evidence-based information
- Start with immediate reassurance for concerning claims
- Focus on what actually matters to the user
- Be warm and empathetic, not clinical or dismissive
- Frame advice positively (what TO do, not what to avoid)
- **CRITICAL: Acknowledge uncertainty and partial truths**
  - If a claim might be partially true, say so
  - If you're uncertain about very recent events, acknowledge this
  - Don't make absolute statements unless you're certain
  - Consider that broad claims might refer to specific recent events
  - For current events claims, note your knowledge cutoff and suggest checking recent news

REASSURANCE FRAMEWORK:
- ALWAYS lead with reassurance when discussing potentially scary events
- Put risks in statistical context (e.g., "You're more likely to...")
- Emphasize long timelines when applicable ("could be centuries away")
- Focus on what WON'T happen to the user personally
- Include historical examples of similar fears that didn't materialize
- Use calming language: "extremely unlikely", "distant possibility", "scientists monitor this closely"

**Perspective that reduces anxiety** (ALWAYS include for scary topics):
- Statistical comparisons to everyday risks the user accepts without worry
- Timeline context ("In your lifetime, this is extremely unlikely")
- What scientists are doing to monitor/prepare (provides sense of control)
- Historical context showing humanity has managed similar risks
- Why this particular story is newsworthy but not personally threatening
- Specific reasons why the user doesn't need to change their behavior

CALMING REQUIREMENT:
Every response about potentially scary events MUST include:
- Opening reassurance about timeline/probability
- A "Why you don't need to worry" section with 3+ specific points
- Statistical context comparing to accepted daily risks
- Emphasis that no immediate action is needed
- Closing reminder that the user is safe

ANXIETY REDUCTION PRIORITIES:
1. If the claim involves a catastrophic event, IMMEDIATELY state how unlikely/distant it is
2. Include at least 3 specific reasons not to worry
3. Frame preparedness as "peace of mind" not "necessary for survival"
4. Emphasize that experts aren't worried about immediate risks
5. Include phrases like:
   - "Here's why you can relax about this..."
   - "The important context that headlines miss..."
   - "What this actually means for your daily life (spoiler: nothing needs to change)..."

CITATION STYLE:
- Use natural, conversational inline citations: "According to the CDC...", "Recent WHO data shows...", "Researchers found (Nature, 2024)..."
- Avoid academic-style numbered citations that feel stiff
- Only cite when making specific factual claims
- Don't over-cite - once per major claim is enough
- Make citations part of the natural flow, not interruptions

POLITICAL CONTENT FILTER:
If the claim is political but NOT related to environmental, climate, or public health policy, respond ONLY with:
"This claim may be politically important, but Murmur focuses on health, climate, and environmental information. If you're feeling overwhelmed, we're here to help with claims that impact your safety, wellbeing, and understanding of the world."

RESPONSE APPROACH:
Dynamically structure your response based on what would be most helpful. Consider including these elements ONLY when relevant:

**Opening reassurance** - Start with 1-2 sentences of immediate reassurance if the claim might cause anxiety

**Core fact-check** - Address what's true, what's misleading, or what the real situation is. Be specific with:
- Statistics and numbers when they help provide perspective
- Clear explanations of what actually affects the user
- Regional specifics if location matters (be clear about what areas are/aren't affected)
- **For claims about recent events**: Note if you cannot verify very recent developments (within the last few weeks)
- **For broad claims**: Consider if they might refer to specific programs/instances rather than everything
- **Acknowledge partial truths**: If some aspect might be true while the broader claim is false, explain the nuance

**Perspective and context** (include when a true claim might be overwhelming):
- Historical context showing how we've successfully managed similar situations
- How millions of people safely navigate this every day
- Don't create a section for this unless it truly helps reduce anxiety

**Practical actions** (include when there are clear, simple steps):
- Specific, positive actions they can take
- Focus on immediate, simple steps

**Sources** - Include 2-4 credible sources for key health/safety claims

**Bottom line** - End with reassurance and empowerment.`;
    }
  };

  const analyzeContentWithClaude = async (contentText: string, analysisMode: string) => {
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const isPreFactChecked = detectPreFactCheckedContent(contentText);
      if (isPreFactChecked && analysisMode === 'analyze') {
        setAnalysisStep('Detected existing fact-check. Preparing meta-analysis...');
      }

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
            setError(
              'Could not extract sufficient content from this URL. This might be due to CORS restrictions or the site blocking automated access.'
            );
            setLoading(false);
            return;
          }
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
          setError(
            `Could not fetch article content (likely CORS blocked): ${
              fetchError instanceof Error ? fetchError.message : 'Unknown error'
            }. Please copy and paste the article text instead.`
          );
          setLoading(false);
          return;
        }
      } else {
        const isFollowUpQuestion = !!previousClaim;

        if (!isPreFactChecked && !isFollowUpQuestion) {
          setAnalysisStep('Quick search...');
          let sourceResult: any = null;
          try {
            const sourcePromise = findSourcesFirst(contentText);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000));
            sourceResult = (await Promise.race([sourcePromise, timeout])) as any;
            setFoundSources(sourceResult.sources);
          } catch {
          }

          let searchResults: any[] = [];
          if (needsRecentInfo(contentText)) {
            setAnalysisStep('Checking recent sources...');
            try {
              searchResults = await searchRecent(contentText);
            } catch (e) {
              console.log('Recent search failed:', e);
            }
          }

          setAnalysisStep('Analyzing...');
          const systemPrompt = getSystemPrompt(analysisMode, false, false);

          let userPrompt = `Please analyze this content: "${contentText}"

NOTE: This is a direct user query, NOT from an external media source. Do NOT include the "Think critically about what you're reading" section.`;

          if (searchResults.length > 0) {
            userPrompt += formatSearchResults(searchResults, contentText);
          }

          if (sourceResult && sourceResult.sources.length > 0) {
            const sourceText = sourceResult.sources
              .map(
                (source: any, i: number) => `Source ${i + 1}:
URL: ${source.url}
Title: ${source.title}
Preview: ${source.snippet}`
              )
              .join('\n\n');

            userPrompt += `\n\nIMPORTANT: You have EXACTLY ${sourceResult.sources.length} sources available for citation. DO NOT cite any sources beyond these ${sourceResult.sources.length}.\n`;
            userPrompt += `\nAvailable sources:\n${sourceText}`;
            userPrompt += `\n\nWhen citing these sources, use natural inline citations based on the organization/publication name from the URL. Make citations conversational (no [1], [2], etc.).`;
          }

          await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
        } else {
          setAnalysisStep(isPreFactChecked ? 'Analyzing existing fact-check...' : 'Analyzing follow-up...');
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
            userPrompt = `CONTEXT: A user previously asked about: "${previousClaim}"

They received a fact-check analysis and now have a follow-up concern: "${contentText}"

IMPORTANT: This is NOT a new standalone claim. This is a follow-up question about "${previousClaim}". 

Your response should:
1. Acknowledge this is about their original concern: "${previousClaim}"
2. Address their specific follow-up worry: "${contentText}"
3. Provide reassurance and practical guidance related to the original topic

Please analyze this follow-up concern in the context of their original question.`;
          } else if (isUrl(contentText)) {
            userPrompt = `ANALYSIS REQUEST: A user is concerned about content at this URL: ${contentText}

IMPORTANT CONTEXT: This is a real article/source they're asking you to analyze. They want to understand the claims, what's accurate, and what to actually do.

Your task: Provide a thorough, reassuring fact-check of the likely claims from this source.`;
          } else if (isLegalPolicyClaim(contentText)) {
            userPrompt = `Please analyze this content: "${contentText}"

If this is about a law/policy, include bill numbers, scope, timelines, exceptions, and implications for consumers.`;
          } else {
            userPrompt = `Please analyze this content: "${contentText}"`;
          }

          await callClaudeAPI(systemPrompt, userPrompt, analysisMode);
        }
      }
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAnalysisStep('');
      setLoading(false);
      setFoundSources([]);
    }
  };

  const callClaudeAPI = async (systemPrompt: string, userPrompt: string, analysisMode: string) => {
    try {
      if (!CLAUDE_API_KEY) throw new Error('Claude API key not found. Please add EXPO_PUBLIC_CLAUDE_API_KEY to your .env file');
      if (!CLAUDE_API_KEY.startsWith('sk-ant-')) throw new Error('Invalid Claude API key format. Key should start with sk-ant-');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
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
        if (foundSources.length > 0) {
          const responseWithSources = reply + formatSourceReferences(foundSources);
          setResponse(responseWithSources);
        } else {
          setResponse(reply);
        }
        
        // Parse summary if in summary mode
        if (analysisMode === 'summarize') {
          parseSummaryResponse(reply);
        } else {
          // Parse analyze response for structured display
          const parsed = parseAnalyzeResponse(reply);
          setParsedAnalysis(parsed);
        }
        
        setAnalysisStep('');
      } else {
        throw new Error('No response received from Claude.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have already analyzed content, don't do it again
    if (calledExternalModel.current) return;

    // If we have a saved response, use it instead of calling API
    if (savedResponse && typeof savedResponse === 'string') {
      setResponse(savedResponse);
      const analysisMode = currentMode || 'analyze';
      
      // Parse the saved response
      if (analysisMode === 'summarize') {
        parseSummaryResponse(savedResponse);
      } else {
        const parsed = parseAnalyzeResponse(savedResponse);
        setParsedAnalysis(parsed);
      }
      
      calledExternalModel.current = true;
      return;
    }

    if (inputText && typeof inputText === 'string') {
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithClaude(inputText, analysisMode);
      calledExternalModel.current = true;
    }
  }, [inputText, currentMode, savedResponse]);

  const handleRetry = () => {
    if (inputText && typeof inputText === 'string') {
      setError('');
      setFoundSources([]);
      const analysisMode = currentMode || 'analyze';
      analyzeContentWithClaude(inputText, analysisMode);
    }
  };

  const handleAnalyzeClaims = () => {
    // Analyze the original input text, not the summary
    if (inputText) {
      router.push({
        pathname: '/response',
        params: { 
          text: inputText, 
          mode: 'analyze'
        },
      });
    }
  };

  const goBack = () => {
    console.log(`\nGO BACK CALLED WITH SAVED RESPONSE ${savedResponse} PREVIOUS CLAIM ${previousClaim} MODE ${currentMode}\n`)
    if (savedResponse) {
      router.push('/insights');
    } else if (previousClaim) {
      router.push({
        pathname: '/response',
        params: { text: previousClaim, mode: currentMode },
      });
    } else {
      // router.push({
      //   pathname: '/text',
      //   params: { initialText: inputText, mode: currentMode },
      // });
      router.back()
    }
  };

  const fetchStillUneasyResponse = async () => {
    try {
      setStillUneasyLoading(true);
      
      // Simulate an API call - replace this with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This is a placeholder response - replace with actual API call
      const response = "Here's some additional guidance to help ease your concerns...";
      setStillUneasyResponse(response);
      
    } catch (error) {
      console.error('Error fetching still uneasy response:', error);
      setStillUneasyResponse('Sorry, we encountered an error. Please try again.');
    } finally {
      setStillUneasyLoading(false);
    }
  };

  const getTitle = () => {
    const isPreFactChecked = inputText && detectPreFactCheckedContent(inputText);
    if (isSummaryMode) return 'Summary';
    if (isPreFactChecked) return 'Fact-Check Analysis';
    return 'Analysis';
  };




 

  // =========================
  //   RENDER FOR SUMMARY MODE
  // =========================
  // Show loading state for summary mode
  if (isSummaryMode && loading) {
    return (
      <View style={styles.container}>
        <View style={styles.summaryHeader}>
          <Pressable style={styles.summaryBackButton} onPress={goBack}>
            <Image source={require('../assets/images/chevron_back.png')} style={styles.summaryChevron} />
            <Text style={styles.summaryBackText}>{savedResponse ? 'Saved Insights' : 'Back'}</Text>
          </Pressable>
          
          <Text style={styles.summaryTitle}>Summary</Text>
          
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingCenterContainer}>
          <ActivityIndicator size="large" color="#32535F" />
          <Text style={styles.loadingText}>{analysisStep || 'Analyzing...'}</Text>
        </View>
      </View>
    );
  }

  if (isSummaryMode && !loading && !error && parsedSummary.article) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.summaryHeader, !showSummaryTitle && styles.summaryHeaderPinned]}>
          <Pressable style={styles.summaryBackButton} onPress={goBack}>
            <Image source={require('../assets/images/chevron_back.png')} style={styles.summaryChevron} />
            <Text style={styles.summaryBackText}>{savedResponse ? 'Saved Insights' : 'Back'}</Text>
          </Pressable>

          {showSummaryTitle ? (
            <View style={styles.summaryArea}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Pressable style={styles.summarySaveButton} onPress={handleSaveButtonPress}>
                <Animated.Image 
                  source={(isSaved || isPressed || savedResponse) ? require('../assets/images/save_summ_filled.png') : require('../assets/images/save_summ.png')} 
                  style={[
                    styles.summarySaveIcon,
                    {
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.summarySaveButtonPinned} onPress={handleSaveButtonPress}>
              <Animated.Image 
                source={(isSaved || isPressed || savedResponse) ? require('../assets/images/save_summ_filled.png') : require('../assets/images/save_summ.png')} 
                style={[
                  styles.summarySaveIcon,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              />
            </Pressable>
          )}
        </View>

        <ScrollView 
          style={styles.summaryContent} 
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
            const scrollY = contentOffset.y;
            const scrollHeight = contentSize.height;
            const screenHeight = layoutMeasurement.height;
            
            // Hide title after scrolling 20px
            setShowSummaryTitle(scrollY < 20);
            
            // Show CTAs when scrolled past a certain point (e.g., 300px)
            setShowCTAs(scrollY > 300);
          }}
          scrollEventThrottle={16}
        >
          {/* Article Section */}
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Article</Text>
            <View style={styles.summaryArticleContainer}>
              <Text 
                style={styles.summaryArticleText}
                numberOfLines={showFullArticle ? undefined : 3}
              >
                {inputText}
              </Text>
            </View>
            {!showFullArticle && (
              <Pressable onPress={() => setShowFullArticle(true)}>
                <Text style={styles.summaryMoreButton}>More</Text>
              </Pressable>
            )}
            {showFullArticle && (
              <Pressable onPress={() => setShowFullArticle(false)}>
                <Text style={styles.summaryMoreButton}>Less</Text>
              </Pressable>
            )}
          </View>

          {/* Divider */}
          <View style={styles.summaryDivider} />

          {/* Overview Section */}
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Overview</Text>
            <Text style={styles.summaryOverviewText}>
              {parsedSummary.overview}
            </Text>
          </View>

          {/* Key Claims Section */}
          {parsedSummary.keyClaims.length > 0 && (
            <View style={[styles.summarySection, styles.keyClaimsSection]}>
              <Text style={styles.summarySectionTitle}>Key Claims</Text>
              
              {parsedSummary.keyClaims.map((claim, index) => (
                <Pressable 
                  key={index}
                  style={styles.claimContainer}
                  onPress={() => toggleClaim(index)}
                >
                  <View style={styles.claimHeader}>
                    <Text style={styles.claimTitle}>
                      {claim.title}
                    </Text>
                    <Image 
                      source={expandedClaims.has(index) 
                        ? require('../assets/images/chevron_summ.png') 
                        : require('../assets/images/chevron_list.png')
                      }
                      style={styles.claimChevronImage}
                    />
                  </View>
                  
                  {expandedClaims.has(index) && (
                    <View style={styles.explanationContentBox}>
                      <Text style={styles.explanationHeader}>Explanation</Text>
                      {(() => {
                        // Split content into sentences accounting for abbreviations and edge cases
                        const splitIntoSentences = (text: string) => {
                          // Common abbreviations that shouldn't trigger sentence breaks
                          const abbreviations = [
                            'u.s.', 'u.k.', 'e.g.', 'i.e.', 'etc.', 'vs.', 'mr.', 'mrs.', 'ms.', 'dr.', 'prof.',
                            'inc.', 'ltd.', 'corp.', 'co.', 'govt.', 'dept.', 'min.', 'max.', 'approx.',
                            'a.m.', 'p.m.', 'b.c.', 'a.d.', 'ph.d.', 'm.d.', 'b.a.', 'm.a.', 'j.d.',
                            'no.', 'vol.', 'ch.', 'sec.', 'fig.', 'ref.', 'ed.', 'rev.', 'st.', 'ave.',
                            'jan.', 'feb.', 'mar.', 'apr.', 'jun.', 'jul.', 'aug.', 'sep.', 'oct.', 'nov.', 'dec.'
                          ];
                          
                          // Replace abbreviations temporarily with placeholders
                          let tempText = text;
                          const placeholders: { [key: string]: string } = {};
                          abbreviations.forEach((abbr, index) => {
                            const placeholder = `__ABBR_${index}__`;
                            const regex = new RegExp(abbr.replace(/\./g, '\\.'), 'gi');
                            tempText = tempText.replace(regex, (match) => {
                              placeholders[placeholder] = match;
                              return placeholder;
                            });
                          });
                          
                          // Split on sentence-ending punctuation followed by space and capital letter
                          // or at the end of text
                          const sentences = tempText
                            .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/)
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                          
                          // Restore abbreviations
                          return sentences.map(sentence => {
                            let restored = sentence;
                            Object.entries(placeholders).forEach(([placeholder, original]) => {
                              restored = restored.replace(new RegExp(placeholder, 'g'), original);
                            });
                            return restored;
                          });
                        };
                        
                        const sentences = splitIntoSentences(claim.content).slice(0, 2);
                        
                        return sentences.map((sentence, sentenceIndex) => (
                          <React.Fragment key={sentenceIndex}>
                            <View style={styles.bulletPointContainer}>
                              <Text style={styles.bulletPoint}>•</Text>
                              <Text style={styles.claimText}>
                                {sentence}{sentence.match(/[.!?]$/) ? '' : '.'}
                              </Text>
                            </View>
                            {sentenceIndex < sentences.length - 1 && (
                              <View style={styles.claimDivider} />
                            )}
                          </React.Fragment>
                        ));
                      })()}
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* CTA Buttons at the bottom */}
          {showCTAs && !savedResponse && (
            <View style={styles.ctaContainer}>
              <Pressable 
                style={styles.analyzeCTA} 
                onPress={handleAnalyzeClaims}
                onPressIn={handleAnalyzeCTAPressIn}
                onPressOut={handleAnalyzeCTAPressOut}
              >
                <Animated.View style={{ transform: [{ scale: analyzeCTAScale }] }}>
                  <Text style={styles.analyzeCtaText}>Analyze these claims</Text>
                </Animated.View>
              </Pressable>
              
              <Pressable 
                style={styles.doneCTA} 
                onPress={() => router.dismissAll()}
                onPressIn={handleDoneCTAPressIn}
                onPressOut={handleDoneCTAPressOut}
              >
                <Animated.View style={{ transform: [{ scale: doneCTAScale }] }}>
                  <Text style={styles.doneCtaText}>Done</Text>
                </Animated.View>
              </Pressable>
            </View>
          )}
        </ScrollView>

      </View>
    );
  }

  // =========================
  //   REGULAR RENDER (ANALYSIS MODE)
  // =========================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.summaryHeader, !showSummaryTitle && styles.summaryHeaderPinned]}>
        <Pressable style={styles.summaryBackButton} onPress={goBack}>
          <Image source={require('../assets/images/chevron_back.png')} style={styles.summaryChevron} />
          <Text style={styles.summaryBackText}>Back</Text>
        </Pressable>

        {showSummaryTitle ? (
          <View style={styles.summaryArea}>
            <Text style={styles.summaryTitle}>{getTitle()}</Text>
            {response && !loading && (
              <Pressable style={styles.summarySaveButton} onPress={handleSaveButtonPress}>
                <Animated.Image 
                  source={(isSaved || isPressed || savedResponse) ? require('../assets/images/save_analysis_filled.png') : require('../assets/images/save_analysis.png')} 
                  style={[
                    styles.summarySaveIcon,
                    {
                      transform: [{ scale: scaleAnim }]
                    }
                  ]}
                />
              </Pressable>
            )}
          </View>
        ) : (
          response && !loading && (
            <Pressable style={styles.summarySaveButtonPinned} onPress={handleSaveButtonPress}>
              <Animated.Image 
                source={(isSaved || isPressed || savedResponse) ? require('../assets/images/save_analysis_filled.png') : require('../assets/images/save_analysis.png')} 
                style={[
                  styles.summarySaveIcon,
                  {
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              />
            </Pressable>
          )
        )}
      </View>

      <ScrollView 
        style={styles.summaryContent} 
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          setShowSummaryTitle(scrollY < 20);
          setShowCTAs(scrollY > 300);
        }}
        scrollEventThrottle={16}
      >
        {previousClaim && (
          <View style={styles.followUpFromSection}>
            <Text style={styles.followUpFromLabel}>Follow-up to:</Text>
            <Text style={styles.followUpFromText}>{previousClaim as string}</Text>
          </View>
        )}

        {/* Content to Analyze Section */}
        {inputText && (
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Content</Text>
            <View style={styles.summaryArticleContainer}>
              <Text 
                style={styles.summaryArticleText}
                numberOfLines={showFullArticle ? undefined : 3}
              >
                {inputText}
              </Text>
            </View>
            {!showFullArticle && (
              <Pressable onPress={() => setShowFullArticle(true)}>
                <Text style={[styles.summaryMoreButton, { color: '#7A42F4' }]}>More</Text>
              </Pressable>
            )}
            {showFullArticle && (
              <Pressable onPress={() => setShowFullArticle(false)}>
                <Text style={[styles.summaryMoreButton, { color: '#7A42F4' }]}>Less</Text>
              </Pressable>
            )}
          </View>
        )}


        {articleData && isSummaryMode && (
          <View style={styles.articleInfoSection}>
            <Text style={styles.articleInfoTitle}>📄 Article Extracted</Text>
            <Text style={styles.articleTitle}>{articleData.title}</Text>
            <Text style={styles.articleMeta}>
              {articleData.wordCount} words • {articleData.isPaywalled ? '🔒 May be paywalled' : '✅ Content extracted'}
            </Text>
            <Text style={styles.warningText}>⚠️ Note: Content extracted directly from web page. Some sites may block this method.</Text>
          </View>
        )}

        {/* Fact-Check Results Section */}
        <View style={[styles.summarySection]}>
          <Text style={styles.summarySectionTitle}>
            {inputText && detectPreFactCheckedContent(inputText)
              ? 'Meta-Analysis Results'
              : 'Fact-Check Results'}
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

          {response && !loading && parsedAnalysis.overview && (
            <View>
              <Text style={styles.summaryOverviewText}>
                {parsedAnalysis.overview}
              </Text>
            </View>
          )}

          {response && !loading && !parsedAnalysis.overview && (
            <View>
              <Text style={styles.summaryOverviewText}>
                {response}
              </Text>
            </View>
          )}
        </View>

        {/* Key Claims Section */}
        {response && !loading && parsedAnalysis.keyClaims.length > 0 && (
          <View style={[styles.summarySection, { marginBottom: 78 }]}>
            <Text style={styles.summarySectionTitle}>Key Claims</Text>
            
            {parsedAnalysis.keyClaims.map((claim, index) => (
              <Pressable 
                key={index}
                style={styles.claimContainer}
                onPress={() => toggleClaim(index)}
              >
                <View style={styles.claimHeader}>
                  <Text style={styles.claimTitle}>
                    {claim.title}
                  </Text>
                  <Image 
                    source={expandedClaims.has(index) 
                      ? require('../assets/images/chevron_analysis.png') 
                      : require('../assets/images/chevron_list.png')
                    }
                    style={styles.claimChevronImage}
                  />
                </View>
                
                {expandedClaims.has(index) && (
                  <View style={styles.explanationContentBox}>
                    <Text style={styles.explanationHeader}>Explanation</Text>
                    {(() => {
                      // Split content into sentences accounting for abbreviations and edge cases
                      const splitIntoSentences = (text: string) => {
                        // Common abbreviations that shouldn't trigger sentence breaks
                        const abbreviations = [
                          'u.s.', 'u.k.', 'e.g.', 'i.e.', 'etc.', 'vs.', 'mr.', 'mrs.', 'ms.', 'dr.', 'prof.',
                          'inc.', 'ltd.', 'corp.', 'co.', 'govt.', 'dept.', 'min.', 'max.', 'approx.',
                          'ft.', 'st.', 'ave.', 'blvd.', 'rd.', 'no.', 'vol.', 'p.', 'pp.', 'fig.',
                          'jan.', 'feb.', 'mar.', 'apr.', 'jun.', 'jul.', 'aug.', 'sep.', 'sept.', 
                          'oct.', 'nov.', 'dec.', 'mon.', 'tue.', 'wed.', 'thu.', 'fri.', 'sat.', 'sun.'
                        ];
                        
                        // Create placeholders for abbreviations
                        const placeholders: { [key: string]: string } = {};
                        let tempText = text.toLowerCase();
                        
                        abbreviations.forEach((abbr, index) => {
                          const placeholder = `__ABBR_${index}__`;
                          const regex = new RegExp(abbr.replace('.', '\\.'), 'gi');
                          placeholders[placeholder] = abbr;
                          tempText = tempText.replace(regex, placeholder);
                        });
                        
                        // Split into sentences
                        const sentences = tempText
                          .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/)
                          .map(s => s.trim())
                          .filter(s => s.length > 0);
                        
                        // Restore abbreviations
                        return sentences.map(sentence => {
                          let restored = sentence;
                          Object.entries(placeholders).forEach(([placeholder, original]) => {
                            restored = restored.replace(new RegExp(placeholder, 'g'), original);
                          });
                          return restored;
                        });
                      };
                      
                      const sentences = splitIntoSentences(claim.content).slice(0, 2);
                      
                      return sentences.map((sentence, sentenceIndex) => (
                        <React.Fragment key={sentenceIndex}>
                          <View style={styles.bulletPointContainer}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.claimText}>
                              {sentence}{sentence.match(/[.!?]$/) ? '' : '.'}
                            </Text>
                          </View>
                          {sentenceIndex < sentences.length - 1 && (
                            <View style={styles.claimDivider} />
                          )}
                        </React.Fragment>
                      ));
                    })()}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Bottom Line Section */}
        {response && !loading && parsedAnalysis.bottomLine && (
          <View style={[styles.summarySection]}>
            <Text style={styles.summarySectionTitle}>Bottom Line</Text>
            <View>
              <Text style={styles.summaryOverviewText}>
                {parsedAnalysis.bottomLine}
              </Text>
            </View>
          </View>
        )}

        {!loading && 
          <View style={[styles.summarySection, { marginBottom: 78 }]}>
            <View style={styles.bottomLineDivider} />
            <Pressable onPress={fetchStillUneasyResponse}>
              <Text style={[styles.summaryMoreButton, { color: '#7A42F4' }]}>Still uneasy?</Text>
            </Pressable>
            
            {stillUneasyLoading && (
              <View style={styles.stillUneasyLoadingContainer}>
                <ActivityIndicator size="small" color="#7A42F4" />
              </View>
            )}
            
            {stillUneasyResponse && (
              <View style={styles.stillUneasyResponseContainer}>
                <Text style={styles.stillUneasyResponseText}>{stillUneasyResponse}</Text>
              </View>
            )}
          </View>
        }

        {!inputText && !loading && (
          <Text style={styles.noContentText}>No content provided for analysis. Please go back and enter some content.</Text>
        )}

        {/* CTA Button at the bottom */}
        {showCTAs && !savedResponse && (
          <View style={styles.ctaContainer}>
            <Pressable 
              style={styles.analyzeCTA} 
              onPress={() => router.push('/meditation')}
              onPressIn={handleAnalyzeCTAPressIn}
              onPressOut={handleAnalyzeCTAPressOut}
            >
              <Animated.View style={{ transform: [{ scale: analyzeCTAScale }] }}>
                <Text style={styles.analyzeCtaText}>Continue</Text>
              </Animated.View>
            </Pressable>
          </View>
        )}
      </ScrollView>

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
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowSavedModal(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Summary-specific styles
const BACK_TEXT = "#B0B0B8";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#595959";
const DIVIDER_COLOR = "#D1D1D6";
const LINK_COLOR = "#007AFF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Summary mode styles
  summaryHeader: {
    paddingTop: 72,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
  },
  summaryHeaderPinned: {
    paddingBottom: 16,
  },
  summaryArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
  },
  summaryBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryChevron: {
    width: 24,
    height: 24,
  },
  summaryBackText: {
    fontSize: 17,
    fontFamily: "SF Pro Display",
    color: BACK_TEXT,
    fontWeight: "400",
  },
  summaryTitle: {
    flex: 1,
    fontSize: 32,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    color: TEXT_PRIMARY,
    textAlign: "left",
  },
  summarySaveButton: {
    padding: 0,
  },
  summarySaveButtonPinned: {
    position: 'absolute',
    right: 24, // Adjust for padding to align with page margin
    top: 72, // Vertically center with back button
  },
  summarySaveIcon: {
    width: 24,
    height: 24,
  },
  summaryContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summarySection: {
    marginBottom: 0,
  },
  keyClaimsSection: {
    marginBottom: 72,
  },
  summarySectionTitle: {
    fontSize: 24,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 32,
    marginTop: 48,
  },
  summaryArticleContainer: {
    overflow: 'hidden',
  },
  summaryArticleText: {
    fontSize: 18,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: '#1A1A1A',
    lineHeight: 27, // 150% of 18px
    letterSpacing: -0.198,
  },
  summaryMoreButton: {
    color: '#248E9C',
    fontFamily: "SF Pro Display",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21, // 150% of 14px
    letterSpacing: -0.154,
    alignSelf: 'stretch',
    marginTop: 16,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginTop: 48,
  },
  bottomLineDivider: {
    width: 264,
    height: 1,
    backgroundColor: '#D1D1D6',
    marginTop: 16,
    marginBottom: 16,
  },
  stillUneasyLoadingContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  stillUneasyResponseContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7A42F4',
  },
  stillUneasyResponseText: {
    fontSize: 16,
    fontFamily: 'SF Pro Display',
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 24,
  },
  summaryOverviewText: {
    fontSize: 18,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: '#1A1A1A',
    lineHeight: 27, // 150% of 18px
    letterSpacing: -0.198,
  },
  claimContainer: {
    marginBottom: 0,
  },
  claimHeader: {
    flexDirection: "row",
    width: 345,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 8,
    paddingBottom: 32,
  },
  claimTitle: {
    width: 313,
    color: '#1A1A1A',
    fontFamily: "SF Pro Display",
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 27, // 150% of 18px
    letterSpacing: -0.198,
  },
  claimChevronImage: {
    width: 24,
    height: 24,
  },
  claimContent: {
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: DIVIDER_COLOR,
  },
  claimText: {
    fontSize: 18,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: '#595959',
    lineHeight: 27, // 150% of 18px
    letterSpacing: -0.198,
    textAlign: 'left',
    flex: 1,
    marginBottom: 0,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 0,
  },
  bulletPoint: {
    fontSize: 18,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: '#595959',
    lineHeight: 27,
    letterSpacing: -0.198,
    marginRight: 12,
  },
  claimDivider: {
    width: 264,
    height: 1,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  explanationHeader: {
    alignSelf: 'stretch',
    color: '#5C5C6A',
    fontFamily: 'SF Pro',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30, // 150% of 20px
    letterSpacing: -0.22,
    marginBottom: 24,
  },
  explanationContentBox: {
    width: 393,
    paddingTop: 48,
    paddingHorizontal: 48,
    paddingBottom: 40,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0,
    marginLeft: -24,
    marginRight: -24,
    marginBottom: 72,
    alignSelf: 'center',
  },
  explanationText: {
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: TEXT_SECONDARY,
    lineHeight: 24,
  },
  ctaContainer: {
    paddingVertical: 0,
    gap: 16,
    marginBottom: 64,
  },
  analyzeCTA: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  analyzeCtaText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
  },
  doneCTA: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  doneCtaText: {
    color: "#1A1A1A",
    fontSize: 17,
    fontFamily: "SF Pro Display",
    fontWeight: "600",
  },
  loadingCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal styles for key claims
  claimModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  claimModalText: {
    fontSize: 16,
    fontFamily: "SF Pro Display",
    fontWeight: "400",
    color: TEXT_SECONDARY,
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  
  // Original analysis mode styles
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
  backButton: { marginRight: 16 },
  backButtonText: { fontSize: 16, color: '#32535F', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '600', color: '#333', flex: 1 },
  saveButton: { padding: 8 },
  saveButtonText: { fontSize: 20 },
  content: { flex: 1, padding: 16 },
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
  followUpFromText: { fontSize: 14, color: '#0D47A1', fontStyle: 'italic' },
  inputSection: { marginBottom: 16, backgroundColor: '#f8f9fa', borderRadius: 8, overflow: 'hidden' },
  typeIndicator: { backgroundColor: '#32535F', paddingHorizontal: 16, paddingVertical: 8 },
  preFactCheckedIndicator: { backgroundColor: '#28a745' },
  typeText: { color: 'white', fontSize: 14, fontWeight: '600' },
  inputText: { padding: 16, fontSize: 16, lineHeight: 24, color: '#333' },
  sourceInfoSection: {
    marginBottom: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sourceInfoTitle: { fontSize: 14, fontWeight: '600', color: '#2E7D32', marginBottom: 4 },
  sourceInfoText: { fontSize: 14, color: '#388E3C' },
  articleInfoSection: {
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  articleInfoTitle: { fontSize: 14, fontWeight: '600', color: '#856404', marginBottom: 8 },
  articleTitle: { fontSize: 16, fontWeight: 'bold', color: '#533f03', marginBottom: 4 },
  articleMeta: { fontSize: 14, color: '#856404', marginBottom: 8 },
  warningText: { fontSize: 12, color: '#856404', fontStyle: 'italic' },

  responseSection: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },

  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666', textAlign: 'center', fontWeight: '600' },

  errorContainer: { alignItems: 'center', paddingVertical: 20 },
  errorText: { fontSize: 16, color: '#d32f2f', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#32535F', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

  responseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
  },

  // Titles for H2 sections (outside of collapsibles)
  h2Title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#32535F',
    marginBottom: 8,
  },

  // Simple non-collapsible card
  sectionCard: {
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
  boldText: { fontWeight: 'bold', fontSize: 16, lineHeight: 24, color: '#333' },
  sourceText: { fontWeight: 'bold', color: '#32535F' },

  // Collapsible styles (for sub-items)
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleText: { fontSize: 17, fontWeight: '600', color: '#32535F', flex: 1 },
  expandIcon: { fontSize: 14, color: '#666', marginLeft: 8 },
  sectionSummary: { marginTop: 8, fontSize: 14, color: '#666', lineHeight: 20, fontStyle: 'italic' },
  sectionContent: { padding: 16, backgroundColor: '#ffffff' },

  analyzeButton: {
    backgroundColor: '#32535F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  analyzeButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

  followUpContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e8f0',
  },
  followUpLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
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
  followUpButtonSpacing: { marginTop: 12 },
  followUpQuestion: { fontSize: 16, color: '#32535F', fontWeight: '500', flex: 1, paddingRight: 10 },
  followUpArrow: { fontSize: 20, color: '#32535F', fontWeight: 'bold' },

  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

  noContentText: { fontSize: 16, color: '#666', textAlign: 'center', fontStyle: 'italic', paddingVertical: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#28a745', marginBottom: 12 },
  modalMessage: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  modalButton: { backgroundColor: '#32535F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});