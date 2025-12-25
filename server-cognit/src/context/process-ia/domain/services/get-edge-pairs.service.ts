import { EdgePair } from "../entities/edges/edge-information.entity";

export class EdgeManagerService {
  /**
   * Agrega pares a una lista existente evitando duplicados
   */
  mergeUniquePairs(existingPairs: EdgePair[], newPairs: EdgePair[]): EdgePair[] {
    const unique = [...existingPairs];
    
    newPairs.forEach(newPair => {
      const exists = unique.some(p => 
        p.sourceId === newPair.sourceId && 
        p.targetId === newPair.targetId
      );
      
      if (!exists) {
        unique.push(newPair);
      }
    });
    
    return unique;
  }
}