import { OriginRange } from "../types/entities/nodes/node-individual.entity"

/* 
Su propósito es encontrar la oración exacta en la que se encuentra una entidad, lo que es crucial para mostrar el contexto correcto en la interfaz.
*/
export const findEntitySentence = (
  originRange: OriginRange,
  answer: string,
) => {
  const sentenceStart = answer.lastIndexOf('.', originRange.start) + 1
  const sentenceEnd = answer.indexOf('.', originRange.end)
  const sentence = answer.slice(sentenceStart, sentenceEnd + 1)
  return sentence
}