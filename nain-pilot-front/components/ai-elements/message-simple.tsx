"use client"

import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import * as React from "react"

export type MessageProps = React.HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant"
}

export const Message = ({ className, from, children, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-sm",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
      "group-[.is-assistant]:text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export type MessageResponseProps = React.HTMLAttributes<HTMLDivElement>

export const MessageResponse = React.memo(
  ({ className, children, ...props }: MessageResponseProps) => (
    <div
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose prose-sm max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
)

MessageResponse.displayName = "MessageResponse"

export type MessageAvatarProps = {
  from: "user" | "assistant"
  className?: string
}

export const MessageAvatar = ({ from, className }: MessageAvatarProps) => (
  <div
    className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
      from === "user" 
        ? "bg-primary text-primary-foreground ring-2 ring-primary/20" 
        : "bg-muted text-muted-foreground ring-2 ring-muted/20",
      "group-hover:scale-105",
      className
    )}
  >
    {from === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
  </div>
)