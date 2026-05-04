"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Undo, 
  Redo,
  Quote,
  Code,
  Code2,
  Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  error?: string
}

export function TipTapEditor({ 
  value, 
  onChange, 
  placeholder = "Écrivez votre contenu ici...", 
  className,
  label,
  error 
}: TipTapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Éviter l'hydratation SSR
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[200px] max-w-none p-4",
          "rounded-b-lg",
          isFocused && "ring-2 ring-blue-500 ring-inset"
        ),
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    immediatelyRender: false, // Important pour éviter l'erreur SSR
  })

  // Mettre à jour le contenu quand value change
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!isMounted || !editor) {
    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Chargement de l'éditeur...</p>
          </div>
        </div>
      </div>
    )
  }

  const addImage = () => {
    const url = window.prompt('Entrez l\'URL de l\'image:')
    if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:'))) {
      editor.chain().focus().setImage({ src: url }).run()
    } else if (url) {
      alert('URL invalide. Veuillez entrer une URL valide (http:// ou https://)')
    }
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setShowLinkDialog(false)
      setLinkUrl('')
    }
  }

  const MenuButton = ({ onClick, isActive, children, disabled, title }: any) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0 transition-all",
        isActive && "bg-blue-100 text-blue-600",
        !disabled && "hover:bg-gray-200"
      )}
    >
      {children}
    </Button>
  )

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
        </label>
      )}
      
      <div className={cn(
        "border rounded-lg overflow-hidden bg-white transition-all",
        error ? "border-red-500" : "border-gray-200",
        isFocused && "ring-2 ring-blue-500 ring-inset"
      )}>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 sticky top-0 z-10">
          {/* Texte */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Gras (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italique (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Barré"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code inline"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Titres */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Titre 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Titre 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Titre 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Listes */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Blocs */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Citation"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Bloc de code"
          >
            <Code2 className="h-4 w-4" />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Insertion */}
          <MenuButton onClick={addImage} title="Insérer une image">
            <ImageIcon className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton onClick={() => setShowLinkDialog(true)} title="Insérer un lien (Ctrl+K)">
            <LinkIcon className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Ligne horizontale"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          {/* Historique */}
          <MenuButton 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          
          <MenuButton 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
        
        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Insérer un lien</h3>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="https://exemple.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={addLink} disabled={!linkUrl}>
                  Insérer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer avec raccourcis */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex gap-3">
          <span>Ctrl+B: Gras</span>
          <span>Ctrl+I: Italique</span>
          <span>Ctrl+K: Lien</span>
          <span>Ctrl+Z: Annuler</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Prêt</span>
        </div>
      </div>
    </div>
  )
}