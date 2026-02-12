import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import * as api from '@/lib/api';
import { cartStore } from '@/lib/cart-store';

// Mocks
vi.mock('@/lib/api', () => ({
    getCurrentUser: vi.fn(),
    logoutUser: vi.fn(),
}));

vi.mock('@/lib/cart-store', () => ({
    cartStore: {
        getCount: vi.fn(),
        subscribe: vi.fn(() => vi.fn()),
    },
}));

describe('Layout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(cartStore.getCount).mockReturnValue(0);
    });

    it('renders children correctly', () => {
        render(
            <BrowserRouter>
                <Layout>
                    <div data-testid="child-content">Child Content</div>
                </Layout>
            </BrowserRouter>
        );

        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(
            <BrowserRouter>
                <Layout><div>Content</div></Layout>
            </BrowserRouter>
        );

        // Buscar los enlaces de navegación en el header
        const navLinks = screen.getAllByRole('link', { name: /inicio|productos|personalizar|sobre nosotros|contacto/i });
        
        // Verificar que al menos un enlace de Inicio y Productos existe
        expect(navLinks.some(link => link.textContent?.includes('Inicio'))).toBe(true);
        expect(navLinks.some(link => link.textContent?.includes('Productos'))).toBe(true);
    });

    it('displays user name when logged in', () => {
        vi.mocked(api.getCurrentUser).mockReturnValue({ firstName: 'Test User' });

        render(
            <BrowserRouter>
                <Layout><div>Content</div></Layout>
            </BrowserRouter>
        );

        expect(screen.getByText('Hola, Test User')).toBeInTheDocument();
    });

    it('displays login button when not logged in', () => {
        vi.mocked(api.getCurrentUser).mockReturnValue(null);

        render(
            <BrowserRouter>
                <Layout><div>Content</div></Layout>
            </BrowserRouter>
        );

        // Lucide User icon is inside a button
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('shows cart count when greater than 0', () => {
        vi.mocked(cartStore.getCount).mockReturnValue(5);

        render(
            <BrowserRouter>
                <Layout><div>Content</div></Layout>
            </BrowserRouter>
        );

        expect(screen.getByText('5')).toBeInTheDocument();
    });
});
