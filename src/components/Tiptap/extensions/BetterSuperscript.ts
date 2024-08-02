import Superscript from '@tiptap/extension-superscript'

export const BetterSuperscript = Superscript.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-.': () => {
        if (
          this.editor.isActive('superscript') ||
          !this.editor.isActive('subscript')
        )
          return this.editor.commands.toggleSuperscript()

        return this.editor
          .chain()
          .focus()
          .unsetSubscript()
          .setSuperscript()
          .run()
      }
    }
  }
})
