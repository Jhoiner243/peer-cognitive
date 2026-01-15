"use client"

import { Message, MessageAvatar, MessageContent, MessageResponse } from "@/components/ai-elements/message-simple"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarRail
} from "@/components/ui/sidebar"
import { useMessages } from "@/contexts/MessagesContext"
import { useAIStream } from "@/hooks/use-ai-stream"
import { Bot } from "lucide-react"
import * as React from "react"

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { streaming, currentResponse } = useAIStream()
  const { messages, setMessages } = useMessages()
  
  const wasStreaming = React.useRef(false)
  
  React.useEffect(() => {
    if (wasStreaming.current && !streaming && currentResponse) {
       setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }])
    }
    wasStreaming.current = streaming
  }, [streaming, currentResponse, setMessages])

  return (
    <Sidebar {...props} className="border-r bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b bg-sidebar-header/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-sidebar-foreground">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>

      <SidebarContent className="p-0">
        <ScrollArea className="h-full px-4">
          <div className="py-4 space-y-4">
            {messages.length === 0 && !streaming && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-sm text-sidebar-foreground mb-1">Start a conversation</h4>
                <p className="text-xs text-muted-foreground">Ask me anything about your data</p>
              </div>
            )}
            
             {messages.filter(msg => msg.role === 'assistant').map((msg, i) => (
               <Message key={i} from="assistant">
                 <div className="flex gap-3 group animate-in slide-in-from-bottom-2 fade-in-0 flex-row">
                   <MessageAvatar from="assistant" />
                   <MessageContent className="max-w-[85%] shadow-sm">
                     <MessageResponse className="text-sm leading-relaxed">{currentResponse}</MessageResponse>
                   </MessageContent>
                 </div>
               </Message>
             ))}
            
             {streaming && currentResponse && (
               <Message from="assistant" className="h-screen">
                 <div className="flex gap-3 flex-row animate-in slide-in-from-bottom-2">
                   <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 ring-2 ring-muted/20">
                   </div>
                   <MessageContent className="max-w-[85%] shadow-sm">
                     <MessageResponse className="text-sm leading-relaxed">
                       {currentResponse}
                       <span className="inline-block w-2 h-4 bg-muted animate-pulse ml-1" />
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
