
export const extractGoogleDocLinks = (html: string): string[] => {
  const regex = /href=['"]([^'"]*docs\.google\.com[^'"]*)['"]/g;
  const links: string[] = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links;
};

export const sanitizeHTML = (html: string): string => {
  // Simple HTML sanitization for display
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
};

export const extractAllExternalLinks = (html: string): Array<{ url: string; type: 'google_doc' | 'other' }> => {
  const urlRegex = /href=['"]([^'"]+)['"]/g;
  const links: Array<{ url: string; type: 'google_doc' | 'other' }> = [];
  let match;

  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1];
    const type = url.includes('docs.google.com') ? 'google_doc' : 'other';
    links.push({ url, type });
  }

  return links;
};

export const logProcessingActivity = (action: string, details: any) => {
  console.log(`[DocProcessor] ${action}:`, details);
};
