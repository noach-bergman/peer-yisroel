import { useEffect, useRef, useState } from 'react'
import { useEditMode } from '../contexts/EditModeContext'

export default function EditableText({
  field,
  scope = 'page',
  tag: Tag = 'span',
  className = '',
  multiline = false,
  inlineEditable = true,
  children,
  ...props
}) {
  const {
    isEditMode,
    isPreviewMode,
    getField,
    hasField,
    updateField,
  } = useEditMode()
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  const value = isEditMode ? getField(scope, field, children) : children
  const missing = isEditMode && !isPreviewMode && !hasField(scope, field)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current.select) inputRef.current.select()
    }
  }, [editing])

  if (!isEditMode || isPreviewMode || !inlineEditable) {
    return <Tag className={className} {...props}>{value}</Tag>
  }

  if (editing) {
    const sharedClass = `w-full min-w-[4rem] bg-white/95 !text-gray-900 border border-brand-gold outline-none resize-none rounded-md px-2 py-1 ${className}`
    return multiline ? (
      <textarea
        ref={inputRef}
        className={sharedClass}
        value={value}
        rows={4}
        onChange={(event) => updateField(scope, field, event.target.value)}
        onBlur={() => setEditing(false)}
      />
    ) : (
      <input
        ref={inputRef}
        className={sharedClass}
        value={value}
        onChange={(event) => updateField(scope, field, event.target.value)}
        onBlur={() => setEditing(false)}
      />
    )
  }

  const isInline = Tag === 'span' || Tag === 'strong' || Tag === 'em' || Tag === 'a'
  const Wrapper = isInline ? 'span' : 'div'

  return (
    <Wrapper className={`relative max-w-full ${isInline ? 'inline-block' : 'block'}`}>
      <Tag
        className={`${className} cursor-text rounded transition-all duration-200 hover:outline hover:outline-2 hover:outline-brand-gold hover:outline-offset-2 hover:shadow-[0_0_8px_rgba(184,148,63,0.4)] ${missing && !value ? 'min-h-[2.5rem] flex items-center' : ''}`}
        title="Click to edit"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setEditing(true)
        }}
        {...props}
      >
        {value || (missing ? (
          <span className="text-brand-gold/70 italic text-sm font-normal border border-dashed border-brand-gold/40 rounded px-3 py-1">
            לחץ להוספה...
          </span>
        ) : null)}
      </Tag>
      {missing && (
        <span className="absolute -top-3 end-0 z-[70] rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow">
          Missing
        </span>
      )}
    </Wrapper>
  )
}
