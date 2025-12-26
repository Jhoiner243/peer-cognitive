import { AnswerObject } from "../types/answer";
import { EdgeEntity } from "../types/entities/edges/edge.entity";
import { NodeEntity } from "../types/entities/nodes/node.entity";
import { listDisplayToEntityTarget } from "./dispaly-mode";

/* 
Esta función es el Consolidador del Estado Global. Es la encargada de tomar todas las piezas sueltas de la conversación y armar un rompecabezas único: el Grafo Global.
*/
export const mergeNodesEntities = (answerObjects: AnswerObject[], answerObjectIdsHidden: string[])   => {
    const nodeEntities: NodeEntity[] =  []
      
    answerObjects.forEach(answerObject => {
      if(answerObjectIdsHidden.includes(answerObject.id)) return
      
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

/* 
Su propósito es recolectar todas las relaciones flechas que el LLM ha identificado en los distintos mensajes de la conversación para crear un mapa de red completo.
*/
export const mergeEdgesEntities = (answerObjects: AnswerObject[], answerObjectIdsHidden: string[])   => {
   const edgeEntities: EdgeEntity[] = []

   answerObjects.forEach(answerObject => {
      if(answerObjectIdsHidden.includes(answerObject.id)) return 

      answerObject[
        listDisplayToEntityTarget(answerObject.answerObjectSynced.listDisplay)
      ].edgeEntities.forEach(edgeEntity => {
        edgeEntities.push(edgeEntity)
      })
   })
   return edgeEntities
  }
