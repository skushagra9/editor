'use client'

import { BubbleMenu, Editor } from '@tiptap/react'
import { Bold, Italic, Sparkles, ChevronDown, Link as LinkIcon, FileText, X, Check } from 'lucide-react'

type AIPreview = {
  line: string
  range: [number, number]
} | null


interface Props {
  editor: Editor
  showAIMenu: boolean
  setShowAIMenu: (v: boolean) => void
  aiPreview: string | null
  setAiPreview: (v: AIPreview) => void
  isProcessing: boolean
  processWithAI: (action: string) => void
  applyAIChange: () => void
  
  cancelAIChange: () => void
  action: string | null
}

export const BubbleMenuAI = ({
  editor,
  showAIMenu,
  setShowAIMenu,
  aiPreview,
  setAiPreview,
  isProcessing,
  processWithAI,
  applyAIChange,
  cancelAIChange,
  action,
}: Props) => {
  console.log(action)
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex flex-col bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden text-black"
    >
      <div className="flex items-center">
        <button
          onClick={() => {
            setAiPreview(null)
            setShowAIMenu(!showAIMenu)
          }}
          className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-r border-gray-200"
        >
          <Sparkles size={16} />
          <span className="text-sm font-medium">Rewrite</span>
          <ChevronDown size={14} />
        </button>

        <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-2 hover:bg-gray-100">
          <Bold size={16} />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-2 hover:bg-gray-100">
          <Italic size={16} />
        </button>
        <button onClick={() => processWithAI('link')} className="p-2 hover:bg-gray-100">
          <LinkIcon size={16} />
        </button>
      </div>

      {showAIMenu && !aiPreview && (
        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-gray-200 rounded-md w-64 py-1 z-10">
          <button
            onClick={() => processWithAI('simplify')}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            disabled={isProcessing}
          >
            <FileText size={16} />
            <span className="text-sm">
              {isProcessing && action === 'simplify' ? 'Processing...' : 'Simplify'}
            </span>
          </button>
          <button
            onClick={() => processWithAI('rewrite')}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left"
            disabled={isProcessing}
          >
            <Sparkles size={16} />
            <span className="text-sm">
              {isProcessing && action === 'rewrite' ? 'Processing...' : 'Re-write'}
            </span>
          </button>
        </div>
      )}


      {aiPreview && (
        <div className="mt-1 bg-blue-50 border-t border-blue-100 p-2 max-w-md">
          <div className="text-xs text-blue-700 font-medium mb-1">AI Suggestion:</div>
          <div className="text-sm bg-white border border-blue-100 rounded p-2 mb-2 max-h-32 overflow-y-auto">
            {aiPreview}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={cancelAIChange} className="p-1 rounded bg-gray-100 hover:bg-gray-200" title="Cancel">
              <X size={14} />
            </button>
            <button
              onClick={applyAIChange}
              className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
              title="Apply"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      )}
    </BubbleMenu>
  )
}
