import { createGroq } from '@ai-sdk/groq';
import { Injectable } from '@nestjs/common';
import { streamText } from 'ai';

@Injectable()
export class GroqService {
  private groq = createGroq({
    apiKey: process.env.GROQ_API_KEY as string,
  });

  async streamResponse(messages: any[]): Promise<any> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set');
    }
    
    try {
      const result = streamText({
        model: this.groq('llama-3.3-70b-versatile'),
        messages: messages,
        
        temperature: 0.7,
      });
      return result;
    } catch (error) {
      console.error('Groq interaction failed:', error);
      throw error;
    }
  }
}
