// utils/simpleSearch.ts - Enhanced search with long text handling
const BRAVE_API_KEY = process.env.EXPO_PUBLIC_BRAVE_API_KEY || '';

// Brave Search has query limits - typically around 400-500 characters
const MAX_QUERY_LENGTH = 400;
const MAX_CHUNK_LENGTH = 200; // For multi-query approach

interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

// Extract key terms from long text for search
function extractKeyTerms(text: string, maxLength: number = MAX_QUERY_LENGTH): string {
  // Remove common words and focus on meaningful terms
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  // Extract important patterns first
  const patterns = [
    // Dates and times
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    // Numbers with units
    /\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:percent|%|million|billion|dollars?|\$)\b/gi,
    // Proper nouns (capitalized words)
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
    // Technical terms or acronyms
    /\b[A-Z]{2,}\b/g,
    // Company/organization indicators
    /\b\w+(?:\s+(?:Inc|Corp|LLC|Ltd|Company|Co)\b)/gi
  ];

  let keyTerms: string[] = [];
  
  // Extract pattern matches
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    keyTerms.push(...matches);
  });

  // Extract other meaningful words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.has(word) &&
      !/^\d+$/.test(word) // Skip pure numbers
    );

  // Add high-value words
  keyTerms.push(...words.slice(0, 10));

  // Join and truncate to max length
  let query = keyTerms.join(' ');
  if (query.length > maxLength) {
    query = query.substring(0, maxLength).trim();
    // Ensure we don't cut off mid-word
    const lastSpace = query.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      query = query.substring(0, lastSpace);
    }
  }

  return query;
}

// Split long text into searchable chunks
function createSearchChunks(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if ((currentChunk + ' ' + trimmedSentence).length <= MAX_CHUNK_LENGTH) {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = trimmedSentence.substring(0, MAX_CHUNK_LENGTH);
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.slice(0, 3); // Limit to 3 chunks to avoid too many API calls
}

// Enhanced search function with multiple strategies
export async function searchRecent(query: string): Promise<SearchResult[]> {
  console.log('Original query length:', query.length);
  
  if (!BRAVE_API_KEY) {
    console.log('No Brave API key, skipping search');
    return [];
  }

  // Strategy 1: If query is short enough, use as-is
  if (query.length <= MAX_QUERY_LENGTH) {
    return await performSingleSearch(query);
  }

  // Strategy 2: Extract key terms for a focused search
  const keyTermsQuery = extractKeyTerms(query);
  console.log('Key terms extracted:', keyTermsQuery);
  
  if (keyTermsQuery) {
    const keyTermsResults = await performSingleSearch(keyTermsQuery);
    if (keyTermsResults.length > 0) {
      return keyTermsResults;
    }
  }

  // Strategy 3: Multi-chunk search as fallback
  const chunks = createSearchChunks(query);
  console.log('Created chunks:', chunks.length);
  
  const allResults: SearchResult[] = [];
  
  for (const chunk of chunks) {
    const chunkResults = await performSingleSearch(chunk);
    allResults.push(...chunkResults);
    
    // Add small delay between requests to be respectful
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Deduplicate results by URL
  const uniqueResults = allResults.filter((result, index, self) =>
    index === self.findIndex(r => r.url === result.url)
  );

  return uniqueResults.slice(0, 5); // Return top 5 unique results
}

// Core search function
async function performSingleSearch(query: string): Promise<SearchResult[]> {
  const encodedQuery = encodeURIComponent(query);
  console.log('Searching for:', query);
  console.log('Encoded length:', encodedQuery.length);

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodedQuery}&count=5`,
      {
        headers: {
          'X-Subscription-Token': BRAVE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Brave search failed:', response.status, response.statusText);
      
      // Log more details for 422 errors
      if (response.status === 422) {
        const errorText = await response.text();
        console.error('422 Error details:', errorText);
        console.error('Query that caused 422:', query);
        console.error('Query length:', query.length);
      }
      
      return [];
    }

    const data = await response.json();

    return data.web?.results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      age: result.page_age
    })) || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Check if a claim needs recent info (unchanged)
export function needsRecentInfo(text: string): boolean {
  const keywords = [
    'announc', 'cancel', 'today', 'yesterday', 'this week', 
    'this month', 'recent', 'just', 'breaking', 'new study',
    'latest', 'update', 'US says', 'government', 'FDA'
  ];
   
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

// Enhanced format function that indicates search strategy used
export function formatSearchResults(results: SearchResult[], claim: string): string {
  if (results.length === 0) return '';
   
  const sourcesText = results.map((result, idx) => 
    `[${idx + 1}] ${result.title}\n   Source: ${result.url}\n   ${result.description}`
  ).join('\n\n');
   
  const searchNote = claim.length > MAX_QUERY_LENGTH 
    ? '\n(Note: Long text was processed using key term extraction for optimal search results)'
    : '';
   
  return `\n\nRECENT SOURCES (found just now):\n${sourcesText}${searchNote}\n\nBased on these recent sources, please analyze the claim. If sources conflict, note that. Cite sources using [1], [2], etc.`;
}