"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { useRef, useCallback } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
  List, ListOrdered, Link as LinkIcon, ImageIcon, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Loader2,
} from "lucide-react"
import { useState } from "react"

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-orange-500 underline" } }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Typ je bericht hier…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
  })

  const addLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL:", prev ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload?type=emailImage", { method: "POST", body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run()
      }
    } finally {
      setUploadingImage(false)
    }
  }, [editor])

  if (!editor) return null

  const ToolBtn = ({
    onClick, active, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-orange-100 text-orange-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  )

  const Sep = () => <span className="w-px h-5 bg-gray-200 mx-1 self-center" />

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Koptekst 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Koptekst 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolBtn>

        <Sep />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Vet (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Cursief (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Onderstrepen (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolBtn>

        <Sep />

        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Links uitlijnen"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centreren"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Rechts uitlijnen"
        >
          <AlignRight className="w-4 h-4" />
        </ToolBtn>

        <Sep />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Opsomming"
        >
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Genummerde lijst"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Link invoegen">
          <LinkIcon className="w-4 h-4" />
        </ToolBtn>

        <ToolBtn
          onClick={() => fileInputRef.current?.click()}
          title="Afbeelding uploaden"
        >
          {uploadingImage
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ImageIcon className="w-4 h-4" />}
        </ToolBtn>

        <Sep />

        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Ongedaan maken (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Opnieuw (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div className="tiptap-content bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageUpload(file)
            e.target.value = ""
          }
        }}
      />
    </div>
  )
}
