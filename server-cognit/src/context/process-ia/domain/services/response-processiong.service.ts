import { EdgeRegexConstant } from "../constants/edge-regex.constanst";
import { NodeRegexConstant } from "../constants/node-regex.constanst";
import { EdgePair } from "../entities/edges/edge-information.entity";
import { EdgeEntity } from "../entities/edges/edge.entity";
import { NodeEntityIndividual } from "../entities/nodes/node-individual.entity";
import { ParseSaliencyValueObject } from "../value-objects/parse-saliency.value-object";
import { TypeAnnotationsService } from "./type-annotations.service";

export class ResponseProcessingService {
  constructor(
    private readonly typeAnnotationsService: TypeAnnotationsService
  ) {}

  /* 
  el proceso de rehidratación de metadatos. Convierte una cadena de texto plana que contiene "marcas" (anotaciones) en objetos de programación ricos que el frontend puede usar para dibujar y crear interactividad.
  */
  parseNodes (
    annotatedNodeString: string,
    answerObjectId: string,
  ): NodeEntityIndividual[] {
    const matches = [...annotatedNodeString.matchAll(NodeRegexConstant.nodeAnnotationRegex)]

    return matches.map(match => ({
      nodeLabel: match[1],
      id: match[2],
      originRange: {
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
        answerObjectId,
        nodeIds: [match[2]]
      },
      originText: match[0]
    }))
  }

  parseEdges (
    annotatedEdgeString: string,
    answerObjectId: string,
  ): EdgeEntity[] {
    const matches = [...annotatedEdgeString.matchAll(EdgeRegexConstant.edgeAnnotationRegex)]

    return matches.map(match => {
      const edgeLabel = match[1]
      const edgePairs = match[2]
      .split(';')
      .map(pair => {
        const nodes = pair.split(',').map(node => node.trim())
        
        if(nodes.length !== 3) return null

        return {
          saliency: ParseSaliencyValueObject.parseSaliency(nodes[0]),
          sourceId: nodes[1],
          targetId: nodes[2]
        }
      })
      .filter(pair => pair !== null) as EdgePair[]

      return {
        edgeLabel,
        edgePairs,
        originRange: {
          start: match.index ?? 0,
          end: (match.index ?? 0) + match.length,
          answerObjectId,
          nodeIds: [
            ...new Set(edgePairs.flatMap(pair => [pair.sourceId, pair.targetId]))
          ]
        },
        originText: match[0]
      }
    })
  }
}