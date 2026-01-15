"use client"

import { KnowledgeGraph } from "@/components/KnowledgeGraph"
import { TextAreaPrompts } from "@/components/TextAreaPrompts"

export default function Home() {
  return (
     <div className="flex flex-1 flex-col gap-3 p-4 pt-0 h-full">
       <div className="flex-1 rounded-xl bg-card border shadow-sm min-h-0 overflow-hidden">
          <KnowledgeGraph />
       </div>
       <div className="shrink-0">
         <TextAreaPrompts />
       </div>
     </div>
  )
}