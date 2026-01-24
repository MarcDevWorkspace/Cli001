/**
 * Converts a string into a URL-friendly slug.
 * Handles accents, special characters, and whitespace.
 * e.g. "L'Économie & la Société" -> "l-economie-la-societe"
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Normalize Unicode characters (separate base chars from accents)
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
}
