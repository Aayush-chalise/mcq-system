function Card({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
}) {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border-2 border-blue-600',
  }

  const hoverClass = hoverable ? 'hover:shadow-lg cursor-pointer transition-shadow' : ''

  return (
    <div
      className={`rounded-lg p-6 ${variants[variant]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
