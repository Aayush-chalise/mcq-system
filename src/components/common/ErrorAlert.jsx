import { motion } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

function ErrorAlert({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-600/20 border border-red-500/50 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-red-200">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition"
        >
          <X size={20} />
        </button>
      )}
    </motion.div>
  )
}

export default ErrorAlert
