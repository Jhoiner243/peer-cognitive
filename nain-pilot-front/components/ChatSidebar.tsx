"use client"

import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message-simple"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar"
import { useMessages } from "@/contexts/MessagesContext"
import { useAIStream } from "@/hooks/use-ai-stream"
import { removeAnnotations } from "@/utils/chatUtils"
import { Bot } from "lucide-react"
import * as React from "react"

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { streaming, currentResponse } = useAIStream()
  const { messages, setMessages } = useMessages()
  
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const wasStreaming = React.useRef(false)

  React.useEffect(() => {
    if (wasStreaming.current && !streaming && currentResponse) {
       setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }])
    }
    wasStreaming.current = streaming
  }, [streaming, currentResponse, setMessages])

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages, currentResponse])

  return (
    <Sidebar {...props} className="border-l bg-sidebar h-screen">
      <SidebarContent className="p-4">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4">
          <div className="py-6 space-y-6">
            
            {/* Estado vacío */}
            {messages.length === 0 && !streaming && (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">AI Assistant</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ask me anything about your data. I can help with analysis and insights.
                </p>
              </div>
            )}
            
            {/* Historial de Mensajes */}
            {messages.map((msg, i) => (
              <Message key={`msg-${i}`} from={msg.role}>
                <div className={`flex gap-3 animate-in fade-in  duration-300 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <MessageContent >
                    <MessageResponse className="text-sm">
                      {msg.role === 'assistant' ? removeAnnotations(msg.content) : msg.content}
                    </MessageResponse>
                  </MessageContent>
                </div>
              </Message>
            ))}
            
            {/* Indicador de Streaming */}
            {streaming && currentResponse && (
              <Message from="assistant">
                <div className="flex gap-3 flex-row animate-in fade-in duration-200">
                  <MessageContent className=" bg-muted">
                    <MessageResponse className="text-sm">
                      {removeAnnotations(currentResponse)}
                      <span className="inline-block w-1.5 h-4 bg-primary/40 animate-pulse ml-1 align-middle" />
                    </MessageResponse>
                  </MessageContent>
                </div>
              </Message>
            )}


          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}