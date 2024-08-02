import Subscript from '@tiptap/extension-subscript'

export const BetterSubscript = Subscript.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-,': () => {
        if (
          this.editor.isActive('subscript') ||
          !this.editor.isActive('superscript')
        )
          return this.editor.commands.toggleSubscript()

        return this.editor
          .chain()
          .focus()
          .unsetSuperscript()
          .setSubscript()
          .run()
      }
    }
  }
})
