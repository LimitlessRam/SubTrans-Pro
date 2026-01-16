
import { SubtitleBlock } from '../types';

export const parseSrt = (content: string): SubtitleBlock[] => {
  const blocks: SubtitleBlock[] = [];
  // Normalized line endings
  const rawBlocks = content.replace(/\r\n/g, '\n').split(/\n\n+/);

  for (const blockText of rawBlocks) {
    const lines = blockText.trim().split('\n');
    if (lines.length >= 3) {
      const index = lines[0].trim();
      const timestamp = lines[1].trim();
      const textLines = lines.slice(2);
      
      // Basic validation for SRT block
      if (/^\d+$/.test(index) && timestamp.includes('-->')) {
        blocks.push({
          id: `${index}-${timestamp}`,
          index,
          timestamp,
          lines: textLines,
        });
      }
    }
  }
  return blocks;
};

export const rebuildSrt = (blocks: SubtitleBlock[]): string => {
  return blocks
    .map((b) => `${b.index}\n${b.timestamp}\n${b.lines.join('\n')}`)
    .join('\n\n');
};

export const chunkBlocks = (blocks: SubtitleBlock[], size: number): SubtitleBlock[][] => {
  const chunks: SubtitleBlock[][] = [];
  for (let i = 0; i < blocks.length; i += size) {
    chunks.push(blocks.slice(i, i + size));
  }
  return chunks;
};
