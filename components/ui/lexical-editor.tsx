'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { 
  $getRoot, 
  $getSelection,
  $isRangeSelection,
  EditorState,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  $createTextNode
} from 'lexical'
import type { LexicalEditor as LexicalEditorType } from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { HeadingNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Editor theme
const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside mb-2 pl-4',
    ul: 'list-disc list-inside mb-2 pl-4',
    listitem: 'mb-1 pl-2',
  },
}

// Toolbar plugin component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        1,
      ),
    )
  }, [editor, updateToolbar])

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const insertList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 rounded-t-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText('bold')}
        className={cn('h-8 w-8 p-0', isBold && 'bg-gray-200')}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText('italic')}
        className={cn('h-8 w-8 p-0', isItalic && 'bg-gray-200')}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => formatText('underline')}
        className={cn('h-8 w-8 p-0', isUnderline && 'bg-gray-200')}
        type="button"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertList('bullet')}
        className="h-8 w-8 p-0"
        type="button"
        title="Insert bullet list"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => insertList('number')}
        className="h-8 w-8 p-0"
        type="button"
        title="Insert numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Placeholder component
function Placeholder({ children }: { children: string }) {
  return (
    <div className="absolute top-4 left-4 text-gray-500 pointer-events-none select-none">
      {children}
    </div>
  )
}

interface LexicalEditorProps {
  onChange?: (content: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  content?: string
}

export function LexicalEditor({
  onChange,
  placeholder = 'Enter job description...',
  disabled = false,
  error = false,
  className,
  content,
}: LexicalEditorProps) {
  const didInit = useRef(false)

  const initialConfig = {
    namespace: 'JobDescriptionEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
    ],
    editable: !disabled,
    editorState: (editor: LexicalEditorType) => {
      if (!didInit.current && content) {
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          const paragraph = $createParagraphNode()
          paragraph.append($createTextNode(content))
          root.append(paragraph)
        })
        didInit.current = true
      }
    },
  }

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot()
      const textContent = root.getTextContent()
      onChange?.(textContent)
    })
  }

  return (
    <div className={cn('border rounded-md', error && 'border-red-500', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[120px] p-4 outline-none resize-none focus:ring-0"
              />
            }
            placeholder={<Placeholder>{placeholder}</Placeholder>}
            ErrorBoundary={() => <div className="text-red-500 p-4">Editor error occurred</div>}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>
    </div>
  )
} 