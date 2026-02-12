import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
    describe('cn', () => {
        it('combines multiple class names', () => {
            const result = cn('class1', 'class2', 'class3');
            expect(result).toContain('class1');
            expect(result).toContain('class2');
            expect(result).toContain('class3');
        });

        it('handles conditional classes', () => {
            const result = cn('base', true && 'active', false && 'inactive');
            expect(result).toContain('base');
            expect(result).toContain('active');
            expect(result).not.toContain('inactive');
        });

        it('handles undefined and null values', () => {
            const result = cn('base', undefined, null, 'valid');
            expect(result).toContain('base');
            expect(result).toContain('valid');
        });

        it('merges Tailwind classes correctly', () => {
            const result = cn('p-4', 'p-8');
            expect(result).toBe('p-8');
        });
    });
});
