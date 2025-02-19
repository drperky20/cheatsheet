
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
  const links: Array<{ url: string; type: 'google_doc' | 'external_link' }> = [];
  const urlRegex = /href=['"]([^'"]+)['"]/g;
  let match;

  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('docs.google.com')) {
      links.push({ url, type: 'google_doc' });
    } else if (url.startsWith('http') || url.startsWith('https')) {
      links.push({ url, type: 'external_link' });
    }
  }

  return links;
};

export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
};
