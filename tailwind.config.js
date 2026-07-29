/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                surface: '#FCF9F8',
                'surface-dim': '#DCD9D9',
                'surface-bright': '#FCF9F8',
                'surface-container-lowest': '#FFFFFF',
                'surface-container-low': '#F6F3F2',
                'surface-container': '#F0EDED',
                'surface-container-high': '#EAE7E7',
                'surface-container-highest': '#E4E2E1',
                'on-surface': '#1B1C1C',
                'on-surface-variant': '#414845',
                'inverse-surface': '#303030',
                'inverse-on-surface': '#F3F0F0',
                outline: '#717975',
                'outline-variant': '#C0C8C3',
                'surface-tint': '#3D6659',

                primary: '#3D6659',
                'on-primary': '#FFFFFF',
                'primary-container': '#8BB6A6',
                'on-primary-container': '#1F483C',
                'inverse-primary': '#A4D0BF',

                secondary: '#5A5F5E',
                'on-secondary': '#FFFFFF',
                'secondary-container': '#DEE4E2',
                'on-secondary-container': '#606564',

                tertiary: '#5D5F5D',
                'on-tertiary': '#FFFFFF',
                'tertiary-container': '#ACADAB',
                'on-tertiary-container': '#3F4140',

                error: '#BA1A1A',
                'on-error': '#FFFFFF',
                'error-container': '#FFDAD6',
                'on-error-container': '#93000A',

                'primary-fixed': '#BFECDB',
                'primary-fixed-dim': '#A4D0BF',
                'on-primary-fixed': '#002118',
                'on-primary-fixed-variant': '#254E41',

                'secondary-fixed': '#DEE4E2',
                'secondary-fixed-dim': '#C2C8C6',
                'on-secondary-fixed': '#171D1C',
                'on-secondary-fixed-variant': '#424847',

                'tertiary-fixed': '#E2E3E1',
                'tertiary-fixed-dim': '#C6C7C5',
                'on-tertiary-fixed': '#1A1C1B',
                'on-tertiary-fixed-variant': '#454746',

                background: '#FCF9F8',
                'on-background': '#1B1C1C',
                'surface-variant': '#E4E2E1',
            },
            fontFamily: {
                atkinson: ['Atkinson Hyperlegible Next'],
            },
            fontSize: {
                'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em' }],
                'headline-lg-mobile': ['28px', { lineHeight: '36px' }],
                'headline-md': ['24px', { lineHeight: '32px' }],
                'body-lg': ['20px', { lineHeight: '30px' }],
                'body-md': ['18px', { lineHeight: '28px' }],
                'label-lg': ['18px', { lineHeight: '24px', letterSpacing: '0.02em' }],
                'label-md': ['16px', { lineHeight: '20px' }],
            },
            fontWeight: {
                regular: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
            },
            spacing: {
                'margin-mobile': '24px',
                'gutter-mobile': '16px',
                'stack-sm': '12px',
                'stack-md': '24px',
                'stack-lg': '40px',
                'touch-target': '56px',
            },
            borderRadius: {
                sm: '0.25rem',
                DEFAULT: '0.5rem',
                md: '0.75rem',
                lg: '1rem',
                xl: '1.5rem',
                full: '9999px',
            },
            boxShadow: {
                soft: '0px 8px 24px rgba(61, 102, 89, 0.12)',
            },
        },
    },
    plugins: [],
}
