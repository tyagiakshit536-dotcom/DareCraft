export async function generateAIBackground(prompt: string): Promise<string> {
  const apiKey = "AIzaSyCmF951IAc7Z2f6TfBHB5pZRlpBvR5YIVU";
  
  const payload = {
    contents: [{
      parts: [{
        text: `You are an expert graphic designer and SVG artist. Generate an abstract, highly aesthetic background graphic for a goal titled: "${prompt}". Output ONLY valid, clean SVG code with no markdown formatting. The SVG should be 1200x1200px, use gorgeous gradients, geometric shapes, or abstract layouts. DO NOT include any text inside the SVG. Just the raw <svg> tag. Start with <svg and end with </svg>.`
      }]
    }]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to generate image with Gemini");
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Extract strictly the SVG part
  const match = text.match(/<svg[\s\S]*<\/svg>/i);
  let cleanSvg = match ? match[0] : "";
  
  // Fallback if regex fails but we have some text
  if (!cleanSvg && text.includes("<svg")) {
      cleanSvg = text.substring(text.indexOf("<svg"), text.lastIndexOf("</svg>") + 6);
  }

  // Ensure xmlns is present for data URIs
  if (cleanSvg && !cleanSvg.includes("xmlns=")) {
      cleanSvg = cleanSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Ensure width and height are present so canvas drawing doesn't fail
  if (cleanSvg && !cleanSvg.includes("width=")) {
      cleanSvg = cleanSvg.replace("<svg", '<svg width="1200" height="1200"');
  }

  // Safe base64 encoding for browsers that handles unicode correctly
  const base64 = btoa(
    new TextEncoder().encode(cleanSvg).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return `data:image/svg+xml;base64,${base64}`;
}