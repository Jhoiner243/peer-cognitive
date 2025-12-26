import { EdgeEntity } from "./entities/edges/edge.entity"
import { NodeEntity } from "./entities/nodes/node.entity"
import { ListFormatsDisplayType } from "./enums/list-formats-display"
export type AnswerObjectEntitiesTarget = 'originText' | 'summary'

export interface AnswerSlideObject {
  content: string
}

export type RelationshipSaliency = 'high' | 'low'

export interface SentenceInAnswer {
  originalText: string
  offset: number
  length: number
}

export interface AnswerObject {
  id: string
  originText: {
    content: string
    nodeEntities: NodeEntity[]
    edgeEntities: EdgeEntity[]
  }
  summary: {
    content: string
    nodeEntities: NodeEntity[]
    edgeEntities: EdgeEntity[]
  }
  slide: AnswerSlideObject
  answerObjectSynced: {
    listDisplay: ListFormatsDisplayType
    saliencyFilter: RelationshipSaliency
    collapsedNodes: string[]
    sentencesBeingCorrected: SentenceInAnswer[]
  }
  complete: boolean
}