import { SplitAnnotationsApplicationService } from "../split-annotations-sentences/split-annotations.application-service"

export class CleanStreamedAnnotationsServiceApplication {
    cleanStreamedAnnotationsRealtime(streamedInput: string) {
        const cleanSegment = new SplitAnnotationsApplicationService().splitAnnotationsSentences(streamedInput)
        return cleanSegment
    }   
}