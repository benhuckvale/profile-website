import React from 'react';

/**
 * Applies unicode replacements to text based on a mapping
 * @param text The text to process
 * @param replacements Map of words to unicode code points (e.g., {"gamma": "03B3"})
 * @returns Text with unicode replacements applied
 */
export function applyUnicodeReplacements(
  text: string,
  replacements?: Record<string, string>
): string {
  if (!text || !replacements) return text;

  let result = text;
  Object.entries(replacements).forEach(([word, codePoint]) => {
    // Convert hex code point (e.g., "03B3") to unicode character
    const unicodeChar = String.fromCharCode(parseInt(codePoint, 16));
    // Use word boundaries to replace whole words only
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, unicodeChar);
  });

  return result;
}

/**
 * Converts markdown-style links [text](url) to React anchor elements
 * Optionally applies unicode replacements first
 */
export function renderTextWithLinks(
  text: string,
  unicodeReplacements?: Record<string, string>
): React.ReactNode {
  if (!text) return null;

  // Apply unicode replacements first
  const processedText = applyUnicodeReplacements(text, unicodeReplacements);

  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(processedText)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(processedText.substring(lastIndex, match.index));
    }

    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="neon-glow-cyan"
        style={{ textDecoration: 'underline' }}
      >
        {linkText}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < processedText.length) {
    parts.push(processedText.substring(lastIndex));
  }

  // If no links were found, return the original text
  return parts.length > 0 ? parts : processedText;
}
