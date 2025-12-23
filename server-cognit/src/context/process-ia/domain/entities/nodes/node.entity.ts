import { NodeEntityIndividual } from "./node-individual.entity"

export interface OriginRange {
  start: number
  end: number
  answerObjectId: string
  nodeIds: string[]
}
/* 
Es el objeto unico en el grafo
 */
export interface NodeEntity {
  id: string
  displayNodeLabel: string
  pseudo: boolean
  individuals: NodeEntityIndividual[]
}