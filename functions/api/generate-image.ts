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

type Env = {
  GEMINI_API_KEY?: string;
};

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-2.5-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_IMAGE_RETRIES = 1;
const BASE_RETRY_DELAY_MS = 1000;
const GEMINI_REQUEST_TIMEOUT_MS = 15_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
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

function isHighDemandError(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes('high demand') ||
    msg.includes('try again later') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('capacity')
  );
}

function isTimeoutError(message: string): boolean {
  return message.toLowerCase().includes('timed out');
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createLocalFallbackImage(prompt: string): string {
  const seed = hashString(prompt || 'darecraft');
  const hueA = seed % 360;
  const hueB = (hueA + 48) % 360;
  const hueC = (hueA + 112) % 360;
  const hueD = (hueA + 180) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA} 85% 52%)"/>
      <stop offset="50%" stop-color="hsl(${hueB} 80% 40%)"/>
      <stop offset="100%" stop-color="hsl(${hueC} 78% 28%)"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.30)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="80%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.20)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="220" cy="220" r="260" fill="url(#glow1)" opacity="0.75"/>
  <circle cx="820" cy="820" r="280" fill="url(#glow2)" opacity="0.8"/>
  <path d="M70 640 C260 460, 520 760, 740 620 C880 540, 980 600, 1024 680 L1024 1024 L0 1024 Z" fill="hsl(${hueD} 85% 30% / 0.52)"/>
  <path d="M0 350 C180 240, 320 420, 530 360 C700 320, 860 150, 1024 260 L1024 410 C860 320, 700 460, 520 500 C310 540, 170 380, 0 480 Z" fill="hsl(${hueB} 88% 74% / 0.28)"/>
  <rect x="100" y="120" width="320" height="320" rx="48" fill="hsl(${hueA} 96% 86% / 0.16)"/>
  <rect x="580" y="560" width="360" height="300" rx="54" fill="hsl(${hueC} 95% 80% / 0.14)"/>
</svg>`;

  return svgToDataUrl(svg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  apiKey: string,
  model: string,
  payload: Record<string, unknown>
): Promise<GeminiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_REQUEST_TIMEOUT_MS);
  let res: Response;

  try {
    res = await fetch(
      `${API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Gemini request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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

  const data = await callGemini(apiKey, IMAGE_MODEL, payload);
  const imageDataUrl = extractImageDataUrl(data);
  if (!imageDataUrl) {
    throw new Error('Gemini did not return image data from the image model.');
  }

  return imageDataUrl;
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

type FunctionContext = {
  env: Env;
  request: Request;
};

export const onRequestPost = async (context: FunctionContext): Promise<Response> => {
  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      {
        error: 'Server is not configured. Missing GEMINI_API_KEY secret.',
      },
      500
    );
  }

  let prompt = '';
  try {
    const body = (await context.request.json()) as { prompt?: string };
    prompt = body.prompt?.trim() || '';
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  if (!prompt) {
    return jsonResponse({ error: 'Prompt is required.' }, 400);
  }

  let lastImageError = 'Failed to generate image with Gemini';

  for (let attempt = 0; attempt <= MAX_IMAGE_RETRIES; attempt += 1) {
    try {
      const imageDataUrl = await generateWithImageModel(apiKey, prompt);
      return jsonResponse({ imageDataUrl });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to generate image with Gemini';
      lastImageError = message;

      const explicitRetryDelayMs = parseRetryDelayMs(message);
      const shouldRetry = isHighDemandError(message) || Boolean(explicitRetryDelayMs);
      const hasAttemptsRemaining = attempt < MAX_IMAGE_RETRIES;

      if (shouldRetry && hasAttemptsRemaining) {
        const backoffDelayMs = BASE_RETRY_DELAY_MS * (attempt + 1);
        const delayMs =
          explicitRetryDelayMs && explicitRetryDelayMs <= 90_000
            ? explicitRetryDelayMs
            : backoffDelayMs;
        await sleep(delayMs);
        continue;
      }

      if (isQuotaOrRateLimitError(message) || isHighDemandError(message) || isTimeoutError(message)) {
        try {
          const imageDataUrl = await generateWithTextSvgFallback(apiKey, prompt);
          return jsonResponse({ imageDataUrl });
        } catch (fallbackError) {
          const fallbackMessage =
            fallbackError instanceof Error && fallbackError.message
              ? fallbackError.message
              : 'Fallback model failed';
          const imageDataUrl = createLocalFallbackImage(prompt);
          return jsonResponse({ imageDataUrl, fallbackReason: fallbackMessage }, 200);
        }
      }

      const imageDataUrl = createLocalFallbackImage(prompt);
      return jsonResponse({ imageDataUrl, fallbackReason: message }, 200);
    }
  }

  if (isHighDemandError(lastImageError) || isTimeoutError(lastImageError)) {
    try {
      const imageDataUrl = await generateWithTextSvgFallback(apiKey, prompt);
      return jsonResponse({ imageDataUrl });
    } catch (fallbackError) {
      const fallbackMessage =
        fallbackError instanceof Error && fallbackError.message
          ? fallbackError.message
          : 'Fallback model failed';
      const imageDataUrl = createLocalFallbackImage(prompt);
      return jsonResponse({ imageDataUrl, fallbackReason: fallbackMessage }, 200);
    }
  }

  const imageDataUrl = createLocalFallbackImage(prompt);
  return jsonResponse({ imageDataUrl, fallbackReason: lastImageError }, 200);
};
