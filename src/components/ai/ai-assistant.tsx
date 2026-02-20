"use client"

import { useRef, useState, useEffect, useCallback } from "react"

export type NovaMode = "presale" | "dashboard"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}

interface AiAssistantProps {
  mode: NovaMode
}

const SUGGESTIONS: Record<NovaMode, string[]> = {
  presale: [
    "Hoe werkt de matching?",
    "Is het platform gratis?",
    "Welke categorieën zijn er?",
    "Hoe meld ik me aan als organisatie?",
  ],
  dashboard: [
    "Hoe kan ik mijn profiel verbeteren?",
    "Hoe werkt de matchscore?",
    "Help me met een openingszin",
    "Wat betekent het VFI-profiel?",
  ],
}

// Inline SVG icons — no lucide-react import for bundle size
function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zm14 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
      />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  )
}

function TypingCursor() {
  return (
    <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse align-middle" />
  )
}

export function AiAssistant({ mode }: AiAssistantProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = SUGGESTIONS[mode]

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [input])

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      setError(null)
      setShowSuggestions(false)

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
      }

      const assistantId = `assistant-${Date.now()}`
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
      }

      const updatedMessages = [...messages, userMsg]
      setMessages([...updatedMessages, assistantMsg])
      setInput("")
      setIsStreaming(true)

      abortRef.current = new AbortController()

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const errMsg =
            res.status === 429
              ? "Te veel berichten. Wacht even en probeer opnieuw."
              : data.error ?? "Er is een fout opgetreden."
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: errMsg, streaming: false } : m
            )
          )
          setError(errMsg)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) return

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""

          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data) as { delta?: string; error?: string }
              if (parsed.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: parsed.error!, streaming: false }
                      : m
                  )
                )
                return
              }
              if (parsed.delta) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + parsed.delta }
                      : m
                  )
                )
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errMsg = "Verbinding verbroken. Controleer je internet."
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: errMsg, streaming: false } : m
            )
          )
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
        )
        setIsStreaming(false)
      }
    },
    [messages, mode, isStreaming]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    setOpen(false)
  }

  // Positioning differs by mode
  const btnPosition =
    mode === "dashboard"
      ? "fixed bottom-24 right-4 z-50"
      : "fixed bottom-6 right-6 z-50"
  const panelPosition =
    mode === "dashboard"
      ? "fixed bottom-[calc(6rem+5.5rem)] right-4 z-50"
      : "fixed bottom-24 right-6 z-50"

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className={`${panelPosition} flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden`}
          style={{ width: "min(360px, calc(100vw - 2rem))", height: "min(520px, 60svh)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <IconSparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Nova</p>
                <p className="text-[10px] text-orange-100 leading-tight mt-0.5">
                  {mode === "dashboard" ? "Jouw vrijwilligerscoach" : "AI-assistent"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label="Sluiten"
            >
              <IconX className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center pt-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                  <IconSparkles className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Hoi! Ik ben Nova 👋</p>
                <p className="text-xs text-gray-500 max-w-[220px] mx-auto">
                  {mode === "dashboard"
                    ? "Jouw persoonlijke vrijwilligerscoach. Hoe kan ik je helpen?"
                    : "Stel me een vraag over Vrijwilligersmatch!"}
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <IconSparkles className="w-3 h-3 text-orange-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content || (msg.streaming ? "" : "…")}
                  {msg.streaming && <TypingCursor />}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {showSuggestions && messages.length === 0 && (
              <div className="pt-2 space-y-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 text-center px-2">{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-100 px-3 py-2 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Stel een vraag…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 border-0 outline-none bg-transparent py-1.5 max-h-[120px] disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="w-8 h-8 flex-shrink-0 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Versturen"
            >
              <IconSend className="w-3.5 h-3.5 text-white disabled:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <div className={btnPosition}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all"
          aria-label={open ? "Nova sluiten" : "Chat met Nova"}
        >
          {open ? (
            <IconX className="w-5 h-5 text-white" />
          ) : (
            <IconSparkles className="w-5 h-5 text-white" />
          )}
        </button>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        )}
      </div>
    </>
  )
}
