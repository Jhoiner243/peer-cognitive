import { OriginRange } from "../nodes/node-individual.entity"
import { EdgeInformation } from "./edge-information.entity"

export interface EdgeEntity extends EdgeInformation {
  originRange: OriginRange
  originText: string
}