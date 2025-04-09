'use client'

import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useEditorInstance } from '../../hooks/useEditorInstance'
import { Toolbar } from './Toolbar'
import { BubbleMenuAI } from './BubbleMenu'

const Tiptap = () => {
  const editor = useEditorInstance()
  const [showAIMenu, setShowAIMenu] = useState(false)
  const [aiPreview, setAiPreview] = useState<{
    line: string
    range: [number, number]
  } | null>(null)
    const [originalSelection, setOriginalSelection] = useState<{ from: number; to: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<string | null>(null)

  const processWithAI = async (action: string) => {
    if (!editor || !editor.isActive) return;
  
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const paragraphNode = editor.state.doc.resolve(from).parent;
    const paragraphText = paragraphNode.textContent;
  
    if (!selectedText.trim()) return alert('Please select some text first');
  
    setOriginalSelection({ from, to });
    setAction(action); // ✅ Set this early
    setIsProcessing(true);
  
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ text: selectedText, action, paragraphText }),
      });
  
      const data = await res.json();
  
      if (action === 'link' && data.result?.range && data.result?.url) {
        setAiPreview({ line: data.result.url, range: data.result.range });
      } else if (
        (action === 'rewrite' || action === 'simplify') &&
        data.result?.replacementRange
      ) {
        const { updatedParagraph, replacementRange } = data.result;
        const rewrittenLine = updatedParagraph.substring(
          replacementRange[0],
          replacementRange[1]
        );
        setAiPreview({ line: rewrittenLine, range: replacementRange });
      }
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsProcessing(false);
      setShowAIMenu(false);
    }
  };
  
  
  const applyAIChange = () => {
    if (!editor || !aiPreview || !originalSelection) return;
  
    const { from } = originalSelection;
    const paragraphPos = editor.state.doc.resolve(from);
    const paragraphStart = from - paragraphPos.parentOffset;
    const [startOffset, endOffset] = aiPreview.range;
  
    const fromPos = paragraphStart + startOffset;
    const toPos = paragraphStart + endOffset;
  
    const chain = editor.chain().focus().setTextSelection({ from: fromPos, to: toPos });
  
    if (action === 'link') {
      chain.setLink({ href: aiPreview.line }).run();
    } else if (action === 'rewrite' || action === 'simplify') {
      chain.deleteSelection().insertContent(aiPreview.line).run();
    }
  
    cancelAIChange();
  };
  
  const cancelAIChange = () => {
    setAiPreview(null)
    setOriginalSelection(null)
    setAction(null)
    setShowAIMenu(false)
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
            aiPreview={aiPreview?.line ?? null}
            setAiPreview={setAiPreview}
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
