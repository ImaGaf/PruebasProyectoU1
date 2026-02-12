import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('renders children when user is authenticated', () => {
        sessionStorage.setItem('user', JSON.stringify({
            id: '1',
            email: 'test@test.com',
            role: 'customer'
        }));

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects when user is not authenticated', () => {
        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('blocks access when role does not match', () => {
        sessionStorage.setItem('user', JSON.stringify({
            id: '1',
            email: 'user@test.com',
            role: 'customer'
        }));

        render(
            <BrowserRouter>
                <ProtectedRoute role="admin">
                    <TestComponent />
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
