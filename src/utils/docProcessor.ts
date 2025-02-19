
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
