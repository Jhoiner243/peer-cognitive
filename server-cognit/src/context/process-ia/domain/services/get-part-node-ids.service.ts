import { AnnotationsTypeEnum } from "../enums/annotations.enum";
import { ResponseProcessingService } from "./response-processiong.service";
import { TypeAnnotationsService } from "./type-annotations.service";

//Este servicio actúa como un extractor de IDs
export class GetPartNodeIdsService {
    constructor(
      private readonly responseProcessingService: ResponseProcessingService
    ) {}

    getPartNodeIds(part: string): string[] {
        const partType = TypeAnnotationsService.getAnnotationType(part)

        if(partType === AnnotationsTypeEnum.NODE) {
           return this.responseProcessingService.parseNodes(part, '')?.map(node => node.id) ?? []
        }

        if(partType === AnnotationsTypeEnum.EDGE) {
           return this.responseProcessingService.parseEdges(part, '')[0]?.originRange.nodeIds ?? []
        }

        return []
    }
}