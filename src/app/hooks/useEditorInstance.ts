'use client'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Paragraph from '@tiptap/extension-paragraph'
import Link from '@tiptap/extension-link'

export const useEditorInstance = () => {
  return useEditor({
    extensions: [
      StarterKit,
      Paragraph,
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        isAllowedUri: (url, ctx) => {
          try {
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)
            const protocol = parsedUrl.protocol.replace(':', '')
            if (!ctx.defaultValidate(parsedUrl.href)) return false
            if (!ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme)).includes(protocol)) return false
            const disallowedProtocols = ['ftp', 'file', 'mailto']
            if (disallowedProtocols.includes(protocol)) return false
            const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
            if (disallowedDomains.includes(parsedUrl.hostname)) return false
            return true
          } catch {
            return false
          }
        },
        shouldAutoLink: url => {
          try {
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)
            const domain = parsedUrl.hostname
            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
            return !disallowedDomains.includes(domain)
          } catch {
            return false
          }
        },
      }),
    ],
    content: `<p>This is a new article. You can start editing it right away.</p>
              <p>Use the sidebar to add tags, set a focus keyword, and customize your article's metadata.</p>
              <p>I am writing a blog post and I wanted to learn about the world even more than I do now.</p>`,
  })
}
