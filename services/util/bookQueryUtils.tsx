/**
 * Helper function to convert HTTP URLs to HTTPS
 */
export const convertToHttps = (url?: string): string | undefined => {
  return url?.replace("http://", "https://");
};
