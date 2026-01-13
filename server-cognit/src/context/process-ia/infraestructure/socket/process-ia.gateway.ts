import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as crypto from 'crypto';
import { Server, Socket } from 'socket.io';
import { CleanStreamedAnnotationsServiceApplication } from '../../application/services/cleaned-stream/clean-streamed-annotations.application-service';
import { predefinedPrompts } from '../../domain/prompts';
import { ResponseProcessingService } from '../../domain/services/response-processiong.service';
import { GroqService } from '../ai/groq.service';

@WebSocketGateway({ cors: true })
export class ProcessIAGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly groqService: GroqService,
    private readonly cleanService: CleanStreamedAnnotationsServiceApplication,
    private readonly responseProcessingService: ResponseProcessingService
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('process-query')
  async handleProcessQuery(client: Socket, payload: { prompt: string }) {
    try {
      // Use the predefined prompt to structure the query
      const messages = predefinedPrompts.initialAsk(payload.prompt);
      
      const result = await this.groqService.streamResponse(messages);
      let fullResponse = '';
      const answerObjectId = crypto.randomUUID(); // Unique ID for this answer/session

      for await (const textPart of result.textStream) {
        fullResponse += textPart;
        
        // Emit the raw chunk
        client.emit('stream-raw', textPart);

        // Clean and emit text for chat
        const cleanChunk = this.cleanService.cleanStreamedAnnotationsRealtime(textPart);
        if (cleanChunk) {
            client.emit('stream-text', cleanChunk);
        }

        // Try to parse graph updates periodically or just send the whole thing?
        // Parsing partial text might be unstable if the annotation is cut off.
        // But let's try to parse the FULL accumulated response every time (or maybe throttled).
        // Since the regex matches "complete" annotations, incomplete ones at the end effectively won't match yet.
        
        const nodes = this.responseProcessingService.parseNodes(fullResponse, answerObjectId);
        const edges = this.responseProcessingService.parseEdges(fullResponse, answerObjectId);
        
        console.log('Nodes:', nodes);
        console.log('Edges:', edges);
        // DEBUG LOGS
        if (nodes.length > 0) console.log(`Parsed ${nodes.length} nodes`);
        if (edges.length > 0) console.log(`Parsed ${edges.length} edges`);

        client.emit('debug-graph', { 
            responseLength: fullResponse.length, 
            nodesCount: nodes.length, 
            edgesCount: edges.length 
        });

        if (nodes.length > 0 || edges.length > 0) {
            console.log(`[Gateway] Emitting graph-update to client ${client.id}:`, {
              nodeCount: nodes.length,
              edgeCount: edges.length
            });
            client.emit('graph-update', { nodes, edges });
            console.log('[Gateway] graph-update emitted successfully');
        } else {
            console.log('[Gateway] No nodes or edges to emit');
        }
      }
      
      client.emit('stream-finish', 'done');

    } catch (error) {
      console.error('Error processing query:', error);
      client.emit('error', 'Failed to process query');
    }
  }
}
