import { OriginRange } from "../entities/nodes/node-individual.entity";
import { NodeEntity } from "../entities/nodes/node.entity";

/* 
Esta función es el Reclector de Huellas de un nodo. Su propósito es consolidar todas las pruebas físicas ubicaciones y texto exacto de dónde aparece un concepto a lo largo de toda la conversación.
*/
export class GetEntitySourceService {
  getEntitySource(
    entity: NodeEntity
  ){
    const originRanges: OriginRange[] = []
    const originTexts: string[] = []

    entity.individuals.map(individual => {
      originRanges.push(individual.originRange)
      originTexts.push(individual.originText)

      return null
    })

    return {
      originRanges,
      originTexts
    }
  }   
}