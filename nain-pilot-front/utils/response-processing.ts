import { AnswerObject, RelationshipSaliency } from "../types/answer";
import { EdgePair } from "../types/entities/edges/edge-information.entity";
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

/* 
Su objetivo es limpiar las etiquetas de los nodos para que el grafo sea visualmente más claro y profesional, eliminando artículos y determinantes que no aportan significado real al concepto.
*/
export const cleanNodeLabel = (label: string) => {
  // remove These, This, Those, That, A, An, The, Their, Its, etc.
  const cleanedLabel = label.replace(
    /^(these|this|those|that|a|an|the|their|its|his|her|their|our|my|your)\s/i,
    '',
  )

  return cleanedLabel
}

/* 
Esta función es un Detector de Continuidad en la Red. Su propósito es verificar si un nodo que actualmente es el "final" de una relación (un targetId) también actúa como el "origen" (sourceId) de otra relación en cualquier parte del grafo.
*/
export const pairTargetIdHasPair = (
  edgeEntities: EdgeEntity[],
  targetId: string,
) => {
  return edgeEntities.some(edgeEntity =>
    edgeEntity.edgePairs.some(edgePair => edgePair.sourceId === targetId),
  )
}


export const getNodeEntityFromNodeEntityId = (
  nodeEntities: NodeEntity[],
  id: string,
): NodeEntity | null => {
  const nodeEntity = nodeEntities.find(node => node.id === id)
  if (nodeEntity) return nodeEntity
  return null
}

export const havePair = (pairs: EdgePair[], pair: EdgePair) => {
  return pairs.some(
    p => p.sourceId === pair.sourceId && p.targetId === pair.targetId,
  )
}


export const getEntitySource = (entity: NodeEntity) => {
  const originRanges: OriginRange[] = []
  const originTexts: string[] = []
  entity.individuals.map(individual => {
    originRanges.push(individual.originRange)
    originTexts.push(individual.originText)

    return null
  })

  return {
    originRanges,
    originTexts,
  }
}

export const mergeNodeEntities = (
  answerObjects: AnswerObject[],
  answerObjectIdsHidden: string[],
) => {
  const nodeEntities: NodeEntity[] = []

  answerObjects.forEach(answerObject => {
    if (answerObjectIdsHidden.includes(answerObject.id)) return

    answerObject[
      listDisplayToEntityTarget(answerObject.answerObjectSynced.listDisplay)
    ].nodeEntities.forEach(nodeEntity => {
      const existingNode = nodeEntities.find(n => n.id === nodeEntity.id)

      if (existingNode) {
        existingNode.individuals.push(...nodeEntity.individuals)
      } else {
        nodeEntities.push(nodeEntity)
      }
    })
  })

  return nodeEntities
}

export const mergeEdgeEntities = (
  answerObjects: AnswerObject[],
  answerObjectIdsHidden: string[],
) => {
  const edgeEntities: EdgeEntity[] = []

  answerObjects.forEach(answerObject => {
    if (answerObjectIdsHidden.includes(answerObject.id)) return

    answerObject[
      listDisplayToEntityTarget(answerObject.answerObjectSynced.listDisplay)
    ].edgeEntities.forEach(edgeEntity => {
      edgeEntities.push(edgeEntity)
    })
  })

  return edgeEntities
}

export const splitAnnotatedSentences = (text: string): string[] => {
  const sentences: string[] = []
  let sentenceStart = 0
  let inAnnotation = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '[') {
      inAnnotation = true
    } else if (char === ']') {
      inAnnotation = false
    }

    if (
      !inAnnotation &&
      char === '.' &&
      (i === text.length - 1 || text[i + 1].match(/\s/))
    ) {
      sentences.push(text.slice(sentenceStart, i + 1))
      sentenceStart = i + 1
    }
  }

  if (sentenceStart < text.length) {
    sentences.push(text.slice(sentenceStart))
  }

  return sentences
}

export const findOrphanNodeEntities = (
  nodeEntities: NodeEntity[],
  edgeEntities: EdgeEntity[],
) => {
  return nodeEntities.filter(nodeEntity => {
    return (
      edgeEntities.find(edgeEntity =>
        edgeEntity.edgePairs.some(
          edgePair =>
            edgePair.sourceId === nodeEntity.id ||
            edgePair.targetId === nodeEntity.id,
        ),
      ) === undefined
    )
  })
}