"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Heart, Wrench, Clock, MapPin } from "lucide-react"
import type { MatchReason } from "@/types"

const REASON_OPTIONS: { reason: MatchReason; icon: React.ElementType }[] = [
  { reason: "Goede zaak",         icon: Heart },
  { reason: "Past bij mijn skills", icon: Wrench },
  { reason: "Flexibele tijden",   icon: Clock },
  { reason: "Dichtbij mij",       icon: MapPin },
]

interface MatchReasonSheetProps {
  open: boolean
  onSelect: (reason: MatchReason) => void
  onCancel: () => void
}

export function MatchReasonSheet({ open, onSelect, onCancel }: MatchReasonSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-10 max-w-lg mx-auto shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <h3 className="text-lg font-bold text-gray-900 mb-1">Waarom like je deze vacature?</h3>
            <p className="text-sm text-gray-500 mb-5">Kies de reden die het beste past</p>

            <div className="space-y-3">
              {REASON_OPTIONS.map(({ reason, icon: Icon }) => (
                <button
                  key={reason}
                  onClick={() => onSelect(reason)}
                  className="w-full flex items-center gap-4 px-4 py-4 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-2xl text-left transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{reason}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onCancel}
              className="w-full mt-4 py-3 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Annuleren
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
