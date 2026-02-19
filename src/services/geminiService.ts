
import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () =>
  process.env.API_KEY ||
  process.env.GEMINI_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY;

const getAi = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateGigDescription = async (title: string, category: string) => {
  try {
    const ai = getAi();
    if (!ai) return "AI key missing. Please configure GEMINI_API_KEY.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a professional and persuasive service description for a freelance gig titled: "${title}" in the category: "${category}". 
      Focus on value proposition, deliverables, and why the client should choose this service.`,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Error generating description.";
  }
};

export const chatWithMatchAssistant = async (userMessage: string, history: {role: 'user' | 'model', text: string}[]) => {
  try {
    const ai = getAi();
    if (!ai) {
      return { reply: "AI assistant is not configured yet. Please add GEMINI_API_KEY in deployment settings." };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: `You are the GigFlow AI Talent Scout. Your goal is to help clients find the best freelancers.
        1. Be professional, concise, and helpful.
        2. If the user description is vague, ask 1-2 clarifying questions.
        3. Once you understand their need, provide a matching category and search query.
        
        AVAILABLE CATEGORIES: "Prompt Engineering", "UI/UX Design", "Graphics & Design", "Digital Marketing", "Writing & Translation", "Video & Animation", "Programming & Tech", "Data", "Business".
        
        RESPONSE FORMAT: You MUST return a JSON object with:
        - "reply": Your conversational response to the user.
        - "match": (Optional) An object containing "category" (from the list) and "query" (1-3 keywords) if you have enough info to filter the marketplace.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            match: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                query: { type: Type.STRING }
              }
            }
          },
          required: ["reply"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Assistant Error:", error);
    return { reply: "I'm having a bit of trouble connecting to my talent database. Could you try rephrasing that?" };
  }
};

export const searchAssistant = async (query: string) => {
  try {
    const ai = getAi();
    if (!ai) return null;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is searching for: "${query}" in a freelance marketplace. 
      Suggest the most relevant categories and keywords for this search.`,
      config: {
        systemInstruction: `You are an AI search assistant for GigFlow, a freelance marketplace.
        Given a user query, provide relevant categories and keywords to help them find what they need.
        
        AVAILABLE CATEGORIES: "Prompt Engineering", "UI/UX Design", "Graphics & Design", "Digital Marketing", "Writing & Translation", "Video & Animation", "Programming & Tech", "Data", "Business".
        
        RESPONSE FORMAT: You MUST return a JSON object with:
        - "suggestedCategories": An array of 1-3 categories from the list above.
        - "keywords": An array of 3-5 related search keywords.
        - "advice": A short (1 sentence) helpful advice for the user's specific need.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            advice: { type: Type.STRING }
          },
          required: ["suggestedCategories", "keywords", "advice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Search Assistant Error:", error);
    return null;
  }
};

export const simulateChatResponse = async (freelancerName: string, freelancerBio: string, userMessage: string, chatHistory: {role: string, text: string}[]) => {
  try {
    const ai = getAi();
    if (!ai) return "Thanks for your message! I'll get back to you soon.";

    const historyParts = chatHistory.map(h => `${h.role === 'user' ? 'Client' : freelancerName}: ${h.text}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are ${freelancerName}, a freelancer. Bio: "${freelancerBio}". 
      Respond to the client: "${userMessage}". History: ${historyParts}`,
      config: { temperature: 0.8 }
    });
    return response.text;
  } catch (error) {
    return "Thanks for your message! I'll get back to you soon.";
  }
};

/**
 * AI STUDIO - IMAGE GENERATION
 */
export const generateGigImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K') => {
  try {
    const ai = getAi();
    if (!ai) throw new Error("Missing GEMINI_API_KEY");

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `Professional, commercial grade marketplace service cover for: ${prompt}. Cinematic lighting, ultra-high resolution, minimalist but premium.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

/**
 * AI STUDIO - VIDEO GENERATION (VEO)
 */
export const generateGigVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  try {
    const ai = getAi();
    const apiKey = getApiKey();
    if (!ai || !apiKey) throw new Error("Missing GEMINI_API_KEY");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cinematic 5-second professional promotional clip for: ${prompt}. Elegant motion, high-end production value, minimal text overlays if any.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    const messages = [
      "Orchestrating visual elements...",
      "Synthesizing cinematic motion...",
      "Applying atmospheric lighting...",
      "Finalizing high-fidelity rendering...",
      "Polishing frame transitions..."
    ];
    let msgIdx = 0;

    while (!operation.done) {
      if (onProgress) onProgress(messages[msgIdx % messages.length]);
      msgIdx++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
