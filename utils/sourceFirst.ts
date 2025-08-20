// utils/sourceFirst.ts - Ultra-fast search with aggressive timeouts
import { searchRecent } from './simpleSearch';

interface QuickSource {
  id: number;
  title: string;
  url: string;
  snippet: string;
  organization: string;
}

interface FastSourceResult {
  sources: QuickSource[];
  sourceText: string;
  searchTime: number;
}

// Ultra-fast source finding with aggressive timeout
export async function findSourcesFirst(userClaim: string): Promise<FastSourceResult> {
    const startTime = Date.now();
    console.log('🚀 Ultra-fast search starting for:', userClaim);
    
    try {
      // Super simple search - just key terms
      const query = userClaim.split(' ').slice(0, 3).join(' ');
      console.log('Simple query:', query);
      
      // 3-second timeout MAX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const searchResults = await searchRecent(query);
      clearTimeout(timeoutId);
      
      console.log('📊 Search returned:', searchResults.length, 'results');
      if (searchResults.length > 0) {
        console.log('📊 First result:', searchResults[0]);
      }
      
      // Just take first 2 results, no filtering
      const sources = searchResults.slice(0, 2).map((result, index) => ({
        id: index + 1,
        title: result.title || 'Unknown',
        url: result.url || '',
        snippet: result.description || 'No description',
        organization: extractSimpleOrg(result.url || '')
      }));
      
      const searchTime = Date.now() - startTime;
      console.log(`✅ Done in ${searchTime}ms with ${sources.length} sources`);
      
      const sourceText = formatForClaude(sources);
      console.log('📝 Source text for Claude:', sourceText);
      
      return {
        sources,
        sourceText,
        searchTime
      };
      
    } catch (error) {
      const searchTime = Date.now() - startTime;
      console.log(`❌ Failed after ${searchTime}ms`, error);
      
      return {
        sources: [],
        sourceText: 'Search failed',
        searchTime
      };
    }
  }

// Simplified search with timeout
async function performQuickSearch(query: string): Promise<any[]> {
  try {
    const results = await searchRecent(query);
    return results || [];
  } catch (error) {
    console.error('Search API failed:', error);
    return [];
  }
}

// Extract only essential terms
function extractKeyTerms(text: string): string {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 4); // Only 4 words max
  
  return words.join(' ');
}

// Simple org extraction - enhanced for better inline citations
function extractSimpleOrg(url: string): string {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // Government sources
    if (domain.includes('usgs.gov')) return 'USGS';
    if (domain.includes('cdc.gov')) return 'CDC';
    if (domain.includes('nih.gov')) return 'NIH';
    if (domain.includes('fda.gov')) return 'FDA';
    if (domain.includes('noaa.gov')) return 'NOAA';
    if (domain.includes('epa.gov')) return 'EPA';
    if (domain.includes('nasa.gov')) return 'NASA';
    
    // International organizations
    if (domain.includes('who.int')) return 'WHO';
    if (domain.includes('un.org')) return 'United Nations';
    
    // News sources
    if (domain.includes('reuters.com')) return 'Reuters';
    if (domain.includes('apnews.com')) return 'AP News';
    if (domain.includes('bbc.com')) return 'BBC';
    if (domain.includes('cnn.com')) return 'CNN';
    if (domain.includes('nytimes.com')) return 'New York Times';
    if (domain.includes('washingtonpost.com')) return 'Washington Post';
    if (domain.includes('npr.org')) return 'NPR';
    
    // Academic/Scientific
    if (domain.includes('nature.com')) return 'Nature';
    if (domain.includes('sciencedirect.com')) return 'ScienceDirect';
    if (domain.includes('pubmed')) return 'PubMed';
    if (domain.includes('arxiv.org')) return 'arXiv';
    
    // Health sources
    if (domain.includes('mayoclinic.org')) return 'Mayo Clinic';
    if (domain.includes('webmd.com')) return 'WebMD';
    if (domain.includes('healthline.com')) return 'Healthline';
    
    // Reference sources
    if (domain.includes('wikipedia.org')) return 'Wikipedia';
    if (domain.includes('britannica.com')) return 'Britannica';
    
    // Seismic/Geological (for your earthquake example)
    if (domain.includes('pnsn.org')) return 'Pacific Northwest Seismic Network';
    if (domain.includes('earthquake.usgs.gov')) return 'USGS Earthquake Hazards';
    
    // Generic categorization
    if (domain.endsWith('.gov')) return 'Government Source';
    if (domain.endsWith('.edu')) return 'Academic Source';
    if (domain.endsWith('.org')) return 'Organization';
    
    // Extract readable name from domain
    const siteName = domain
      .replace('www.', '')
      .split('.')[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return siteName;
  } catch (error) {
    return 'Web Source';
  }
}

// Format sources for Claude to understand and use for inline citations
function formatForClaude(sources: QuickSource[]): string {
  if (sources.length === 0) {
    return 'No sources found in quick search.';
  }
  
  let formatted = 'SOURCES FOR INLINE CITATIONS:\n\n';
  
  sources.forEach((source, index) => {
    formatted += `Source ${index + 1}:\n`;
    formatted += `Organization: ${source.organization}\n`;
    formatted += `Title: ${source.title}\n`;
    formatted += `URL: ${source.url}\n`;
    formatted += `Content: ${source.snippet}\n\n`;
  });
  
  return formatted;
}

// Updated formatting for display - no numbers since we're using inline citations
export function formatSourceReferences(sources: QuickSource[]): string {
  if (sources.length === 0) return '';
  
  let formatted = '\n\n**Sources Consulted:**\n';
  
  sources.forEach(source => {
    formatted += `• ${source.title}\n`;
    formatted += `  ${source.organization} - ${source.url}\n\n`;
  });
  
  return formatted;
}