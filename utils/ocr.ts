// utils/ocr.ts - With debugging
const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';

export async function extractTextFromImage(imageUri: string): Promise<string> {
  console.log('Starting OCR with URI:', imageUri);
  console.log('Google Vision API key exists:', !!GOOGLE_VISION_API_KEY);
  
  if (!GOOGLE_VISION_API_KEY) {
    console.error('No Google Vision API key found');
    throw new Error('OCR service not configured - please add EXPO_PUBLIC_GOOGLE_VISION_API_KEY to .env');
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

    // Call Google Vision API
    console.log('Calling Google Vision API...');
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log('Vision API response status:', visionResponse.status);
    
    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API error response:', errorText);
      throw new Error(`Google Vision API error: ${visionResponse.status} - ${errorText}`);
    }

    const data = await visionResponse.json();
    console.log('Vision API response:', JSON.stringify(data, null, 2));
    
    if (data.responses && data.responses[0]) {
      const textAnnotations = data.responses[0].textAnnotations;
      if (textAnnotations && textAnnotations[0]) {
        const extractedText = textAnnotations[0].description;
        console.log('Extracted text:', extractedText);
        return extractedText;
      }
    }

    console.log('No text annotations found in response');
    return 'No text found in image';
  } catch (error) {
    console.error('OCR error details:', error);
    throw error;
  }
}