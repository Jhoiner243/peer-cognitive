import { NodeInformation } from "./node-information.entity"

export interface OriginRange {
  start: number
  end: number
  answerObjectId: string
  nodeIds: string[]
}

//Es una lista de todas las veces que ese nodo apareció en el texto.
export interface NodeEntityIndividual extends NodeInformation {
  originRange: OriginRange
  originText: string
}