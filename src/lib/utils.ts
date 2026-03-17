export function encodeDare(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    // Use encodeURIComponent to handle special characters properly before base64 encoding
    return btoa(encodeURIComponent(jsonString));
  } catch (e) {
    console.error('Failed to encode dare', e);
    return '';
  }
}

export function decodeDare(encoded: string): any | null {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Failed to decode dare', e);
    return null;
  }
}

export function generateSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
