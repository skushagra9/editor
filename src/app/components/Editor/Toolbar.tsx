'use client'

import { Editor } from '@tiptap/react'
import { Bold, Italic, RotateCcw } from 'lucide-react'

export const Toolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="rounded-md mb-4 p-2 flex items-center gap-2 bg-gray-900 text-white">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 rounded hover:bg-gray-700 disabled:opacity-50"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  )
}
