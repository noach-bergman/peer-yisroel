export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''} ${className}`}>
      {children}
    </div>
  )
}
