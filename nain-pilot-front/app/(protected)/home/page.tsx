"use client"

import { KnowledgeGraph } from "@/components/KnowledgeGraph"

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
      <div className="flex-1 rounded-xl bg-muted/50 overflow-hidden border">
         <KnowledgeGraph />
      </div>
    </div>
  )
}