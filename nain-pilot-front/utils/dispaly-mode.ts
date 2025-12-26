import { AnswerObjectEntitiesTarget } from "../types/answer";
import { ListFormatsDisplayType } from "../types/enums/list-formats-display";

/* 
Su propósito es decidir qué campo de texto debe usarse para procesar las entidades nodos y aristas dependiendo de cómo el usuario está visualizando la respuesta en ese momento.
*/
export const listDisplayToEntityTarget = (listDisplay: ListFormatsDisplayType): AnswerObjectEntitiesTarget => {
    return {
      original: 'originText',
      summary: 'summary',
      slide: 'slide'
    }[listDisplay] as AnswerObjectEntitiesTarget
}