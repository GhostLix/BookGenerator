import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArtStyle, ChapterOutline } from '../types';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const parseJsonResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    console.error("Original text:", text);
    return null;
  }
};

export const generateBookOutline = async (
  title: string,
  genre: string,
  chapterCount: number,
  artStyle: ArtStyle,
  language: string
): Promise<ChapterOutline[] | null> => {
  const prompt = `
    You are a master storyteller and book planner.
    Your task is to generate a book outline based on the user's request.
    
    Book Title: "${title}"
    Genre: "${genre}"
    Number of Chapters: ${chapterCount}
    Illustration Art Style: "${artStyle}"
    Language for the Book: "${language}"

    Generate a JSON array of objects, where each object represents a chapter.
    Each object must have two keys:
    1. "chapter_title": A creative and fitting title for the chapter, written in the requested language: "${language}".
    2. "image_prompt": A detailed, vivid, and descriptive prompt for an AI image generator to create an illustration for this chapter. This prompt should be a single, cohesive paragraph that captures a key scene or mood. It must incorporate the specified art style: "${artStyle}". IMPORTANT: The "image_prompt" MUST be written in English, regardless of the book's language, to ensure compatibility with the image generation model.

    Example response format (for an Italian book):
    [
      {
        "chapter_title": "L'Ombra nel Vicolo",
        "image_prompt": "A lone detective in a trench coat standing in a rain-slicked, narrow alley at night, illuminated by a single flickering neon sign, casting long, dramatic shadows. The style should be photorealistic with high contrast noir lighting."
      }
    ]

    Now, create the outline for the requested book.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });
    const outlines = parseJsonResponse<ChapterOutline[]>(response.text);
    return outlines;
  } catch (error) {
    console.error("Error generating book outline:", error);
    return null;
  }
};

export const generateChapterText = async (
  bookTitle: string,
  chapterTitle: string,
  outline: ChapterOutline[] | null,
  currentChapterIndex: number,
  wordsPerChapter: number,
  language: string
): Promise<string | null> => {
  const previousChaptersSummary =
    currentChapterIndex > 0 && outline
      ? `Here is a summary of previous chapters to maintain context: ${outline
          .slice(0, currentChapterIndex)
          .map((c, i) => `Chapter ${i + 1} (${c.chapter_title})`)
          .join(', ')}.`
      : '';

  const prompt = `
    You are a professional author. Your task is to write a full chapter for a book titled "${bookTitle}".
    The entire chapter must be written in the following language: ${language}.
    
    This is Chapter ${currentChapterIndex + 1}, titled "${chapterTitle}".
    
    ${previousChaptersSummary}
    
    The chapter should be based on its title and fit within the sequence. Use evocative language, develop characters and plot, and create a compelling narrative in ${language}.
    The chapter should be approximately ${wordsPerChapter} words long.
    
    Do not include the chapter title (e.g., "Chapter X: ...") in your response. Just provide the body of the chapter text itself, written purely in ${language}.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        temperature: 0.75,
      }
    });
    return response.text;
  } catch (error) {
    console.error(`Error generating text for chapter "${chapterTitle}":`, error);
    return null;
  }
};


export const generateChapterImage = async (
  imagePrompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};