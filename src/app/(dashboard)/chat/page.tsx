"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { ConversationList } from "@/components/chat/conversation-list"
import { MessagePanel } from "@/components/chat/message-panel"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import type { MatchWithDetails } from "@/types"

function ChatPageInner() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    searchParams.get("conversationId") ?? undefined
  )
  const [showPanel, setShowPanel] = useState(!!searchParams.get("conversationId"))

  useEffect(() => {
    const id = searchParams.get("conversationId")
    if (id) {
      setSelectedConversationId(id)
      setShowPanel(true)
    }
  }, [searchParams])

  function handleSelect(conversationId: string, _match: MatchWithDetails) {
    setSelectedConversationId(conversationId)
    setShowPanel(true)
  }

  const currentUserId = session?.user?.id ?? ""

  return (
    <div className="flex h-[calc(100dvh-9rem-env(safe-area-inset-bottom))] bg-white">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-80 border-r border-gray-200 flex flex-col ${showPanel ? "hidden sm:flex" : "flex"}`}
      >
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Berichten
          </h1>
        </div>
        <ConversationList selectedId={selectedConversationId} onSelect={handleSelect} />
      </div>

      {/* Message panel */}
      <div className={`flex-1 flex flex-col ${!showPanel ? "hidden sm:flex" : "flex"}`}>
        {selectedConversationId && currentUserId ? (
          <>
            {/* Mobile back button */}
            <div className="sm:hidden p-3 border-b border-gray-100 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug
              </Button>
            </div>
            <MessagePanel
              conversationId={selectedConversationId}
              currentUserId={currentUserId}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Selecteer een gesprek</h3>
              <p className="text-sm text-gray-500">
                Kies een gesprek uit de lijst om te beginnen
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]">Laden...</div>}>
      <ChatPageInner />
    </Suspense>
  )
}
