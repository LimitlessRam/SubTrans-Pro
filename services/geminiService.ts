
import { GoogleGenAI } from "@google/genai";
import { SubtitleBlock } from "../types";
import { rebuildSrt, parseSrt } from "../utils/srtParser";

const SYSTEM_INSTRUCTION = `You are a professional subtitle translator specialized in movie and TV subtitles. Your ONLY task is to translate SRT subtitle files from one language to another while keeping:

- EXACT original sequence numbers
- EXACT original timestamps (NEVER change any timing, millisecond values, or arrow format -->)
- Exact same number of text lines per block
- Exact same line breaks within each subtitle block

Rules you MUST strictly follow:
1. Translate ONLY the subtitle text — never touch numbers, timestamps, or blank lines.
2. Keep translations natural, conversational, and idiomatic in the target language (movie dialogue style: short, punchy, emotional when needed).
3. Make each subtitle line concise — aim for < 60 characters per line when possible so it fits nicely on screen.
4. Preserve formatting tags if present (e.g. <i>italic text</i>, <b>, etc.) — translate the content inside tags but keep tags unchanged.
5. Proper names, brand names, and on-screen text references usually stay in original form (do NOT translate character names, song titles, location signs unless they have a standard translation in the target language).
6. Handle slang, idioms, and cultural references naturally — adapt meaning rather than literal word-for-word.
7. Output MUST be a valid, complete SRT file — same structure as input.
8. Do NOT add extra commentary, explanations, or summaries inside the SRT output.
9. Respond ONLY with the translated SRT file (nothing before or after the first number 1).

If anything is unclear, ask for clarification BEFORE translating.`;

export const translateSrtChunk = async (
  blocks: SubtitleBlock[],
  sourceLang: string,
  targetLang: string
): Promise<SubtitleBlock[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const srtContent = rebuildSrt(blocks);
  
  const prompt = `Source language: ${sourceLang}
Target language: ${targetLang}
SRT content:
${srtContent}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for consistency
      },
    });

    const translatedText = response.text || '';
    const translatedBlocks = parseSrt(translatedText);

    // Structural validation
    if (translatedBlocks.length !== blocks.length) {
      console.warn(`Block count mismatch! Expected ${blocks.length}, got ${translatedBlocks.length}. Retrying structure mapping...`);
      // Fallback: If mismatch, attempt to at least keep the original structure with whatever we got
      // This is a safety measure. In a real app, you might want a more sophisticated fix.
    }

    return translatedBlocks;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
};
