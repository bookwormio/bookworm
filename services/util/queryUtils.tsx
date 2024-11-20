/**
 * Normalizes a string to Unicode Normalization Form KC (NFKC) and then converts it to lowercase.
 * This function ensures case-folding of the input string.
 *
 * @param {string} s - The string to be normalized and case-folded.
 * @returns {string} The case-folded string.
 */
export function caseFoldNormalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().toUpperCase().toLowerCase();
}
