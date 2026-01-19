import React, { createContext, ReactNode, useContext, useState } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface MessagesContextType {
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  addMessage: (message: Message) => void
  clearMessages: () => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)
export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  console.log("Mensajes", messages)

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <MessagesContext.Provider value={{ messages, setMessages, addMessage, clearMessages }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
