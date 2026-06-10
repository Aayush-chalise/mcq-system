function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs font-semibold rounded',
    md: 'px-3 py-1 text-sm font-semibold rounded-full',
  }

  return (
    <span className={`${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export default Badge
