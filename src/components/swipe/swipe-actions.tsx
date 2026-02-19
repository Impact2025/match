"use client"

import { motion } from "framer-motion"
import { X, Heart, Star, Undo2 } from "lucide-react"

interface SwipeActionsProps {
  onDislike: () => void
  onLike: () => void
  onSuperLike: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
}

export function SwipeActions({ onDislike, onLike, onSuperLike, onUndo, canUndo, disabled }: SwipeActionsProps) {
  return (
    <div className="flex items-center justify-center gap-5">
      {/* Undo */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          onClick={onUndo}
          disabled={disabled || !canUndo}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border-2 border-amber-100 text-amber-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Ongedaan maken"
        >
          <Undo2 className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide">UNDO</span>
      </div>

      {/* Dislike */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          onClick={onDislike}
          disabled={disabled}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border-2 border-red-100 text-red-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Niet interessant"
        >
          <X className="w-7 h-7" strokeWidth={2.5} />
        </motion.button>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide">NOPE</span>
      </div>

      {/* Super like – smaller, centre */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          onClick={onSuperLike}
          disabled={disabled}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border-2 border-blue-100 text-blue-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Super like"
        >
          <Star className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide">SUPER</span>
      </div>

      {/* Like */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.08 }}
          onClick={onLike}
          disabled={disabled}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-200 text-white hover:from-orange-600 hover:to-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Interessant!"
        >
          <Heart className="w-7 h-7 fill-white" strokeWidth={0} />
        </motion.button>
        <span className="text-[10px] font-medium text-gray-400 tracking-wide">LEUK!</span>
      </div>
    </div>
  )
}
