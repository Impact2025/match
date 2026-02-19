"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { getPusherClient } from "@/lib/pusher"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { Skeleton } from "@/components/ui/skeleton"
import type { MessageWithSender } from "@/types"

interface MessagePanelProps {
  conversationId: string
  currentUserId: string
}

export function MessagePanel({ conversationId, currentUserId }: MessagePanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [localMessages, setLocalMessages] = useState<MessageWithSender[]>([])

  const { data: messages, isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: !!conversationId,
  })

  // Sync server messages to local state
  useEffect(() => {
    if (messages) setLocalMessages(messages)
  }, [messages])

  // Pusher subscription
  useEffect(() => {
    if (!conversationId) return

    let channel: ReturnType<ReturnType<typeof getPusherClient>["subscribe"]>
    try {
      const pusher = getPusherClient()
      channel = pusher.subscribe(`private-conversation-${conversationId}`)

      channel.bind("new-message", (data: { message?: MessageWithSender }) => {
        if (data.message) {
          setLocalMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === data.message!.id)) return prev
            return [...prev, data.message!]
          })
        }
      })
    } catch {
      // Pusher not configured — silently ignore
    }

    return () => {
      try {
        channel?.unbind_all()
        channel?.unsubscribe()
      } catch {
        // ignore
      }
    }
  }, [conversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages])

  const handleSend = useCallback(
    async (content: string) => {
      // Optimistic update
      const optimistic: MessageWithSender = {
        id: `temp-${Date.now()}`,
        content,
        type: "TEXT",
        conversationId,
        senderId: currentUserId,
        sender: { id: currentUserId } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setLocalMessages((prev) => [...prev, optimistic])

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId }),
      })

      if (res.ok) {
        const saved = await res.json()
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? saved : m))
        )
      } else {
        // Rollback optimistic
        setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      }
    },
    [conversationId, currentUserId]
  )

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
              <Skeleton className="h-10 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm">
              Nog geen berichten. Stuur een bericht om te beginnen!
            </p>
          </div>
        ) : (
          localMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  )
}
