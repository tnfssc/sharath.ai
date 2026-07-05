import { marked } from 'marked'
import hljs from 'highlight.js'

// Syntax-highlight fenced code blocks with highlight.js.
marked.use({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(text, { language }).value
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    },
    image({ href, title, text }) {
      const alt = text ?? ''
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img src="${href}" alt="${alt}"${titleAttr} referrerpolicy="no-referrer" loading="lazy" />`
    },
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens)
      // Slug from the plain-text rendering (strip tags) for shareable URLs
      // and in-page anchor smooth-scroll (# anchor links emitted by markdown).
      const plain = inner.replace(/<[^>]+>/g, '').trim()
      const slug = plain
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return `<h${depth} id="${slug}">${inner}</h${depth}>\n`
    },
  },
})

/** Render a markdown string to HTML with syntax-highlighted code blocks. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}