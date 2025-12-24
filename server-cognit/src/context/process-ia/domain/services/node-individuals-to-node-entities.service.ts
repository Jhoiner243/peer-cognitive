import { NodeEntityIndividual } from "../entities/nodes/node-individual.entity";
import { NodeEntity } from "../entities/nodes/node.entity";

export class NodeIndividualsToNodeEntitiesService {
  NodeIndividualsToNodeEntities(nodeIndividuals: NodeEntityIndividual[]): NodeEntity[] {
    const nodeMap = new Map<string, NodeEntity>();

    for (const individual of nodeIndividuals) {
      const existing = nodeMap.get(individual.id);

      if (existing) {
        existing.individuals.push(individual);
        // Heurística de etiqueta más larga
        if (individual.nodeLabel.length > existing.displayNodeLabel.length) {
          existing.displayNodeLabel = individual.nodeLabel;
        }
      } else {
        nodeMap.set(individual.id, {
          id: individual.id,
          pseudo: false,
          displayNodeLabel: individual.nodeLabel,
          individuals: [individual],
        });
      }
    }

    return Array.from(nodeMap.values());
  }
}