import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Mock authService
vi.mock('../services/auth', () => ({
    authService: {
        isAuthenticated: vi.fn().mockReturnValue(false),
        onAuthChange: vi.fn().mockImplementation((cb) => {
            // simulate no user initially
            cb(null);
            return () => { }; // unsubscribe mock
        }),
    }
}));

describe('Layout', () => {
    it('renders children content', () => {
        render(
            <MemoryRouter>
                <Layout>
                    <div data-testid="child-content">Child Content</div>
                </Layout>
            </MemoryRouter>
        );
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(
            <MemoryRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </MemoryRouter>
        );
        expect(screen.getByText('Accueil')).toBeInTheDocument();
        expect(screen.getByText('Parcours')).toBeInTheDocument();
        expect(screen.getByText('Publications')).toBeInTheDocument();
    });

    it('renders branding', () => {
        render(
            <MemoryRouter>
                <Layout>
                    <div>Content</div>
                </Layout>
            </MemoryRouter>
        );
        expect(screen.getByRole('link', { name: /Bertrand Gerbier/i })).toBeInTheDocument();
    });
});
