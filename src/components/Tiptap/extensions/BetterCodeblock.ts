import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import django from 'highlight.js/lib/languages/django'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import pgsql from 'highlight.js/lib/languages/pgsql'
import { common, createLowlight } from 'lowlight'

import { BetterCodeBlockNodeView } from '../nodeViews/BetterCodeblockNodeView'

export const Languages = [
  { name: 'Bash', value: 'bash' },
  { name: 'C', value: 'c' },
  { name: 'C++', value: 'cpp' },
  { name: 'CSS', value: 'css' },
  { name: 'Django', value: 'django' },
  { name: 'Dockerfile', value: 'dockerfile' },
  { name: 'GraphQL', value: 'graphql' },
  { name: 'INI', value: 'ini' },
  { name: 'Java', value: 'java' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'JSON', value: 'json' },
  { name: 'Markdown', value: 'markdown' },
  { name: 'Nginx', value: 'nginx' },
  { name: 'PostgreSQL', value: 'pgsql' },
  { name: 'Plain text', value: 'plaintext' },
  { name: 'Python', value: 'python' },
  { name: 'SCSS', value: 'scss' },
  { name: 'Shell Session', value: 'shell' },
  { name: 'SQL', value: 'sql' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'HTML, XML', value: 'xml' },
  { name: 'YAML', value: 'yaml' }
] as const

export type CodeBlockLanguage = (typeof Languages)[number]['value']

const lowlight = createLowlight(common)
lowlight.register({ django, dockerfile, nginx, pgsql })

declare module '@tiptap/extension-code-block-lowlight' {
  interface CodeBlockLowlightOptions {
    minHeight: number | string
    resizable: boolean
  }
}

export const BetterCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: { renderHTML: ({ height }) => ({ height }) }
    }
  },
  addOptions() {
    return {
      ...this.parent?.(),
      minHeight: '4.25rem',
      resizable: true
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(BetterCodeBlockNodeView)
  }
}).configure({ lowlight })
