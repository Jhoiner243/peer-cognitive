import { NodeEntityIndividual } from "./node-individual.entity"


/* 
Es el objeto unico en el grafo
 */
export interface NodeEntity {
  id: string
  displayNodeLabel: string
  pseudo: boolean
  individuals: NodeEntityIndividual[]
}