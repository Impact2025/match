import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { MessageWithSender } from "@/types"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isSystem = message.type === "SYSTEM"
  const time = new Date(message.createdAt).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-orange-50 border border-orange-100 rounded-full px-4 py-2 text-sm text-orange-700 text-center italic max-w-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-end gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
          <AvatarImage src={message.sender.image ?? ""} alt={message.sender.name ?? ""} />
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-bold">
            {message.sender.name?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isOwn
              ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-br-sm"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-400 px-1">{time}</span>
      </div>
    </div>
  )
}
