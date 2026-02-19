"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ShieldCheck, X } from "lucide-react"
import Link from "next/link"

interface MatchModalProps {
  open: boolean
  matchId?: string
  conversationId?: string
  orgName?: string
  orgLogo?: string
  userImage?: string
  onClose: () => void
}

export function MatchModal({
  open,
  conversationId,
  orgName,
  orgLogo,
  userImage,
  onClose,
}: MatchModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-orange-500 flex flex-col items-center justify-center px-8 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-black">V</span>
              </div>
              <span className="text-white text-xs font-semibold tracking-wide">
                VRIJWILLIGERSMATCH.NL
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Profile circles */}
          <div className="relative flex items-center justify-center mb-8">
            {/* User photo */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-orange-300 relative z-10"
            >
              {userImage ? (
                <img src={userImage} alt="Jij" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-200">
                  <span className="text-orange-600 text-4xl font-black">J</span>
                </div>
              )}
            </motion.div>

            {/* Heart badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.5, duration: 0.4, times: [0, 0.6, 1] }}
              className="absolute z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
              <span className="text-orange-500 text-lg leading-none">♥</span>
            </motion.div>

            {/* Org logo */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.15 }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-blue-100"
            >
              {orgLogo ? (
                <img src={orgLogo} alt={orgName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-200">
                  <span className="text-blue-700 text-4xl font-black">
                    {orgName?.charAt(0)?.toUpperCase() ?? "O"}
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* MATCH! */}
          <motion.h1
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.4 }}
            className="text-6xl font-black text-white italic mb-3 tracking-tight"
          >
            MATCH!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-white/90 text-center text-base leading-relaxed mb-10 max-w-xs"
          >
            Jij en{" "}
            <span className="font-semibold">{orgName ?? "de organisatie"}</span> zijn
            een match! Jullie gaan samen impact maken.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-xs space-y-3"
          >
            {conversationId ? (
              <Link
                href={`/chat?conversationId=${conversationId}`}
                className="flex items-center justify-center gap-2 w-full bg-white/25 border border-white/50 text-white font-semibold py-4 rounded-2xl hover:bg-white/35 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Direct een bericht sturen
              </Link>
            ) : (
              <Link
                href="/matches"
                className="flex items-center justify-center gap-2 w-full bg-white/25 border border-white/50 text-white font-semibold py-4 rounded-2xl hover:bg-white/35 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Bekijk mijn matches
              </Link>
            )}

            <button
              onClick={onClose}
              className="w-full bg-transparent text-white/80 font-medium py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors"
            >
              Nog meer swipen
            </button>
          </motion.div>

          {/* Verified badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-8 flex items-center gap-1.5 text-white/50 text-xs tracking-wide"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            VERIFIED MATCH
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
