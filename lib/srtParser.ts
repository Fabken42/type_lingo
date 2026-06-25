import { ParsedLine } from "@/types";

// Matches a timestamp line anywhere in the content (no ^ anchor so it works regardless of BOM/index lines)
const TIMESTAMP_ANYWHERE = /\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/;
const HTML_TAG_REGEX = /<[^>]*>/g;
const SSA_TAG_REGEX = /\{[^}]*\}/g;
// Matches both ♪ and ♬ (common in Japanese anime subtitles) plus surrounding content
const MUSIC_REGEX = /[♪♬～~][^♪♬]*[♪♬～~]?/g;

function stripBOM(str: string): string {
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str;
}

function cleanText(text: string): string {
  return text
    .replace(HTML_TAG_REGEX, "")
    .replace(SSA_TAG_REGEX, "")
    // Remove speaker cues like （マギノ） at the start of lines
    .replace(/^（[^）]*）\s*/, "")
    // Remove music symbols
    .replace(/[♪♬]/g, "")
    .replace(/～/g, "")
    .trim();
}

function tokenizeWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

function parseTimestamp(line: string): { startTime: string; endTime: string } | null {
  const match = line.match(
    /(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/
  );
  if (!match) return null;
  return { startTime: match[1], endTime: match[2] };
}

export function parseSRT(content: string): ParsedLine[] {
  const normalized = stripBOM(content)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const blocks = normalized.split(/\n\n+/);
  const lines: ParsedLine[] = [];
  let lineIndex = 0;

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (blockLines.length < 2) continue;

    let timestampLine = "";
    let textStartIdx = 0;

    for (let i = 0; i < blockLines.length; i++) {
      if (TIMESTAMP_ANYWHERE.test(blockLines[i].trim())) {
        timestampLine = blockLines[i].trim();
        textStartIdx = i + 1;
        break;
      }
    }

    if (!timestampLine) continue;

    const timeData = parseTimestamp(timestampLine);
    if (!timeData) continue;

    const rawTextLines = blockLines.slice(textStartIdx);
    const joined = rawTextLines
      .map(cleanText)
      .filter((l) => l.length > 0)
      .join(" ");

    if (!joined) continue;

    const words = tokenizeWords(joined);
    if (words.length === 0) continue;

    lines.push({
      index: lineIndex++,
      startTime: timeData.startTime,
      endTime: timeData.endTime,
      text: joined,
      words,
    });
  }

  return lines;
}

export function validateSRT(content: string): boolean {
  if (!content || content.trim().length === 0) return false;
  // Strip BOM before checking — Japanese/Windows SRT files often start with
  const stripped = stripBOM(content);
  return TIMESTAMP_ANYWHERE.test(stripped);
}
