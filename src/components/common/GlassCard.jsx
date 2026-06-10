import { motion } from 'framer-motion'

function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
