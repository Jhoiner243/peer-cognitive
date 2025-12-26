import { StreamCleaningAnnotationsRegexConstants } from "../../../domain/constants/stream-cleaning-annotations-regex.constants"

export class CleanStreamedAnnotationsServiceApplication {
    cleanStreamedAnnotationsRealtime(streamedInput: string) {
        const cleanSegment = streamedInput.replace(StreamCleaningAnnotationsRegexConstants.streamCleaningAnnotationRegex, '')
        return cleanSegment
    }   
}