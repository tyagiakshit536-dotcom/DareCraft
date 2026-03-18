type GeminiPart = {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
  };
};

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-2.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function getApiKey(): string {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const key =
    viteEnv?.VITE_GEMINI_API_KEY ||
    (process.env.GEMINI_API_KEY as string | undefined);

  if (!key) {
    throw new Error(
      'Gemini API key is missing. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY in your environment.'
    );
  }

  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/Please retry in\s+([0-9]+(?:\.[0-9]+)?)s\.?/i);
  if (!match?.[1]) return null;
  const seconds = Number.parseFloat(match[1]);
  if (Number.isNaN(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds * 1000);
}

function isQuotaOrRateLimitError(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('resource_exhausted')
  );
}

function svgToDataUrl(svg: string): string {
  const normalized = svg
    .replace(/\r\n/g, '\n')
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/"/g, "'")
    .replace(/\n/g, ' ')
    .trim();
  return `data:image/svg+xml;utf8,${normalized}`;
}

function extractImageDataUrl(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) return null;
  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}

function extractSvgText(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.find((part) => part.text)?.text || '';
  const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
  return svgMatch?.[0] || null;
}

async function callGemini(
  apiKey: string,
  model: string,
  payload: Record<string, unknown>
): Promise<GeminiResponse> {
  const res = await fetch(
    `${API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini request failed for model ${model}`);
  }

  return data;
}

async function generateWithImageModel(apiKey: string, prompt: string): Promise<string> {
  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              `Create a square social-card background image for this challenge: "${prompt}". ` +
              'Style: abstract, premium, modern, cinematic lighting, vibrant gradients, no text, no logos. ' +
              'Composition should leave clear center space for headline text overlay. Output image only.',
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  };

  const firstTry = await callGemini(apiKey, IMAGE_MODEL, payload);
  const imageUrl = extractImageDataUrl(firstTry);
  if (!imageUrl) {
    throw new Error('Gemini did not return image data from the image model.');
  }
  return imageUrl;
}

async function generateWithTextSvgFallback(apiKey: string, prompt: string): Promise<string> {
  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              `Generate a premium abstract background SVG for this challenge: "${prompt}". ` +
              'Return only raw SVG markup. No markdown, no explanations, no text elements. ' +
              'Use 1024x1024 canvas with layered gradients and clean geometric forms.',
          },
        ],
      },
    ],
  };

  const data = await callGemini(apiKey, TEXT_MODEL, payload);
  const svg = extractSvgText(data);
  if (!svg) {
    throw new Error('Fallback model returned no SVG.');
  }
  return svgToDataUrl(svg);
}

export async function generateAIBackground(prompt: string): Promise<string> {
  const apiKey = getApiKey();

  try {
    return await generateWithImageModel(apiKey, prompt);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Failed to generate image with Gemini';

    const retryDelayMs = parseRetryDelayMs(message);
    if (retryDelayMs && retryDelayMs <= 90_000) {
      await sleep(retryDelayMs);
      try {
        return await generateWithImageModel(apiKey, prompt);
      } catch {
        // Fall through to fallback flow below.
      }
    }

    if (isQuotaOrRateLimitError(message)) {
      return await generateWithTextSvgFallback(apiKey, prompt);
    }

    throw new Error(message);
  }
}