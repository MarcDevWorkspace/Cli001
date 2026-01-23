/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#1B3B5F', // Deep Blue (Law/Trust)
                    secondary: '#D4AF37', // Gold (Prestige)
                    accent: '#C04000', // Terracotta (Haitian culture ref)
                    cream: '#F9F7F2', // Background
                    dark: '#111827',
                    paper: '#f3f4f6'
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['Lato', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: '#374151',
                        h3: {
                            marginTop: '1.5em',
                            marginBottom: '0.5em',
                        },
                        blockquote: {
                            borderLeftColor: '#C04000', // brand-accent
                            fontStyle: 'normal', // Remove italic
                            color: '#4b5563',
                        },
                        'blockquote p:first-of-type::before': {
                            content: 'none',
                        },
                        'blockquote p:last-of-type::after': {
                            content: 'none',
                        },
                    },
                },
            },
        }
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
