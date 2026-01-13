import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProcessIAModule } from './context/process-ia/infraestructure/ai/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProcessIAModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
