import { Extension } from '@tiptap/core'

import '@tiptap/extension-text-style'

export type FontSizeOptions = {
  types: string[]
  sizeOptions: number[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Shrink the font size by one step
       */
      shrinkFontSize: () => ReturnType
      /**
       * Enlarge the font size by one step
       */
      enlargeFontSize: () => ReturnType
      /**
       * Set the font size (unit: rem)
       */
      setFontSize: (fontSize: number) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}

function parseFontSize(
  size: number | string | undefined,
  defaultSize: number = 1
): number {
  if (!size) return defaultSize

  if (typeof size === 'number') return size

  if (size.endsWith('rem')) return Number.parseFloat(size) * 1
  else return Number.parseFloat(size)
}

function approximateFontSize(size: number, options: number[]): number {
  if (!options.length) return size
  return options
    .toSorted((a, b) => Math.abs(a - size) - Math.abs(b - size))
    .shift() as number
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
      sizeOptions: [
        0.625, 0.75, 1, 1.126, 1.375, 1.75, 2, 2.375, 3, 3.75, 4.5, 5.5, 6.25
      ]
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}

              return { style: `font-size: ${attributes.fontSize}` }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      shrinkFontSize:
        () =>
        ({ chain, editor }) => {
          let currentSize = parseFontSize(
            editor.getAttributes('textStyle')?.fontSize as string | undefined
          )

          const options = this.options.sizeOptions
          currentSize = approximateFontSize(currentSize, options)
          const currentIndex = options.findIndex((size) => size === currentSize)

          return chain()
            .setFontSize(options[Math.max(0, currentIndex - 1)])
            .run()
        },
      enlargeFontSize:
        () =>
        ({ chain, editor }) => {
          let currentSize = parseFontSize(
            editor.getAttributes('textStyle')?.fontSize as string | undefined
          )

          const options = this.options.sizeOptions
          currentSize = approximateFontSize(currentSize, options)
          const currentIndex = options.findIndex((size) => size === currentSize)

          return chain()
            .setFontSize(
              options[Math.min(options.length - 1, currentIndex + 1)]
            )
            .run()
        },
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { fontSize: `${fontSize}rem` })
            .run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run()
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-,': () => this.editor.commands.shrinkFontSize(),
      'Mod-Shift-.': () => this.editor.commands.enlargeFontSize()
    }
  }
})
