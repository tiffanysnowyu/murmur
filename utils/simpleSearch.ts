// utils/simpleSearch.ts - Minimal search integration
const BRAVE_API_KEY = process.env.EXPO_PUBLIC_BRAVE_API_KEY || '';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

// Simple search function - that's it!
export async function searchRecent(query: string): Promise<SearchResult[]> {
  // Debug: Check API key
  console.log('Brave API key exists:', !!BRAVE_API_KEY);
  console.log('Brave API key starts with BSA:', BRAVE_API_KEY.startsWith('BSA'));
  console.log('Brave API key length:', BRAVE_API_KEY.length);
  
  if (!BRAVE_API_KEY) {
    console.log('No Brave API key, skipping search');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pw`, 
      // freshness=pw means "past week" - focuses on recent results
      {
        headers: {
          'X-Subscription-Token': BRAVE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Brave search failed:', response.status);
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
    return []; // Don't crash, just continue without search
  }
}

// Check if a claim needs recent info
export function needsRecentInfo(text: string): boolean {
  const keywords = [
    'announc', 'cancel', 'today', 'yesterday', 'this week', 
    'this month', 'recent', 'just', 'breaking', 'new study',
    'latest', 'update', 'US says', 'government', 'FDA'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

// Format search results for Claude
export function formatSearchResults(results: SearchResult[], claim: string): string {
  if (results.length === 0) return '';
  
  const sourcesText = results.map((result, idx) => 
    `[${idx + 1}] ${result.title}\n   Source: ${result.url}\n   ${result.description}`
  ).join('\n\n');
  
  return `\n\nRECENT SOURCES (found just now):\n${sourcesText}\n\nBased on these recent sources, please analyze the claim. If sources conflict, note that. Cite sources using [1], [2], etc.`;
}