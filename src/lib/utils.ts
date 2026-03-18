export function encodeDare(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonString);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    // URL-safe base64 avoids percent-encoding expansion in query strings.
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  } catch (e) {
    console.error('Failed to encode dare', e);
    return '';
  }
}

export function decodeDare(encoded: string): any | null {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonString = new TextDecoder().decode(bytes);
    return JSON.parse(jsonString);
  } catch (e) {
    // Backward compatibility for older links encoded with encodeURIComponent+base64.
    try {
      const legacyJsonString = decodeURIComponent(atob(encoded));
      return JSON.parse(legacyJsonString);
    } catch (legacyError) {
      console.error('Failed to decode dare', e, legacyError);
      return null;
    }
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
