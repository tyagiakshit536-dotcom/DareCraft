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

const CLIENT_IMAGE_REQUEST_TIMEOUT_MS = 40_000;

export async function generateAIBackground(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CLIENT_IMAGE_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    const data = (await res.json()) as GenerateImageResponse;
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate AI background image.');
    }

    if (!data.imageDataUrl) {
      throw new Error('Image generation succeeded but no image was returned.');
    }

    return data.imageDataUrl;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Image generation timed out. Please try again.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}