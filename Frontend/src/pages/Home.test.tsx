import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

describe('Home', () => {
    it('renders the home page', () => {
        const { container } = render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(container).toBeTruthy();
    });
});
