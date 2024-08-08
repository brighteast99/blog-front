import colors from 'tailwindcss/colors'
import { createThemes } from 'tw-colors'

delete colors.lightBlue
delete colors.warmGray
delete colors.trueGray
delete colors.coolGray
delete colors.blueGray

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        50: '12.5rem',
        100: '25rem',
        120: '30rem',
        '1/10': '10%',
        '3/10': '30%'
      },
      colors: {
        transparent: 'transparent'
      },
      transitionProperty: {
        border: 'border',
        margin: 'margin',
        colors:
          'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke opacity',
        size: 'width, height, font-size',
        position: 'margin, top, right, bottom, left',
        placeholder: 'top, right, bottom, left, font-size, color'
      }
    }
  },
  plugins: [
    createThemes(
      {
        light: {
          ...colors,
          primary: '#43a047',
          secondary: '#6d4c41',
          info: '#4397c7',
          success: '#367c3c',
          warning: '#ee8e34',
          error: '#ba271a',
          foreground: '#000000',
          background: '#ffffff',
          shadow: '#d4d4d4'
        },
        dark: {
          ...colors,
          slate: {
            50: '#27313e',
            100: '#2f3c4b',
            200: '#344558',
            300: '#3c5268',
            400: '#496480',
            500: '#5c7d9b',
            600: '#7d99b3',
            700: '#aabdcf',
            800: '#d2dbe5',
            900: '#ebeff3',
            950: '#f5f7fa'
          },
          gray: {
            50: '#2a313a',
            100: '#333d47',
            200: '#394653',
            300: '#425262',
            400: '#516578',
            500: '#667d91',
            600: '#8599ab',
            700: '#b0bdc9',
            800: '#d5dce2',
            900: '#eceff2',
            950: '#f6f8f9'
          },
          zinc: {
            50: '#242426',
            100: '#3b3b3e',
            200: '#434347',
            300: '#4d4d51',
            400: '#5a5b60',
            500: '#696971',
            600: '#85878b',
            700: '#aeafb2',
            800: '#cfd0d2',
            900: '#e6e6e7',
            950: '#f5f5f6'
          },
          neutral: {
            50: '#1a1a1a',
            100: '#2a2a2a',
            200: '#353535',
            300: '#404040',
            400: '#555555',
            500: '#606060',
            600: '#7a7a7a',
            700: '#a0a0a0',
            800: '#c1c1c1',
            900: '#e7e7e7',
            950: '#f6f6f6'
          },
          stone: {
            50: '#23211f',
            100: '#3f3c3a',
            200: '#494541',
            300: '#544e4a',
            400: '#645c56',
            500: '#756a65',
            600: '#908580',
            700: '#b6afaa',
            800: '#d4d0cd',
            900: '#e8e6e5',
            950: '#f6f5f5'
          },
          red: {
            50: '#660d0d',
            100: '#811b1b',
            200: '#9b1919',
            300: '#bc1919',
            400: '#df2323',
            500: '#f24141',
            600: '#fa6f6f',
            700: '#fea3a3',
            800: '#ffc9c9',
            900: '#ffe1e1',
            950: '#fef2f2'
          },
          orange: {
            50: '#461204',
            100: '#66210a',
            200: '#a1300b',
            300: '#cb3c03',
            400: '#f55301',
            500: '#ff700b',
            600: '#ff9032',
            700: '#ffb96d',
            800: '#ffd7a6',
            900: '#ffedd3',
            950: '#fff7ec'
          },
          amber: {
            50: '#4b1700',
            100: '#662604',
            200: '#9e3b02',
            300: '#c44e00',
            400: '#ed7400',
            500: '#ffa000',
            600: '#ffc410',
            700: '#ffd93c',
            800: '#ffeb7f',
            900: '#fff5c2',
            950: '#fffce9'
          },
          yellow: {
            50: '#471e01',
            100: '#633009',
            200: '#974909',
            300: '#ba5f03',
            400: '#e18800',
            500: '#fdb203',
            600: '#ffd21c',
            700: '#ffe347',
            800: '#fff186',
            900: '#fff8c5',
            950: '#fffcea'
          },
          lime: {
            50: '#173500',
            100: '#254607',
            200: '#3a7004',
            300: '#478e00',
            400: '#5dbc00',
            500: '#7beb00',
            600: '#9bff17',
            700: '#b9ff4c',
            800: '#d7ff8d',
            900: '#ebffc3',
            950: '#f7ffe3'
          },
          green: {
            50: '#073f1d',
            100: '#14532c',
            200: '#166532',
            300: '#15803b',
            400: '#16a347',
            500: '#22c55a',
            600: '#4ade7d',
            700: '#86efaa',
            800: '#bbf7cf',
            900: '#dcfce6',
            950: '#f0fdf4'
          },
          emerald: {
            50: '#03392b',
            100: '#074d3a',
            200: '#075e44',
            300: '#057755',
            400: '#069566',
            500: '#11b87d',
            600: '#35d296',
            700: '#6fe6b4',
            800: '#a8f2ce',
            900: '#d1fae4',
            950: '#ecfdf5'
          },
          teal: {
            50: '#003537',
            100: '#064544',
            200: '#026d6c',
            300: '#008a86',
            400: '#00aea6',
            500: '#00d7c9',
            600: '#0df4e3',
            700: '#43fff0',
            800: '#87fff5',
            900: '#c3fff9',
            950: '#eefffc'
          },
          cyan: {
            50: '#00374c',
            100: '#0a455a',
            200: '#096581',
            300: '#0080a1',
            400: '#00a0c8',
            500: '#00cbee',
            600: '#08e9ff',
            700: '#54f8ff',
            800: '#9afdff',
            900: '#c9fffe',
            950: '#eaffff'
          },
          sky: {
            50: '#082d49',
            100: '#0b4165',
            200: '#075585',
            300: '#0364a1',
            400: '#027ec7',
            500: '#0e9ee9',
            600: '#38b7f8',
            700: '#7dcffc',
            800: '#bae4fd',
            900: '#e0f1fe',
            950: '#f0f9ff'
          },
          blue: {
            50: '#152756',
            100: '#1a3e8e',
            200: '#1944b4',
            300: '#1754de',
            400: '#1f6bf1',
            500: '#358afc',
            600: '#5bacff',
            700: '#90caff',
            800: '#bddeff',
            900: '#daecff',
            950: '#eef7ff'
          },
          indigo: {
            50: '#1f214c',
            100: '#252965',
            200: '#32369b',
            300: '#373fbe',
            400: '#4151cf',
            500: '#556ddc',
            600: '#7591e5',
            700: '#a2b7ee',
            800: '#c8d3f5',
            900: '#e0e6f9',
            950: '#f1f4fd'
          },
          violet: {
            50: '#2a1065',
            100: '#3f1a85',
            200: '#5421b6',
            300: '#6528d9',
            400: '#743aed',
            500: '#845cf6',
            600: '#a28bfa',
            700: '#c1b5fd',
            800: '#dbd6fe',
            900: '#ece9fe',
            950: '#f4f3ff'
          },
          purple: {
            50: '#32096c',
            100: '#451085',
            200: '#6315c2',
            300: '#7719e8',
            400: '#852bfc',
            500: '#914fff',
            600: '#aa82ff',
            700: '#c6afff',
            800: '#ded3ff',
            900: '#ede7ff',
            950: '#f5f2ff'
          },
          fuchsia: {
            50: '#440053',
            100: '#551065',
            200: '#7b1197',
            300: '#9512b9',
            400: '#b01adf',
            500: '#c83afb',
            600: '#dc70ff',
            700: '#e8a5ff',
            800: '#f0cdff',
            900: '#f8e6ff',
            950: '#fbf3ff'
          },
          pink: {
            50: '#4e092d',
            100: '#651540',
            200: '#9a1a5f',
            300: '#ba1c73',
            400: '#d62c8f',
            500: '#e84cae',
            600: '#f175c7',
            700: '#f7aade',
            800: '#fad0ee',
            900: '#fbe8f6',
            950: '#fdf2f9'
          },
          rose: {
            50: '#4c0519',
            100: '#881334',
            200: '#9f123a',
            300: '#be1242',
            400: '#e11d54',
            500: '#f43f72',
            600: '#fb7198',
            700: '#fda4bd',
            800: '#fecddb',
            900: '#ffe4ec',
            950: '#fff1f5'
          },
          primary: '#9ccc65',
          secondary: '#bcaaa4',
          info: '#5da9d3',
          success: '#499e50',
          warning: '#f1a046',
          error: '#de3324',
          background: '#202020',
          foreground: '#ffffff',
          shadow: '#171717'
        }
      },
      {
        defaultTheme: {
          light: 'light',
          dark: 'dark'
        }
      }
    )
  ]
}
