import { Module } from '@nestjs/common';
import { CleanStreamedAnnotationsServiceApplication } from '../../application/services/cleaned-stream/clean-streamed-annotations.application-service';
import { SplitAnnotationsApplicationService } from '../../application/services/split-annotations-sentences/split-annotations.application-service';
import { ResponseProcessingService } from '../../domain/services/response-processiong.service';
import { TypeAnnotationsService } from '../../domain/services/type-annotations.service';
import { ProcessIAGateway } from '../socket/process-ia.gateway';
import { GroqService } from './groq.service';

@Module({
  providers: [
    GroqService, 
    ProcessIAGateway,
    ResponseProcessingService,
    CleanStreamedAnnotationsServiceApplication,
    TypeAnnotationsService,
    SplitAnnotationsApplicationService
  ],
  exports: [GroqService],
})
export class ProcessIAModule {}