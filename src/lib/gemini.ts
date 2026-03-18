type GeminiPart = {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
};

type GenerateImageResponse = {
  imageDataUrl?: string;
  error?: string;
};

export async function generateAIBackground(prompt: string): Promise<string> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = (await res.json()) as GenerateImageResponse;
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate AI background image.');
  }

  if (!data.imageDataUrl) {
    throw new Error('Image generation succeeded but no image was returned.');
  }

  return data.imageDataUrl;
}