import django from 'highlight.js/lib/languages/django'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import pgsql from 'highlight.js/lib/languages/pgsql'
import { common, createLowlight } from 'lowlight'

export const languages = [
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
]

export const lowlight = createLowlight(common)
lowlight.register({ django, dockerfile, nginx, pgsql })
