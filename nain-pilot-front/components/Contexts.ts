import { createContext } from 'react'
import { AnswerObject, QuestionAndAnswerSynced } from '../types/answer'

export interface Prompt {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ModelStatus {
  modelAnswering: boolean
  modelParsing: boolean
  modelAnsweringComplete: boolean
  modelParsingComplete: boolean
  modelError: boolean
  modelInitialPrompts: Prompt[]
}

export type ModelForMagic = 'gpt-5' | 'gpt-3.5-turbo'

export interface QuestionAndAnswer {
  id: string
  question: string
  answer: string
  answerObjects: AnswerObject[]
  modelStatus: ModelStatus
  synced: QuestionAndAnswerSynced
}


export interface ChatContextType {
  questionsAndAnswersCount: number
  setQuestionsAndAnswers: (
    questionsAndAnswers:
      | QuestionAndAnswer[]
      | ((prev: QuestionAndAnswer[]) => QuestionAndAnswer[]),
  ) => void
}
export const ChatContext = createContext<ChatContextType>({} as ChatContextType)

/* -------------------------------------------------------------------------- */

export interface FlowContextType {
  metaPressed: boolean
  model: ModelForMagic
  selectedComponents: {
    nodes: string[]
    edges: string[]
  }
  initialSelectItem: {
    selected: boolean
    type: 'node' | 'edge'
    id: string
  }
  doSetNodesEditing: (nodeIds: string[], editing: boolean) => void
  doSetEdgesEditing: (edgeIds: string[], editing: boolean) => void
  selectNodes: (nodeIds: string[]) => void
  setModel: (model: ModelForMagic) => void
}
export const FlowContext = createContext<FlowContextType>({} as FlowContextType)
