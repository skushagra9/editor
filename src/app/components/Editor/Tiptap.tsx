'use client'

import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useEditorInstance } from '../../hooks/useEditorInstance'
import { Toolbar } from './Toolbar'
import { BubbleMenuAI } from './BubbleMenu'

const Tiptap = () => {
  const editor = useEditorInstance()
  const [showAIMenu, setShowAIMenu] = useState(false)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [originalSelection, setOriginalSelection] = useState<{ from: number; to: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const processWithAI = async (action: string) => {
    if (!editor || !editor.isActive) return
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    if (!selectedText) return alert('Please select some text first')

    setOriginalSelection({ from, to })
    setIsProcessing(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ text: selectedText, action }),
      })
      const data = await res.json()
      setAiPreview(data.result)
      setAction(action)
    } catch (err) {
      console.error('AI error:', err)
    } finally {
      setIsProcessing(false)
      setShowAIMenu(false)
    }
  }

  const applyAIChange = () => {
    if (!editor || !aiPreview || !originalSelection) return
    if (action === 'link') {
      editor.chain().focus().setTextSelection(originalSelection).setLink({ href: aiPreview }).run()
    } else {
      editor.chain().focus().setTextSelection(originalSelection).deleteSelection().insertContent(aiPreview).run()
    }
    setAiPreview(null)
    setOriginalSelection(null)
    setAction(null)
  }

  const cancelAIChange = () => {
    setAiPreview(null)
    setOriginalSelection(null)
    setAction(null)
  }

  return (
    <div className="relative max-w-3xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Assignment Editor</h1>
      {editor && (
        <>
          <Toolbar editor={editor} />
          <BubbleMenuAI
            editor={editor}
            showAIMenu={showAIMenu}
            setShowAIMenu={setShowAIMenu}
            aiPreview={aiPreview}
            isProcessing={isProcessing}
            processWithAI={processWithAI}
            applyAIChange={applyAIChange}
            cancelAIChange={cancelAIChange}
            action={action}
          />
          <div className="border border-gray-200 rounded-lg p-4 min-h-[500px]">
            <EditorContent editor={editor} />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Tip: Select text to see formatting options and AI tools.</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Tiptap
