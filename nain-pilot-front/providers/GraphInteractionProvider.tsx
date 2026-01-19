/**
 * Graph Interaction Provider
 * Provides context for managing graph state and interactions
 */

import React, { createContext, ReactNode, useCallback, useState } from 'react'
import { OriginRange } from '../components/Contexts'
import { QuestionAndAnswer, RelationshipSaliency } from '../types/answer'

export interface GraphInteractionContextType {
  // Current question and answer state
  questionAndAnswer: QuestionAndAnswer | null
  
  // Highlighting
  highlightedNodeIds: string[]
  highlightedEdgeIds: string[]
  highlightedOriginRanges: OriginRange[]
  
  // Saliency filter
  saliencyFilter: RelationshipSaliency
  
  // Handlers
  setHighlightedNodeIds: (ids: string[]) => void
  setHighlightedEdgeIds: (ids: string[]) => void
  setHighlightedOriginRanges: (ranges: OriginRange[]) => void
  setSaliencyFilter: (filter: RelationshipSaliency) => void
  toggleSaliencyFilter: () => void
}

export const GraphInteractionContext = createContext<GraphInteractionContextType>({
  questionAndAnswer: null,
  highlightedNodeIds: [],
  highlightedEdgeIds: [],
  highlightedOriginRanges: [],
  saliencyFilter: 'low',
  setHighlightedNodeIds: () => {},
  setHighlightedEdgeIds: () => {},
  setHighlightedOriginRanges: () => {},
  setSaliencyFilter: () => {},
  toggleSaliencyFilter: () => {},
})

interface GraphInteractionProviderProps {
  children: ReactNode
  initialQuestionAndAnswer?: QuestionAndAnswer | null
}

export const GraphInteractionProvider: React.FC<GraphInteractionProviderProps> = ({ 
  children,
  initialQuestionAndAnswer = null 
}) => {
  const [questionAndAnswer] = useState<QuestionAndAnswer | null>(initialQuestionAndAnswer)
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([])
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>([])
  const [highlightedOriginRanges, setHighlightedOriginRanges] = useState<OriginRange[]>([])
  const [saliencyFilter, setSaliencyFilter] = useState<RelationshipSaliency>('low')

  const toggleSaliencyFilter = useCallback(() => {
    setSaliencyFilter(prev => prev === 'high' ? 'low' : 'high')
  }, [])

  const value: GraphInteractionContextType = {
    questionAndAnswer,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightedOriginRanges,
    saliencyFilter,
    setHighlightedNodeIds,
    setHighlightedEdgeIds,
    setHighlightedOriginRanges,
    setSaliencyFilter,
    toggleSaliencyFilter,
  }

  return (
    <GraphInteractionContext.Provider value={value}>
      {children}
    </GraphInteractionContext.Provider>
  )
}
