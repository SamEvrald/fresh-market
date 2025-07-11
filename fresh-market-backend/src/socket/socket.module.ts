// src/socket/socket.module.ts
import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway],
  exports: [SocketGateway], // 👈 export so others can use it
})
export class SocketModule {}
