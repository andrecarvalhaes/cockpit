/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F26600',
          hover: '#D95B00',
        },
        text: {
          primary: '#1f2028',
          secondary: '#718096',
          light: '#FFFFFF',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F6F7F9',
          submenu: '#f8f9fa',
        },
        border: {
          DEFAULT: '#E0E0E0',
        },
        success: {
          DEFAULT: '#48C74C',
          hover: '#3DAF41',
        },
        error: '#DE5C40',
        warning: '#ecc94b',
        neutral: '#CCCCCC',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
