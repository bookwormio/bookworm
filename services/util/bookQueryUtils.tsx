import { type BookVolumeInfo, type BookshelfVolumeInfo } from "../../types";

/**
 * Helper function to convert HTTP URLs to HTTPS
 */
export const convertToHttps = (url?: string): string | undefined => {
  return url?.replace("http://", "https://");
};

/**
 * Helper function check if a string is a valid ISBN
 */
export const isValidISBN = (isbn: string): boolean => {
  isbn = isbn.replace(/[-\s]/g, "");
  // Check for ISBN-10
  if (isbn.length === 10) {
    // First 9 characters should be digits; the last can be a digit or 'X'
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;

    // Calculate checksum for ISBN-10
    let total = 0;
    for (let i = 0; i < 10; i++) {
      const char = isbn[i];
      const value = char === "X" ? 10 : parseInt(char, 10);
      total += value * (10 - i);
    }
    return total % 11 === 0;
  }

  // Check for ISBN-13
  if (isbn.length === 13 && /^\d{13}$/.test(isbn)) {
    // Calculate checksum for ISBN-13
    let total = 0;
    for (let i = 0; i < 13; i++) {
      const value = parseInt(isbn[i], 10);
      total += i % 2 === 0 ? value : value * 3;
    }
    return total % 10 === 0;
  }

  // If neither ISBN-10 nor ISBN-13 format
  return false;
};

/**
 * Converts a BookVolumeInfo object to a BookshelfVolumeInfo object
 * @param {BookVolumeInfo} info - The book volume information to convert
 * @returns {BookshelfVolumeInfo} The converted bookshelf volume information
 */
export function convertToBookshelfVolumeInfo(
  info: BookVolumeInfo,
): BookshelfVolumeInfo {
  return {
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors,
    publisher: info.publisher,
    publishedDate: info.publishedDate,
    description: info.description,
    pageCount: info.pageCount,
    categories: info.categories,
    maturityRating: info.maturityRating,
    previewLink: info.previewLink,
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    language: info.language,
    mainCategory: info.mainCategory,
    thumbnail: info.imageLinks?.thumbnail,
  };
}
