import { NodeEntityIndividual } from "../entities/nodes/node-individual.entity";
import { NodeEntity } from "../entities/nodes/node.entity";

export class NodeIndividualsToNodeEntitiesService {
    NodeIndividualsToNodeEntities(nodeIndividuals: NodeEntityIndividual[]): NodeEntity[] {
      const nodeEntities: NodeEntity[] = []

      nodeIndividuals.forEach(node => {
        const existingNode = nodeEntities.find(nodeEntity => nodeEntity.id === node.id)

        if(existingNode) {
          existingNode.individuals.push(node)

          existingNode.displayNodeLabel = existingNode.individuals.reduce((acc, cur) => (cur.nodeLabel.length > acc.length ? cur.nodeLabel : acc), existingNode.displayNodeLabel)
        } else {
          nodeEntities.push({
            id: node.id,
            pseudo: false,
            displayNodeLabel: node.nodeLabel,
            individuals: [node]
          })
        }
      })

      return nodeEntities
    }

}