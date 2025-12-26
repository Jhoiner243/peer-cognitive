/* 
Este servicio es un Segmentador de Texto Sensible al Contexto. Su función es dividir la respuesta del LLM en oraciones individuales, pero con una regla de oro: nunca romper una anotación por la mitad.
*/
export class SplitAnnotationsApplicationService {
    splitAnnotationsSentences(text: string): string[] {
      const sentences: string[] = []   
      let sentenceStart = 0
      let inAnnotation = false

      for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (char === '['){
          inAnnotation = true
        }else if (char === ']') {
          inAnnotation = false
        }

        if(!inAnnotation && char === '.' && (i === text.length - 1  || text[i + 1].match(/\s/))){
          sentences.push(text.slice(sentenceStart, i + 1))
          sentenceStart = i + 1
        }
      }

      if( sentenceStart < text.length ) {
        sentences.push(text.slice(sentenceStart))
      }

      return sentences
    }   
}