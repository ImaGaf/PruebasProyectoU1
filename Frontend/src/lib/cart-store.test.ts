import { describe, it, expect, beforeEach } from 'vitest';
import { cartStore } from './cart-store';

describe('cartStore', () => {
    beforeEach(() => {
        cartStore.clear();
    });

    describe('addItem', () => {
        it('adds an item to the cart', () => {
            const item = {
                id: '1',
                productId: 'prod-1',
                name: 'Test Product',
                price: 100,
                quantity: 1,
            };

            cartStore.addItem(item);
            const items = cartStore.getItems();

            expect(items).toHaveLength(1);
            expect(items[0]).toEqual(item);
        });
    });

    describe('removeItem', () => {
        it('removes an item from the cart', () => {
            const item = {
                id: '1',
                productId: 'prod-1',
                name: 'Test Product',
                price: 100,
                quantity: 1,
            };

            cartStore.addItem(item);
            cartStore.removeItem('1');

            const items = cartStore.getItems();
            expect(items).toHaveLength(0);
        });
    });

    describe('getTotal', () => {
        it('calculates total correctly', () => {
            cartStore.addItem({
                id: '1',
                productId: 'prod-1',
                name: 'Product 1',
                price: 100,
                quantity: 2,
            });

            const total = cartStore.getTotal();
            expect(total).toBe(200);
        });

        it('returns 0 for empty cart', () => {
            const total = cartStore.getTotal();
            expect(total).toBe(0);
        });
    });

    describe('clear', () => {
        it('clears all items from cart', () => {
            cartStore.addItem({
                id: '1',
                productId: 'prod-1',
                name: 'Product 1',
                price: 100,
                quantity: 1,
            });

            cartStore.clear();

            const items = cartStore.getItems();
            expect(items).toHaveLength(0);
        });
    });
});
