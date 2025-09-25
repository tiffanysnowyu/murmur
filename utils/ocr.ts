// utils/ocr.ts - With debugging

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';
export async function claudeExtractTextFromImage(imageUri: string): Promise<string> {
  console.log('Starting Claude OCR with URI:', imageUri);
  console.log('Claude API key exists:', !!CLAUDE_API_KEY);
  
  if (!CLAUDE_API_KEY) {
    console.error('No Claude API key found');
    throw new Error('Claude OCR service not configured - please add EXPO_PUBLIC_CLAUDE_API_KEY to .env');
  }

  try {
    // Fetch the image
    console.log('Fetching image...');
    const response = await fetch(imageUri);
    const blob = await response.blob();
    console.log('Image blob size:', blob.size);
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(blob);
    const base64 = await base64Promise;
    console.log('Base64 length:', base64.length);

    // Determine media type from the image URI or blob
    const mediaType = blob.type || 'image/jpeg';

    // Call Claude API
    // console.log('Calling Claude API...');
    
    // IF COST GETS TOO HIGH CAN CHANGE THIS TO USE A CHEAPER MODEL LIKE HAIKU 3
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Extract all the text from this image. Return only the extracted text, without any additional commentary or formatting. If there is no readable text in the image, respond with "No text found in image".',
              },
            ],
          },
        ],
      }),
    });

    console.log('Claude API response status:', claudeResponse.status);
    
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error response:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorText}`);
    }

    const data = await claudeResponse.json();
    console.log('Claude API response:', JSON.stringify(data, null, 2));
    
    if (data.content && data.content[0] && data.content[0].text) {
      const extractedText = data.content[0].text.trim();
      console.log('Extracted text:', extractedText);
      return extractedText;
    }

    console.log('No text content found in Claude response');
    return 'No text found in image';
  } catch (error) {
    console.error('Claude OCR error details:', error);
    throw error;
  }
}