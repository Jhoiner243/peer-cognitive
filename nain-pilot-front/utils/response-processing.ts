import { AnswerObject, RelationshipSaliency } from "../types/answer";
import { EdgeEntity } from "../types/entities/edges/edge.entity";
import { OriginRange } from "../types/entities/nodes/node-individual.entity";
import { NodeEntity } from "../types/entities/nodes/node.entity";
import { listDisplayToEntityTarget } from "./dispaly-mode";

/* 
Su misión es localizar toda la información técnica de un nodo específico como su etiqueta o sus coordenadas de texto buscando a través de toda la historia de la conversación.
*/
export const findEntityFromAnswerObject = (answerObject: AnswerObject[], entityId: string) => {
    const entity = answerObject
      .map(answer => 
        answer[
          listDisplayToEntityTarget(answer.answerObjectSynced.listDisplay)
        ].nodeEntities
      ).flat()
      .find(entityFromId => entityFromId.id === entityId)
    return entity
}

/* 
Su propósito es determinar si una relación tiene mayor relevancia que otra, lo que es crucial para filtrar y mostrar las conexiones más significativas en la interfaz.
*/
export const saliencyAHigherThanB = (
  sA: RelationshipSaliency,
  sB: RelationshipSaliency,
) => {
  if (sA === 'high' && sB === 'low') return true
  if (sA === 'high' && sB === 'high') return false
  if (sA === 'low' && sB === 'low') return false
  return false
}

/* 
Indentifica aristas que intentan conectar nodos que no existen en la lista actual de entidades
*/
export const findNowhereEdgeEntities = (
  nodeEntities: NodeEntity[],
  edgeEntities: EdgeEntity[],
) => {
  return edgeEntities.filter(edgeEntity => {
    // at least one in edgeEntity.edgePairs has a source or target that is not in nodeEntities
    return edgeEntity.edgePairs.some(edgePair => {
      return (
        nodeEntities.find(nodeEntity => nodeEntity.id === edgePair.sourceId) ===
          undefined ||
        nodeEntities.find(nodeEntity => nodeEntity.id === edgePair.targetId) ===
          undefined
      )
    })
  })
}

/* 
Esta función es un Limpiador de Markdown o Sanitizador de Bloques de Código
*/
export const cleanSlideResponse = (slideResponse: string) => {
  // remove ``` at the beginning and end, if there is any
  const cleanedSlideResponse = slideResponse
    .replace(/^```/, '')
    .replace(/```$/, '')
  return cleanedSlideResponse
}

/* 
Su propósito es encontrar el rango completo de texto (inicio y fin) a partir de una única posición inicial.
*/
export const getRangeFromStart = (
  start: number,
  nodeEntities: NodeEntity[],
  edgeEntities: EdgeEntity[],
): OriginRange | undefined => {
  for (const nodeEntity of nodeEntities) {
    for (const individual of nodeEntity.individuals) {
      if (individual.originRange.start === start) {
        return individual.originRange
      }
    }
  }

  for (const edgeEntity of edgeEntities) {
    if (edgeEntity.originRange.start === start) {
      return edgeEntity.originRange
    }
  }
}
