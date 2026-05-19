import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { useEffect } from 'react'

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: ({ fontSize }) => fontSize ? { style: `font-size:${fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

const EXTENSIONS = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color,
  FontSize,
]

const FONT_SIZES = [
  { label: 'Small', value: '14px' },
  { label: 'Normal', value: '18px' },
  { label: 'Large', value: '22px' },
  { label: 'XLarge', value: '28px' },
]

function Toolbar({ editor }) {
  if (!editor) return null

  const btn = (active, fn, content, title) => (
    <button type="button" onClick={fn} title={title}
      className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${active ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      {content}
    </button>
  )

  const iconBtn = (active, fn, Icon, title) => (
    <button type="button" onClick={fn} title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon size={14} />
    </button>
  )

  const sep = <div className="w-px h-4 bg-gray-200 mx-1" />

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <b>B</b>, 'Bold')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <i>I</i>, 'Italic')}
      {sep}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', 'Heading 2')}
      {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', 'Heading 3')}
      {sep}
      <select
        onChange={e => {
          if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run()
          else editor.chain().focus().unsetFontSize().run()
        }}
        className="rounded border border-gray-200 bg-white text-xs text-gray-600 px-1.5 py-1 focus:outline-none focus:border-brand-gold transition-colors"
        title="Font size">
        <option value="">Size</option>
        {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {sep}
      {iconBtn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), AlignLeft, 'Align left')}
      {iconBtn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), AlignCenter, 'Center')}
      {iconBtn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), AlignRight, 'Align right')}
      {sep}
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List', 'Bullet list')}
      {sep}
      <label className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer" title="Text color">
        <span className="font-bold text-base leading-none" style={{ color: editor.getAttributes('textStyle').color || '#162A55' }}>A</span>
        <input
          type="color"
          defaultValue="#162A55"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
        />
      </label>
      <button type="button" onClick={() => editor.chain().focus().unsetColor().run()}
        className="px-1.5 py-1 rounded text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Reset color">
        ✕
      </button>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, dir = 'rtl', placeholder = '' }) {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: value || '',
    editorProps: {
      attributes: {
        class: `min-h-[160px] focus:outline-none p-4 text-gray-800 leading-relaxed`,
        dir,
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || ''
    if (current !== incoming && incoming !== '<p></p>') {
      editor.commands.setContent(incoming, false)
    }
  }, [value, editor])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-brand-gold focus-within:ring-2 focus-within:ring-brand-gold/20 transition-all bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
