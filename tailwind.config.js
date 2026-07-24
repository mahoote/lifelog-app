/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    safelist: [
        'bg-blue-400',
        'bg-blue-500',
        'active:bg-blue-600',
        'bg-red-400',
        'bg-red-500',
        'active:bg-red-600',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {},
    },
    plugins: [],
}
