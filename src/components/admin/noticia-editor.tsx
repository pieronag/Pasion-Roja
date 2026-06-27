'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface NoticiaEditorProps { content: string; onChange: (html: string) => void; }

export function NoticiaEditor({ content, onChange }: NoticiaEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escribe la noticia aquí...' }),
    ],
    content: content || '',
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] px-4 py-3 text-[var(--text)] prose-headings:text-[var(--text)] prose-a:text-[var(--accent)] prose-strong:text-[var(--text)] prose-li:text-[var(--text-secondary)]' },
    },
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
  });

  const toggleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Negrita' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Cursiva' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), label: 'Subtítulo' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), label: 'Lista' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), label: 'Lista ordenada' },
    { icon: LinkIcon, action: toggleLink, active: editor.isActive('link'), label: 'Enlace' },
  ];

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button key={tool.label} type="button" onClick={tool.action} className={cn('p-1.5 rounded-[var(--radius-xs)] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center', tool.active ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]')} title={tool.label}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
