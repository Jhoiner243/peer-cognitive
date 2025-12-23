import { RelationshipSaliency } from "../entities/edges/edge-information.entity"

export class ParseSaliencyValueObject {
  public static parseSaliency = (saliency: string): RelationshipSaliency => {
    if (saliency === '$H') return 'high'
    if (saliency === '$L') return 'low'
    return 'high' // ?
  }
}