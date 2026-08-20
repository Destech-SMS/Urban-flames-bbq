// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    // ... other config
    theme: {
        extend: {
            colors: {
                // Use colors from the logo
                'bbq-charcoal': '#1a1a1a', // Rich dark base
                'bbq-ember': '#d35400',    // Burnt orange
                'bbq-fire': '#e74c3c',     // Intense red
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                heat: {
                    '0%, 100%': { transform: 'translateY(0) scaleY(1)', opacity: '0.8' },
                    '50%': { transform: 'translateY(-2px) scaleY(1.05)', opacity: '1' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                shatterIn: {
                    '0%': { transform: 'scale(0) rotate(720deg)', opacity: '0' },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s infinite linear',
                heat: 'heat 1.5s ease-in-out infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                slideIn: 'slideIn 0.8s ease-out forwards',
                shatterIn: 'shatterIn 1s ease-out forwards',
            },
        },
    },
    plugins: [require("tailwindcss-animate")], // Make sure this plugin is installed
};
export default config;