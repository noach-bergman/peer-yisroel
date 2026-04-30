export default function Button({ children, variant = 'primary', className = '', asChild = false, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-gold text-white hover:bg-brand-gold-hover',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white',
    'outline-inverse': 'border-2 border-white text-white hover:bg-white hover:text-brand-primary',
    ghost: 'text-brand-primary hover:bg-brand-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  if (asChild && props.href) {
    return (
      <a className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
