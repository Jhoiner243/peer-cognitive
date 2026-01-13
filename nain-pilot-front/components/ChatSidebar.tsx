"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar"
import { useAIStream } from "@/hooks/use-ai-stream"
import { Bot, Send, User } from "lucide-react"
import * as React from "react"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { generate, streaming, currentResponse } = useAIStream()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, currentResponse])

  const handleSend = () => {
    if (!inputValue.trim() || streaming) return

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: inputValue }])
    
    // Trigger generation
    generate(inputValue)
    
    setInputValue("")
  }

  // Handle stream completion or updates
  // Since useAIStream doesn't give us a "history" but just the current chunked response,
  // we display the currentResponse while streaming.
  // When streaming ends, we should persist it.
  // BUT: useAIStream interface in previous step didn't explicitly signal "end" via state cleanly 
  // other than `streaming` going false.
  // Let's watch `streaming`. 
  
  // Actually, a better pattern might be:
  // Render messages normally.
  // if (streaming && currentResponse), render a partial assistant message.
  
  // When streaming goes from true to false, append the final response.
  const wasStreaming = React.useRef(false)
  
  React.useEffect(() => {
    if (wasStreaming.current && !streaming && currentResponse) {
       setMessages(prev => [...prev, { role: 'assistant', content: currentResponse }])
    }
    wasStreaming.current = streaming
  }, [streaming, currentResponse])

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <ScrollArea  className=" h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`rounded-lg p-3 max-w-[85%] text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Streaming Message */}
            {streaming && currentResponse && (
              <div className="flex gap-3 flex-row">
                 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="rounded-lg p-3 max-w-[85%] text-sm bg-muted/50 animate-pulse">
                    {currentResponse}
                 </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <form
          onSubmit={(e) => {
             e.preventDefault()
             handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask something..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={streaming}
          />
          <Button type="submit" size="icon" disabled={streaming || !inputValue.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
