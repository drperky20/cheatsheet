
export const extractGoogleDocLinks = (html: string): string[] => {
  const regex = /href=['"]([^'"]*docs\.google\.com[^'"]*)['"]/g;
  const links: string[] = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links;
};

export const extractAllExternalLinks = (html: string): Array<{ url: string; type: 'google_doc' | 'external_link' }> => {
  if (!html) return [];
  
  const links: Array<{ url: string; type: 'google_doc' | 'external_link' }> = [];
  // Only match links that are in the actual HTML content, not in any attributes or scripts
  const urlRegex = /href=['"]([^'"]+)['"]/g;
  let match;

  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1];
    // Filter out non-http links, anchor links, javascript: links, and instructure uploads
    if (
      (url.startsWith('http') || url.startsWith('https')) && 
      !url.startsWith('https://instructure-uploads.s3.amazonaws.com')
    ) {
      if (url.includes('docs.google.com')) {
        links.push({ url, type: 'google_doc' });
      } else {
        links.push({ url, type: 'external_link' });
      }
    }
  }

  return links;
};

export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
};
