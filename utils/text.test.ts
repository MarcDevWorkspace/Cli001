import { describe, it, expect } from 'vitest';
import { slugify } from './text';

describe('slugify', () => {
    it('converts to lowercase', () => {
        expect(slugify('Hello')).toBe('hello');
    });

    it('replaces spaces with hyphens', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('handles accents via NFD normalization', () => {
        expect(slugify('Économie & Société')).toBe('economie-societe');
        expect(slugify('À la carte')).toBe('a-la-carte');
    });

    it('removes special characters', () => {
        expect(slugify('Hello! @World#')).toBe('hello-world');
    });

    it('trims leading/trailing hyphens', () => {
        expect(slugify(' - Hello - ')).toBe('hello');
    });

    it('handles empty strings', () => {
        expect(slugify('')).toBe('');
    });
});
