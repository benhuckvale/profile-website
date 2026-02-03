import React from 'react';

/**
 * Converts GitHub blob URLs to raw URLs for direct image access
 * @param url The URL to convert
 * @returns Converted URL if it's a GitHub blob URL, otherwise original URL
 */
export function convertGitHubBlobToRaw(url: string): string {
  if (!url) return url;

  // Convert GitHub blob URLs to raw URLs
  // Example: https://github.com/user/repo/blob/main/path/file.png
  //       -> https://github.com/user/repo/raw/main/path/file.png
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url.replace('/blob/', '/raw/');
  }

  return url;
}

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
 * Converts markdown-style links [text](url) and images ![alt](url) to React elements
 * Optionally applies unicode replacements first
 */
export function renderTextWithLinks(
  text: string,
  unicodeReplacements?: Record<string, string>
): React.ReactNode {
  if (!text) return null;

  // Apply unicode replacements first
  const processedText = applyUnicodeReplacements(text, unicodeReplacements);

  // Regex to match markdown images and links
  // Images: ![alt](url)
  // Links: [text](url)
  const markdownRegex = /(!?)\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = markdownRegex.exec(processedText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(processedText.substring(lastIndex, match.index));
    }

    const isImage = match[1] === '!';
    const altOrText = match[2];
    const url = match[3];

    if (isImage) {
      // Convert GitHub blob URLs to raw URLs for images
      const imageUrl = convertGitHubBlobToRaw(url);
      parts.push(
        <img
          key={`img-${keyCounter++}`}
          src={imageUrl}
          alt={altOrText}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          }}
        />
      );
    } else {
      // Regular link
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-glow-cyan"
          style={{ textDecoration: 'underline' }}
        >
          {altOrText}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last match
  if (lastIndex < processedText.length) {
    parts.push(processedText.substring(lastIndex));
  }

  // If no matches were found, return the original text
  return parts.length > 0 ? parts : processedText;
}
